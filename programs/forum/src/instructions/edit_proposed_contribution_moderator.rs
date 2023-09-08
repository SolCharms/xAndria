use anchor_lang::prelude::*;

use crate::state::{BigNote, Forum, ProposedContribution, UserProfile};
use prog_common::{now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_proposed_contribution: u8)]
pub struct EditProposedContributionModerator<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account
    #[account(mut, has_one = forum)]
    pub big_note: Box<Account<'info, BigNote>>,

    // Proposed Contribution PDA account and seed
    #[account(mut, seeds = [b"proposed_contribution".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), proposed_contribution_seed.key().as_ref()],
              bump = bump_proposed_contribution, has_one = big_note, has_one = user_profile, has_one = proposed_contribution_seed)]
    pub proposed_contribution: Box<Account<'info, ProposedContribution>>,

    /// CHECK: The seed address used for initialization of the Proposed Contribution PDA
    pub proposed_contribution_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the answer struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<EditProposedContributionModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Update proposed contribution account's most recent engagement timestamp and overwrite with the new content data hash
    let proposed_contribution = &mut ctx.accounts.proposed_contribution;
    proposed_contribution.most_recent_engagement_ts = now_ts;
    proposed_contribution.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update big note account's most recent engagement timestamp
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;

    // Update moderator profile account's most recent engagement timestamp
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Proposed Contribution PDA account with address {} has been edited by moderator profile with pubkey {}",
         ctx.accounts.proposed_contribution.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
