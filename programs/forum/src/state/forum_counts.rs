use anchor_lang::prelude::*;

#[proc_macros::assert_size(64)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ForumCounts {

    pub forum_profile_count: u64,

    pub forum_question_count: u64,

    pub forum_answer_count: u64,

    pub forum_comment_count: u64,

    pub forum_big_notes_count: u64,

    pub forum_proposed_contribution_count: u64,

    pub forum_challenge_count: u64,

    pub forum_submission_count: u64,

}
