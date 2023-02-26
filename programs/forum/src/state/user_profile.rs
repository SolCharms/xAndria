use anchor_lang::prelude::*;

#[proc_macros::assert_size(136)] // +7 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct UserProfile{

    // ------------- profile account info

    pub profile_owner: Pubkey,

    pub profile_created_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- user engagement counters

    pub questions_asked: u64,

    pub questions_answered: u64,

    pub comments_added: u64,

    pub answers_accepted: u64,

    pub total_bounty_received: u64,

    pub reputation_score: u64,

    // ------------- miscellaneous

    pub nft_pfp_token_mint: Pubkey,

    pub is_moderator: bool,

}
