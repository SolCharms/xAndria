use anchor_lang::prelude::*;

use crate::state::{Tags};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct BigNote {

    // Forum for which big note belongs
    pub forum: Pubkey,

    // Profile of user creating big note
    pub user_profile: Pubkey,

    // Seed used to generate unique big note account PDA address
    pub big_note_seed: Pubkey,

    // ------------- Timestamps
    pub big_note_created_ts: u64,

    pub most_recent_update_ts: u64,

    // ------------- Bounty Amount
    pub bounty_amount: u64,

    pub soliciting_contibutors: bool,

    // Is Bounty Awarded
    pub bounty_awarded: bool,

    // Is Big note verified
    pub is_verified: bool,

    // ------------- Big note Info

    pub tag: Tags,

    pub title: String, // Max 256 characters

    pub content: String, // Max 65536 characters
}
