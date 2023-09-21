use anchor_lang::prelude::*;

use crate::state::{Forum, UserProfile};
use prog_common::{close_account, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct DeleteUserProfile<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn delete_user_profile(ctx: Context<DeleteUserProfile>) -> Result<()> {

    if ctx.accounts.user_profile.has_about_me {
        return Err(error!(ErrorCode::AboutMePDANotClosed));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the user profile state account
    let user_profile_account_info = &mut (*ctx.accounts.user_profile).to_account_info();
    close_account(user_profile_account_info, receiver)?;

    // Decrement forum profile count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_profile_count.try_sub_assign(1)?;

    msg!("User profile with address {} now closed", ctx.accounts.user_profile.key());
    msg!("Forum {} now has {} user profiles", ctx.accounts.forum.key(), ctx.accounts.forum.forum_counts.forum_profile_count);
    Ok(())
}
