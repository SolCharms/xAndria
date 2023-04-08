use anchor_lang::prelude::*;

#[proc_macros::assert_size(48)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ForumFees {

    // Profile fee (flat sign-up fee)
    pub forum_profile_fee: u64,

    // Question fee in basis points (of posted bounty amount)
    pub forum_question_fee: u64,

    // Big Notes fee (flat big notes submission fee)
    pub forum_big_notes_submission_fee: u64,

    // Big Notes solicitation fee in basis points (of posted bounty amount)
    pub forum_big_notes_solicitation_fee: u64,

    pub forum_question_bounty_minimum: u64,

    pub forum_big_notes_bounty_minimum: u64,

}
