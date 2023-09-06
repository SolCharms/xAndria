use anchor_lang::prelude::*;

use crate::state::{Tags, BountyContribution};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Question {

    // Forum for which question belongs
    pub forum: Pubkey,

    // Profile of user asking question
    pub user_profile: Pubkey,

    // Seed used to generate unique question account PDA address
    pub question_seed: Pubkey,

    // ------------- Timestamps
    pub question_posted_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Bounty Amount
    pub bounty_amount: u64,

    pub bounty_contributions: Vec<BountyContribution>,

    // ------------- Question Info (Maximum number of tags/character strings set in forum_constants.rs)
    pub tags: Vec<Tags>,

    pub title: String,

    pub content_data_url: String,

    pub content_data_hash: Pubkey,

    // ------------- Question reputation value
    pub question_rep: u64,

    // Is Bounty Awarded
    pub bounty_awarded: bool,

}
