use anchor_lang::prelude::*;

use crate::state::{BigNoteType, BountyContribution, Tags};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct BigNote {

    // Forum for which big note belongs
    pub forum: Pubkey,

    // Profile of user which created big note
    pub user_profile: Pubkey,

    // Seed used to generate unique big note account PDA address
    pub big_note_seed: Pubkey,

    // ------------- Timestamps
    pub big_note_created_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Bounty Amount
    pub bounty_amount: u64,

    pub bounty_contributions: Vec<BountyContribution>,

    // ------------- Big note Info (Maximum number of tags/character strings set in forum_constants.rs)
    pub big_note_type: BigNoteType,

    pub tags: Vec<Tags>,

    pub title: String,

    pub content_data_url: String,

    pub content_data_hash: Pubkey,

    pub is_verified: bool,

    // ------------- Big Note reputation value
    pub big_note_rep: u64,

    // Is Bounty Awarded
    pub bounty_awarded: bool,

}
