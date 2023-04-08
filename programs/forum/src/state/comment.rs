use anchor_lang::prelude::*;

#[proc_macros::assert_size(144)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Comment {

    // Account pubkey of Question/Answer for which comment belongs
    pub commented_on: Pubkey,

    // Profile of user providing comment
    pub user_profile: Pubkey,

    // Seed used to generate unique answer account PDA address
    pub comment_seed: Pubkey,

    // ------------- Timestamps
    pub comment_posted_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Comment Info

    pub content_data_hash: Pubkey,
}
