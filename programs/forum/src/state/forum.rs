use anchor_lang::prelude::*;

pub const LATEST_FORUM_VERSION: u16 = 0;

#[proc_macros::assert_size(192)] // +5 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Forum {
    pub version: u16,

    pub forum_manager: Pubkey,

    pub forum_authority: Pubkey,

    pub forum_authority_seed: Pubkey,

    pub forum_authority_bump_seed: [u8; 1],

    // --------------- Forum fees, in lamports

    pub forum_treasury: Pubkey,

    pub forum_profile_fee: u64,

    pub forum_question_fee: u64,

    pub forum_question_bounty_minimum: u64,

    // --------------- PDA counts

    pub forum_profile_count: u64,

    pub forum_question_count: u64,

    pub forum_answer_count: u64,

    pub forum_comment_count: u64,
}

impl Forum {

    pub fn forum_seeds(&self) -> [&[u8]; 2] {
        [self.forum_authority_seed.as_ref(), &self.forum_authority_bump_seed]
    }

}
