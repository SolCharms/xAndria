use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{BountyContribution, BountyContributionState, Forum, Question, UserProfile};
use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_supplementor_profile: u8, bump_user_profile: u8, bump_question: u8, bump_bounty_pda: u8)]
pub struct SupplementQuestionBounty<'info> {

    // Forum
    #[account(has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    #[account(mut)]
    pub supplementor: Signer<'info>,

    // The supplementor profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), supplementor.key().as_ref()],
              bump = bump_supplementor_profile, has_one = forum, constraint = supplementor_profile.profile_owner == supplementor.key())]
    pub supplementor_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = forum, has_one = user_profile, has_one = question_seed)]
    pub question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"bounty_pda".as_ref(), question.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> SupplementQuestionBounty<'info> {

    fn transfer_payment_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.supplementor.key, self.forum_treasury.key, lamports),
            &[
                self.supplementor.to_account_info(),
                self.forum_treasury.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }

    fn transfer_bounty_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.supplementor.key, &self.bounty_pda.key(), lamports),
            &[
                self.supplementor.to_account_info(),
                self.bounty_pda.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }

    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.supplementor.key, &self.question.key(), lamports),
            &[
                self.supplementor.to_account_info(),
                self.question.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn supplement_question_bounty(ctx: Context<SupplementQuestionBounty>, supplemental_bounty_amount: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let forum_question_bounty_minimum: u64 = ctx.accounts.forum.forum_fees.forum_question_bounty_minimum;
    let bounty_contribution_rep: u64 = ctx.accounts.forum.reputation_matrix.bounty_contribution_rep;

    // Ensure Bounty has not yet been awarded
    let is_bounty_awarded = ctx.accounts.question.bounty_awarded;
    if is_bounty_awarded {
        return Err(error!(ErrorCode::BountyAlreadyAwarded));
    }

    // Ensure minimum bounty amount is contributed
    if supplemental_bounty_amount < forum_question_bounty_minimum {
        return Err(error!(ErrorCode::InvalidBountyAmount));
    }

    // Transfer fee for supplementing question
    let forum_question_fee = ctx.accounts.forum.forum_fees.forum_question_fee;

    if forum_question_fee > 0 {
        let bounty_bps_remainder = supplemental_bounty_amount % 10000;
        let bounty_amount_minus_remainder = supplemental_bounty_amount.try_sub(bounty_bps_remainder)?;
        let bounty_amount_minus_remainder_div_10000 = bounty_amount_minus_remainder.try_div(10000)?;
        let question_fee_due = bounty_amount_minus_remainder_div_10000.try_mul(forum_question_fee)?;

        ctx.accounts.transfer_payment_ctx(question_fee_due)?;
    }

    // Transfer the supplemental bounty amount to the question's bounty pda account
    ctx.accounts.transfer_bounty_ctx(supplemental_bounty_amount)?;

    // Calculate bounty contribution entry
    let bounty_contribution = BountyContribution {
        bounty_contributor: ctx.accounts.supplementor_profile.key(),
        bounty_amount: supplemental_bounty_amount,
        forum_bounty_minimum: forum_question_bounty_minimum,
        bounty_contribution_rep: bounty_contribution_rep,
        bounty_contribution_state: BountyContributionState::Available,
    };

    // Calculate total space required for the addition of the new data
    let new_data_bytes_amount: usize = ctx.accounts.question.to_account_info().data_len() + std::mem::size_of::<BountyContribution>();
    let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
    let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.question.to_account_info().lamports())?;

    // Transfer the required difference in Lamports to accommodate this increase in space
    ctx.accounts.pay_lamports_difference(lamports_difference)?;

    // Reallocate the question pda account with the proper byte data size
    ctx.accounts.question.to_account_info().realloc(new_data_bytes_amount, false)?;

    // Update question PDA's most recent engagement and bounty amount
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;
    question.bounty_amount.try_add_assign(supplemental_bounty_amount)?;
    question.bounty_contributions.push(bounty_contribution);

    // Update most recent engagement and increment total bounty contributed in supplementor profile's state account
    let supplementor_profile = &mut ctx.accounts.supplementor_profile;
    supplementor_profile.most_recent_engagement_ts = now_ts;
    supplementor_profile.total_bounty_contributed.try_add_assign(supplemental_bounty_amount)?;

    // Calculate question reputation score
    let bounty_amount_mod_minimum_remainder = supplemental_bounty_amount % forum_question_bounty_minimum;
    let bounty_amount_divisible_minimum = supplemental_bounty_amount.try_sub(bounty_amount_mod_minimum_remainder)?;
    let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_question_bounty_minimum)?;
    let question_bounty_rep = multiples_bounty_minimum.try_mul(bounty_contribution_rep)?;

    // Update reputation score in supplementor profile's state account
    supplementor_profile.reputation_score.try_add_assign(question_bounty_rep)?;

    msg!("Question PDA account with address {} supplemented with bounty amount of {}",
         ctx.accounts.question.key(), supplemental_bounty_amount);
    Ok(())
}
