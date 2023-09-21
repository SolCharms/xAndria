use anchor_lang::prelude::*;

use crate::state::{Forum};
use prog_common::{TrySub, TryAdd};

#[derive(Accounts)]
#[instruction(bump_treasury: u8)]
pub struct PayoutFromTreasury<'info> {

    // Forum and Forum Manager
    #[account(has_one = forum_manager, has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn payout_from_treasury(ctx: Context<PayoutFromTreasury>) -> Result<()> {

    // Get minimum balance for rent exemption for size of 16 bytes
    let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(16);

    let treasury_account_info: &mut AccountInfo = &mut ctx.accounts.forum_treasury.to_account_info();
    let receiver_account_info: &mut AccountInfo = &mut ctx.accounts.receiver.to_account_info();

    let treasury_lamports_initial = treasury_account_info.lamports();
    let receiver_lamports_initial = receiver_account_info.lamports();

    let amount = treasury_lamports_initial.try_sub(minimum_balance_for_rent_exemption)?;

    **receiver_account_info.lamports.borrow_mut() = receiver_lamports_initial.try_add(amount)?;
    **treasury_account_info.lamports.borrow_mut() = minimum_balance_for_rent_exemption;

    msg!("{} lamports transferred from treasury to {}", amount, ctx.accounts.receiver.key());
    Ok(())
}
