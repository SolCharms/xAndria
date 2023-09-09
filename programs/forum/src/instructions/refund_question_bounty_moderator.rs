use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction::{self};

use crate::state::{BountyContribution, Forum, Question, UserProfile};
use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_question: u8, bump_bounty_pda: u8)]
pub struct RefundQuestionBountyModerator<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    #[account(mut)]
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question pda account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = forum, has_one = user_profile, has_one = question_seed)]
    pub question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK: The question bounty pda account
    #[account(mut, seeds = [b"bounty_pda".as_ref(), question.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

}

impl<'info> RefundQuestionBountyModerator<'info> {

    fn transfer_bounty_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.bounty_pda.key, self.profile_owner.key, lamports),
            &[
                self.bounty_pda.to_account_info(),
                self.profile_owner.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }

    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(&self.question.key(), self.profile_owner.key, lamports),
            &[
                self.question.to_account_info(),
                self.profile_owner.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<RefundQuestionBountyModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let bounty_contributions = &ctx.accounts.question.bounty_contributions;
    let user_profile_key = ctx.accounts.user_profile.key();

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Ensure bounty has not yet been awarded
    let is_bounty_awarded = ctx.accounts.question.bounty_awarded;
    if is_bounty_awarded {
        return Err(error!(ErrorCode::BountyAlreadyAwarded));
    }

    // Ensure user profile is (still) a bounty contributor for this question (may have already been refunded)
    if bounty_contributions.iter().find(|&&x| x.bounty_contributor == user_profile_key).is_none() {
        return Err(error!(ErrorCode::NotABountyContributor));
    }

    let mut total_refund_bounty_amount = 0;
    let indices: Vec<usize> = ctx.accounts.question.bounty_contributions.iter().enumerate().filter_map(|(index, &x)| (x.bounty_contributor == user_profile_key).then(|| index)).collect();

    for index in indices {

        let refund_bounty_amount: u64 = ctx.accounts.question.bounty_contributions[index].bounty_amount;
        let forum_question_bounty_minimum: u64 = ctx.accounts.question.bounty_contributions[index].forum_bounty_minimum;
        let bounty_contribution_rep: u64 = ctx.accounts.question.bounty_contributions[index].bounty_contribution_rep;

        // Transfer the bounty amount from the question's bounty pda account to the user profile's owner
        ctx.accounts.transfer_bounty_ctx(refund_bounty_amount)?;

        // Decrement bounty amount and remove bounty contribution entry in question's state account
        let question = &mut ctx.accounts.question;
        question.bounty_amount.try_sub_assign(refund_bounty_amount)?;
        question.bounty_contributions.remove(index);

        // Calculate total space required for the new data
        let new_data_bytes_amount: usize = ctx.accounts.question.to_account_info().data_len() - std::mem::size_of::<BountyContribution>();
        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = ctx.accounts.question.to_account_info().lamports().try_sub(minimum_balance_for_rent_exemption)?;

        // Transfer back the difference in Lamports no longer needed to accommodate the increase in space due to the bounty contribution entry
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Calculate bounty contribution reputation score
        let bounty_amount_mod_minimum_remainder = refund_bounty_amount % forum_question_bounty_minimum;
        let bounty_amount_divisible_minimum = refund_bounty_amount.try_sub(bounty_amount_mod_minimum_remainder)?;
        let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_question_bounty_minimum)?;
        let question_bounty_rep = multiples_bounty_minimum.try_mul(bounty_contribution_rep)?;

        // Decrement reputation score in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_bounty_contributed.try_sub_assign(refund_bounty_amount)?;
        user_profile.reputation_score.try_sub_assign(question_bounty_rep)?;

        total_refund_bounty_amount.try_add_assign(refund_bounty_amount)?;
    }

    // Update moderator profile's most recent engagement
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Bounty amount of {} refunded to user profile with pubkey {}",
         total_refund_bounty_amount, ctx.accounts.user_profile.key());
    Ok(())
}



