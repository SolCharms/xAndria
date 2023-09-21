use anchor_lang::prelude::*;

use crate::state::{Challenge, Forum, Submission, SubmissionState, UserProfile};
use prog_common::{now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_challenge: u8, bump_submission: u8)]
pub struct EditSubmission<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

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
    #[account(mut, seeds = [b"submission".as_ref(), challenge.key().as_ref(), user_profile.key().as_ref()],
              bump = bump_submission, has_one = challenge, has_one = user_profile)]
    pub submission: Box<Account<'info, Submission>>,

    /// CHECK:
    // The new content data hash of the submission struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn edit_submission(ctx: Context<EditSubmission>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Ensure submission is not completed
    let submission_state: SubmissionState = ctx.accounts.submission.submission_state;
    if submission_state == SubmissionState::Completed {
        return Err(error!(ErrorCode::AccountCannotBeEdited));
    }

    // Ensure challenge has not expired
    let challenge_expires_ts = ctx.accounts.challenge.challenge_expires_ts;
    if challenge_expires_ts > now_ts {
        return Err(error!(ErrorCode::ChallengeExpired));
    }

    // Update submission account's most recent engagement timestamp and overwrite with the new content data hash
    let submission = &mut ctx.accounts.submission;
    submission.most_recent_engagement_ts = now_ts;
    submission.content_data_hash = ctx.accounts.new_content_data_hash.key();
    submission.submission_state = SubmissionState::Pending;

    // Update user profile's most recent engagement ts
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Submission PDA account with address {} has been edited", ctx.accounts.submission.key());
    Ok(())
}
