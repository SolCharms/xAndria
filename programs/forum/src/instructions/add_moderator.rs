use anchor_lang::prelude::*;

use crate::state::{Forum, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct AddModerator<'info> {

    // Forum and Forum Manager
    #[account(has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddModerator>) -> Result<()> {

    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.is_moderator = true;

    msg!("User profile account with address {} is now moderator", ctx.accounts.user_profile.key());
    Ok(())
}
