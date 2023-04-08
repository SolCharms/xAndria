use anchor_lang::prelude::*;

use crate::state::{Tags};

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

    // ------------- Question Info

    pub tags: Vec<Tags>,

    pub title: String, // Max 256 characters

    pub content_data_hash: Pubkey,

    // Is Bounty Awarded
    pub bounty_awarded: bool,

}
