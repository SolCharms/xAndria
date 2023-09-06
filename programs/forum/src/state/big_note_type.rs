use anchor_lang::prelude::*;

// Careful: Typescript does not like multiple successive capital letters such as NFTs. Using CamelCase naming is fine.

#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum BigNoteType {
    OpenContribution,
    CreatorCurated
}
