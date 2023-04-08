use anchor_lang::prelude::*;

use crate::state::{Forum, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct RemoveModerator<'info> {

    // Forum and Forum Manager
    #[account(has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RemoveModerator>) -> Result<()> {

    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.is_moderator = false;

    msg!("User profile account with address {} is no longer moderator", ctx.accounts.user_profile.key());
    Ok(())
}
