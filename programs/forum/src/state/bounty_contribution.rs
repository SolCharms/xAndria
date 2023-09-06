use anchor_lang::prelude::*;

#[proc_macros::assert_size(64)] //divisible by 8
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct BountyContribution {

    // contributor's user profile pda account
    pub bounty_contributor: Pubkey,

    // amount contributed
    pub bounty_amount: u64,

    // forum question / big note bounty minimum at time of contribution
    pub forum_bounty_minimum: u64,

    // bounty contribution rep at time of contribution
    pub bounty_contribution_rep: u64,

    // is bounty awarded
    pub bounty_awarded: bool,
}
