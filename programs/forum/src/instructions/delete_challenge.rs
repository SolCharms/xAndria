use anchor_lang::prelude::*;

use crate::state::{Challenge, Forum, UserProfile};
use prog_common::{now_ts, close_account, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_challenge: u8)]
pub struct DeleteChallenge<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    // Challenge PDA account and seed
    #[account(mut, seeds = [b"challenge".as_ref(), forum.key().as_ref(), challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteChallenge>) -> Result<()> {

    let now_ts = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the challenge state account
    let challenge_account_info = &mut (*ctx.accounts.challenge).to_account_info();
    close_account(challenge_account_info, receiver)?;

    // Decrement challenge count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_challenge_count.try_sub_assign(1)?;

    // Update the moderator profile's state account
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Challenge PDA account with address {} has been closed by moderator profile with pubkey {}",
         ctx.accounts.challenge.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
