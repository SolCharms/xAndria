use anchor_lang::prelude::*;

#[proc_macros::assert_size(104)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ForumCounts {

    pub forum_profile_count: u64,

    pub forum_big_notes_count: u64,

    pub forum_question_count: u64,

    pub forum_answer_count: u64,

    pub forum_comment_count: u64,

    pub extra_space: [u8; 64]

}
