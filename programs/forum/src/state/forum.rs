use anchor_lang::prelude::*;

pub const LATEST_FORUM_VERSION: u16 = 0;
pub use crate::state::{ForumConstants, ForumCounts, ForumFees, ReputationMatrix};

#[proc_macros::assert_size(376)] // +5 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Forum {
    pub version: u16,

    pub forum_manager: Pubkey,

    pub forum_authority: Pubkey,

    pub forum_authority_seed: Pubkey,

    pub forum_authority_bump_seed: [u8; 1],

    pub forum_treasury: Pubkey,

    // --------------- Forum fees
    pub forum_fees: ForumFees,

    // --------------- Forum constants
    pub forum_constants: ForumConstants,

    // --------------- Forum PDA counts
    pub forum_counts: ForumCounts,

    // --------------- Forum Reputation Matrix
    pub reputation_matrix: ReputationMatrix
}

impl Forum {

    pub fn forum_seeds(&self) -> [&[u8]; 2] {
        [self.forum_authority_seed.as_ref(), &self.forum_authority_bump_seed]
    }

}
