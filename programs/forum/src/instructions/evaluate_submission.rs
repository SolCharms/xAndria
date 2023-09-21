use anchor_lang::prelude::*;

use crate::state::{Challenge, Forum, Submission, SubmissionState, UserProfile};
use prog_common::{now_ts, TryAdd, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_challenge: u8, bump_submission: u8)]
pub struct EvaluateSubmission<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Challenge PDA account and seed
    #[account(seeds = [b"challenge".as_ref(), forum.key().as_ref(),challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    // Submission PDA account
    #[account(mut, seeds = [b"submission".as_ref(), challenge.key().as_ref(), user_profile.key().as_ref()],
              bump = bump_submission, has_one = challenge, has_one = user_profile)]
    pub submission: Box<Account<'info, Submission>>,

    pub system_program: Program<'info, System>,
}

pub fn evaluate_submission(ctx: Context<EvaluateSubmission>, submission_state: SubmissionState) -> Result<()> {

    let now_ts = now_ts()?;
    let reputation = ctx.accounts.challenge.reputation;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Update the submission's state account
    let submission = &mut ctx.accounts.submission;
    submission.most_recent_engagement_ts = now_ts;
    submission.submission_state = submission_state;

    // If challenge completed, update the user profile's state account
    if submission_state == SubmissionState::Completed {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.challenges_completed.try_add_assign(1)?;
        user_profile.reputation_score.try_add_assign(reputation)?;
    }

    // Update the moderator profile's state account
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Submission account with address {} evaluated with submission state {:?}",
         ctx.accounts.submission.key(), submission_state);

    Ok(())
}
