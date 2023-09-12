use anchor_lang::prelude::*;

// Careful: Typescript does not like multiple successive capital letters such as NFTs. Using CamelCase naming is fine.

// #[proc_macros::assert_size(8)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum BountyContributionState {
    Available,
    Awarded,
    Refunded
}
