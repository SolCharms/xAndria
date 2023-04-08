use anchor_lang::prelude::*;

#[proc_macros::assert_size(56)] // divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ReputationMatrix {

    pub about_me_rep: u64,

    pub post_big_notes_rep: u64,

    pub contribute_big_notes_rep: u64,

    pub question_rep: u64,

    pub answer_rep: u64,

    pub comment_rep: u64,

    pub accepted_answer_rep: u64,

}
