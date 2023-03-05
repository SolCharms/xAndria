use anchor_lang::prelude::*;

#[proc_macros::assert_size(104)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ForumFees {

    pub forum_profile_fee: u64,

    pub forum_question_fee: u64,

    pub forum_big_notes_fee: u64,

    pub forum_question_bounty_minimum: u64,

    pub forum_big_notes_bounty_minimum: u64,

    pub extra_space: [u8; 64]

}
