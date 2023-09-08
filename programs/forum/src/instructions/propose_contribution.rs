use anchor_lang::prelude::*;

use crate::state::{BigNote, Forum, ProposedContribution, ProposedContributionState, UserProfile};
use prog_common::{now_ts, TryAdd};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct ProposeContribution<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account
    #[account(mut, has_one = forum)]
    pub big_note: Box<Account<'info, BigNote>>,

    #[account(init, seeds = [b"proposed_contribution".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), proposed_contribution_seed.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<ProposedContribution>())]
    pub proposed_contribution: Box<Account<'info, ProposedContribution>>,

    /// CHECK: The seed address used for initialization of the Proposed Contribution PDA
    pub proposed_contribution_seed: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the Proposed Contribution struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ProposeContribution>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let proposed_contribution_rep = ctx.accounts.forum.reputation_matrix.proposed_big_notes_contribution_rep;

    // Record Proposed_Contribution's State
    let proposed_contribution = &mut ctx.accounts.proposed_contribution;
    proposed_contribution.big_note = ctx.accounts.big_note.key();
    proposed_contribution.user_profile = ctx.accounts.user_profile.key();
    proposed_contribution.proposed_contribution_seed = ctx.accounts.proposed_contribution_seed.key();

    proposed_contribution.proposed_contribution_posted_ts = now_ts;
    proposed_contribution.most_recent_engagement_ts = now_ts;
    proposed_contribution.content_data_hash = ctx.accounts.content_data_hash.key();

    proposed_contribution.proposed_contribution_rep = proposed_contribution_rep;
    proposed_contribution.proposed_contribution_state = ProposedContributionState::Pending;
    proposed_contribution.accepted_contribution_proposal_rep = 0;

    // Increment proposed contributions count in forum state's account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_proposed_contribution_count.try_add_assign(1)?;

    // Increment proposed contributions count in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.big_notes_contributions_proposed.try_add_assign(1)?;

    // Update user profile's most recent engagement timestamp and reputation score
    user_profile.most_recent_engagement_ts = now_ts;
    user_profile.reputation_score.try_add_assign(proposed_contribution_rep)?;

    // Update question account's most recent engagement timestamp
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;

    msg!("Proposed Contribution PDA account with address {} now created", ctx.accounts.proposed_contribution.key());
    Ok(())
}
