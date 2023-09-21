use anchor_lang::prelude::*;

#[proc_macros::assert_size(72)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct BigNoteVerificationApplication {

    // Big Note for which verification application belongs
    pub big_note: Pubkey,

    // PDA account containing verification fee
    pub verification_fee_pda: Pubkey,

    // Forum verification fee at time of application
    pub verification_fee: u64,
}
