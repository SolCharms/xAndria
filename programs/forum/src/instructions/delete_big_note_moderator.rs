use anchor_lang::prelude::*;

use crate::state::{BigNote, BountyContribution, Forum, UserProfile};
use prog_common::{close_account, now_ts, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_big_note: u8)]
pub struct DeleteBigNoteModerator<'info> {

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

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the Big Note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteBigNoteModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let is_bounty_awarded = &ctx.accounts.big_note.bounty_awarded;
    let big_note_rep = ctx.accounts.big_note.big_note_rep;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    if !is_bounty_awarded {

        let bounty_contributions: &Vec<BountyContribution> = &ctx.accounts.big_note.bounty_contributions;
        if bounty_contributions.len() > 0 {
            return Err(error!(ErrorCode::NotAllContributionsRefunded));
        }
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the big note state account
    let big_note_account_info = &mut (*ctx.accounts.big_note).to_account_info();
    close_account(big_note_account_info, receiver)?;

    // Decrement forum big note count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_big_notes_count.try_sub_assign(1)?;

    // Decrement big notes created and reputation score in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.big_notes_created.try_sub_assign(1)?;
    user_profile.reputation_score.try_sub_assign(big_note_rep)?;

    // Update moderator profile's most recent engagement
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Big note PDA account with address {} has been closed by moderator profile with pubkey {}",
         ctx.accounts.big_note.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
