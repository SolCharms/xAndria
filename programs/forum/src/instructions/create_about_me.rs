use anchor_lang::prelude::*;

use crate::state::{AboutMe, Forum, UserProfile};
use prog_common::{now_ts, TryAdd};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct CreateAboutMe<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(init, seeds = [b"about_me".as_ref(), user_profile.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<AboutMe>())]
    pub about_me: Box<Account<'info, AboutMe>>,

    /// CHECK:
    // The content data hash of the about me struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_about_me(ctx: Context<CreateAboutMe>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let about_me = &mut ctx.accounts.about_me;

    // Record About Me's State
    about_me.user_profile = ctx.accounts.user_profile.key();
    about_me.about_me_created_ts = now_ts;
    about_me.most_recent_update_ts = now_ts;
    about_me.content_data_hash = ctx.accounts.content_data_hash.key();

    // Update user profile's most recent engagement timestamp and flip has about me boolean
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;
    user_profile.has_about_me = true;

    // Update user profile's reputation score if has had about me boolean is false
    if !user_profile.has_had_about_me {
        let about_me_rep = ctx.accounts.forum.reputation_matrix.about_me_rep;
        user_profile.reputation_score.try_add_assign(about_me_rep)?;
        user_profile.has_had_about_me = true;
    }

    msg!("About Me PDA account with address {} now created", ctx.accounts.about_me.key());
    Ok(())
}
