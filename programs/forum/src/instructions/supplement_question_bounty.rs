use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};
use crate::state::{Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_supplementor_profile: u8, bump_user_profile: u8, bump_question: u8, bump_bounty_pda: u8)]
pub struct SupplementQuestionBounty<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub supplementor: Signer<'info>,

    // The supplementor profile
    #[account(mut, seeds = [b"user_profile".as_ref(), supplementor.key().as_ref()],
              bump = bump_supplementor_profile, constraint = supplementor_profile.profile_owner == supplementor.key())]
    pub supplementor_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = user_profile, has_one = question_seed)]
    pub question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(seeds = [b"bounty_pda".as_ref(), question.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> SupplementQuestionBounty<'info> {
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
}

pub fn handler(ctx: Context<SupplementQuestionBounty>, supplemental_bounty_amount: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Ensure Bounty has not yet been awarded
    let is_bounty_awarded = ctx.accounts.question.bounty_awarded;

    if is_bounty_awarded {
        return Err(error!(ErrorCode::BountyAlreadyAwarded));
    }

    // Ensure minimum bounty amount is contributed
    let forum_bounty_minimum: u64 = ctx.accounts.forum.forum_fees.forum_question_bounty_minimum;

    if supplemental_bounty_amount < forum_bounty_minimum {
        return Err(error!(ErrorCode::InvalidBountyAmount));
    }

    // Transfer the supplemental bounty amount to the question's bounty pda
    ctx.accounts.transfer_bounty_ctx(supplemental_bounty_amount)?;

    // Update question PDA's most recent engagement
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    // Calculate question reputation score
    let question_rep_multiplier = ctx.accounts.forum.reputation_matrix.question_rep;
    let bounty_amount_modded_remainder = supplemental_bounty_amount % forum_bounty_minimum;
    let bounty_amount_divisible_minimum = supplemental_bounty_amount.try_sub(bounty_amount_modded_remainder)?;
    let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_bounty_minimum)?;
    let question_rep = multiples_bounty_minimum.try_mul(question_rep_multiplier)?;

    // Update reputation score in supplementor profile
    let supplementor_profile = &mut ctx.accounts.supplementor_profile;
    supplementor_profile.reputation_score.try_add_assign(question_rep)?;

    msg!("Supplemental bounty amount {} added to question PDA account with address {}", supplemental_bounty_amount, ctx.accounts.question.key());
    Ok(())
}
