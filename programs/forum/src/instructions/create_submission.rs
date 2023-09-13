use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{Challenge, Forum, Submission, SubmissionState, UserProfile};
use prog_common::{now_ts, TryAdd, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_user_profile: u8, bump_challenge: u8)]
pub struct CreateSubmission<'info> {

    // Forum
    #[account(mut, has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Challenge PDA account and seed
    #[account(seeds = [b"challenge".as_ref(), forum.key().as_ref(), challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    // Submission PDA account
    #[account(init, seeds = [b"submission".as_ref(), challenge.key().as_ref(), user_profile.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<Submission>())]
    pub submission: Box<Account<'info, Submission>>,

    /// CHECK:
    // The content data hash of the submission struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateSubmission<'info> {

    fn transfer_payment_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, self.forum_treasury.key, lamports),
            &[
                self.profile_owner.to_account_info(),
                self.forum_treasury.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<CreateSubmission>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Ensure challenge expires timestamp has not yet passed
    let challenge_expires_ts = ctx.accounts.challenge.challenge_expires_ts;
    if now_ts > challenge_expires_ts {
        return Err(error!(ErrorCode::ChallengeExpired));
    }

    // Record Submission's State
    let submission = &mut ctx.accounts.submission;
    submission.challenge = ctx.accounts.challenge.key();
    submission.user_profile = ctx.accounts.user_profile.key();

    submission.submission_posted_ts = now_ts;
    submission.most_recent_engagement_ts = now_ts;

    submission.content_data_hash = ctx.accounts.content_data_hash.key();
    submission.submission_state = SubmissionState::Pending;

    // Transfer fee for making submission
    let submission_fee = ctx.accounts.forum.forum_fees.forum_challenge_submission_fee;

    if submission_fee > 0 {
        ctx.accounts.transfer_payment_ctx(submission_fee)?;
    }

    // Increment submission count in forum's state account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_submission_count.try_add_assign(1)?;

    // Increment submission count in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.challenges_submitted.try_add_assign(1)?;

    // Update user profile's most recent engagement ts
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Submission PDA account with address {} now created", ctx.accounts.submission.key());
    Ok(())
}
