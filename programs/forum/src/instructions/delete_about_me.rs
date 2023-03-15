use anchor_lang::prelude::*;

use prog_common::{now_ts, close_account};
use crate::state::{AboutMe, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_about_me: u8)]
pub struct DeleteAboutMe<'info> {

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(mut, seeds = [b"about_me".as_ref(), user_profile.key().as_ref()],
              bump = bump_about_me, has_one = user_profile)]
    about_me: Box<Account<'info, AboutMe>>,

    /// CHECK:
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteAboutMe>) -> Result<()> {

    let now_ts = now_ts()?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the user profile state account
    let about_me_account_info = &mut (*ctx.accounts.about_me).to_account_info();
    close_account(about_me_account_info, receiver)?;

    // Update user profile account's most recent engagement timestamp and flip has about me boolean
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;
    user_profile.has_about_me = false;

    msg!("About Me PDA account with address {} now closed", ctx.accounts.about_me.key());
    Ok(())
}
