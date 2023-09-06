use anchor_lang::prelude::*;

#[proc_macros::assert_size(80)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct AboutMe {

    // Profile of user for associated about me
    pub user_profile: Pubkey,

    // ------------- Timestamps
    pub about_me_created_ts: u64,

    pub most_recent_update_ts: u64,

    // ------------- About Me Info
    pub content_data_hash: Pubkey,
}
