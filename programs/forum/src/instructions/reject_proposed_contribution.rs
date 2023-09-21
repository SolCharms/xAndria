use anchor_lang::prelude::*;

use crate::state::{BigNote, Forum, ProposedContribution, ProposedContributionState, UserProfile};
use prog_common::{now_ts};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_big_note: u8, bump_proposal_user_profile: u8, bump_proposed_contribution: u8)]
pub struct RejectProposedContribution<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK: Used for seed verification of user profile pda account
    pub proposal_profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), proposal_profile_owner.key().as_ref()],
              bump = bump_proposal_user_profile, has_one = forum, constraint = proposal_user_profile.profile_owner == proposal_profile_owner.key())]
    pub proposal_user_profile: Box<Account<'info, UserProfile>>,

    // Proposed contribution PDA account and seed
    #[account(mut, seeds = [b"answer".as_ref(), forum.key().as_ref(), proposal_user_profile.key().as_ref(), proposed_contribution_seed.key().as_ref()],
              bump = bump_proposed_contribution, constraint = proposed_contribution.user_profile == proposal_user_profile.key(), has_one = proposed_contribution_seed, has_one = big_note)]
    pub proposed_contribution: Box<Account<'info, ProposedContribution>>,

    /// CHECK: The seed address used for initialization of the proposed contribution PDA
    pub proposed_contribution_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn reject_proposed_contribution(ctx:Context<RejectProposedContribution>) -> Result<()> {

    let now_ts = now_ts()?;

    // Update big note account's state
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;

    // Update proposed contribution account's state
    let proposed_contribution = &mut ctx.accounts.proposed_contribution;
    proposed_contribution.proposed_contribution_state = ProposedContributionState::Rejected;
    proposed_contribution.most_recent_engagement_ts = now_ts;

    // Update user profile's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    // Update proposed contribution user profile's state
    let proposal_user_profile = &mut ctx.accounts.proposal_user_profile;
    proposal_user_profile.most_recent_engagement_ts = now_ts;

    msg!("Proposed contribution with pubkey {} rejected", ctx.accounts.proposed_contribution.key());
    Ok(())
}
