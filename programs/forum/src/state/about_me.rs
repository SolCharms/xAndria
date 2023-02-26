use anchor_lang::prelude::*;

pub const CREATE_ABOUT_ME_REPUTATION_BONUS: u64 = 100;

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct AboutMe {

    // Profile of user for associated about me
    pub user_profile: Pubkey,

    // ------------- Timestamps
    pub about_me_created_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- About Me Info

    pub content: String, // Max 512 characters
}
