use anchor_lang::prelude::*;

use crate::state::{Challenge, Forum, Submission, UserProfile};
use prog_common::{now_ts, close_account, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_challenge: u8, bump_submission: u8)]
pub struct DeleteSubmissionModerator<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

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

    #[account(mut, seeds = [b"submission".as_ref(), challenge.key().as_ref(), user_profile.key().as_ref()],
              bump = bump_submission, has_one = challenge, has_one = user_profile)]
    pub submission: Box<Account<'info, Submission>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn delete_submission_moderator(ctx: Context<DeleteSubmissionModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the submission state account
    let submission_account_info = &mut (*ctx.accounts.submission).to_account_info();
    close_account(submission_account_info, receiver)?;

    // Decrement submission count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_submission_count.try_sub_assign(1)?;

    // Decrement submission count in user profile's state
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.challenges_submitted.try_sub_assign(1)?;

    // Update moderator profile's most recent engagement ts
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Submission PDA account with address {} has been closed by moderator profile with pubkey {}",
         ctx.accounts.submission.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
