use anchor_lang::prelude::*;

use crate::state::{SubmissionState};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Submission {

    // Challenge for which submission belongs
    pub challenge: Pubkey,

    // Profile of user providing submission
    pub user_profile: Pubkey,

    // ------------- Timestamps
    pub submission_posted_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Answer Info

    pub content_data_url: String,

    pub content_data_hash: Pubkey,

    // Is Challenge completed
    pub submission_state: SubmissionState,

}
