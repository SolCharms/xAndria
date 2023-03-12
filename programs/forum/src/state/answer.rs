use anchor_lang::prelude::*;

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Answer {

    // Question for which answer belongs
    pub question: Pubkey,

    // Profile of user providing answer
    pub user_profile: Pubkey,

    // Seed used to generate unique answer account PDA address
    pub answer_seed: Pubkey,

    // ------------- Timestamps
    pub answer_posted_ts: u64,

    pub most_recent_engagement_ts: u64,

    // ------------- Answer Info

    pub content: String, // Max 65536 characters

    // Is Accepted Answer
    pub accepted_answer: bool,

}
