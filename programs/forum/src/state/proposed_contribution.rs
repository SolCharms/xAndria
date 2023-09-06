use anchor_lang::prelude::*;

use crate::state::{ProposedContributionState};

#[proc_macros::assert_size(168)] // +7 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct ProposedContribution {

    // Big note for which proposed contribution belongs
    pub big_note: Pubkey,

    // Profile of user providing proposed contribution
    pub user_profile: Pubkey,

    // Seed used to generate unique proposed contribution account PDA address
    pub proposed_contribution_seed: Pubkey,

    // ------------- Timestamps
    pub proposed_contribution_posted_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Proposed Contribution Info
    pub content_data_hash: Pubkey,

    // ------------- Big Note contribution reputation values
    pub proposed_contribution_rep: u64,

    // Proposed Contribution State
    pub proposed_contribution_state: ProposedContributionState,

    pub accepted_contribution_proposal_rep: u64,

}
