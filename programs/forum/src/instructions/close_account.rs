/// The following instruction will only be used on devnet to quickly close accounts as development is ongoing
/// It is not intended for mainnet use, and as such, will be disabled for the mainnet release.
/// None the less, only the program's update authority will have ability to call this function

pub const PROGRAM_UPDATE_AUTHORITY: &str = "8FJbXeA8f7XocF9XSYBzYkXhbpPBpAN4FmkYXdYKBH97";

use anchor_lang::prelude::*;

use prog_common::{close_account};
use std::str::FromStr;

#[derive(Accounts)]
pub struct CloseAccount<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub account_to_close: AccountInfo<'info>,

    // misc
    pub system_program: Program<'info, System>,

}

pub fn handler(ctx: Context<CloseAccount>) -> Result<()> {

    // Ensure Signer is Program Update Authority
    let program_update_auth_key = Pubkey::from_str(PROGRAM_UPDATE_AUTHORITY).unwrap();
    assert_eq!(program_update_auth_key, ctx.accounts.signer.key());

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.signer.to_account_info();

    // Close the state account
    let account_to_close_info = &mut ctx.accounts.account_to_close.to_account_info();
    close_account(account_to_close_info, receiver)?;

    msg!("account with pubkey {} now closed", ctx.accounts.account_to_close.key());

    Ok(())
}
