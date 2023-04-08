use anchor_lang::prelude::*;

use crate::state::{AboutMe, Forum, UserProfile};
use prog_common::{now_ts};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_about_me: u8)]
pub struct EditAboutMe<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(mut, seeds = [b"about_me".as_ref(), user_profile.key().as_ref()],
              bump = bump_about_me, has_one = user_profile)]
    pub about_me: Box<Account<'info, AboutMe>>,

    /// CHECK:
    // The new content data hash of the about me struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<EditAboutMe>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Update user about me account's most recent update timestamp and overwrite with the new content data hash
    let about_me = &mut ctx.accounts.about_me;
    about_me.most_recent_update_ts = now_ts;
    about_me.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("About Me PDA account with address {} has been edited", ctx.accounts.about_me.key());
    Ok(())
}
