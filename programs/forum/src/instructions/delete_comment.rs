use anchor_lang::prelude::*;

use crate::state::{Comment, Forum, UserProfile};
use prog_common::errors::ErrorCode;
use prog_common::{close_account, TrySub};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_comment: u8)]
pub struct DeleteComment<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Comment PDA account and seed
    #[account(mut, seeds = [b"comment".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), comment_seed.key().as_ref()],
              bump = bump_comment, has_one = user_profile, has_one = comment_seed)]
    pub comment: Box<Account<'info, Comment>>,

    /// CHECK: The seed address used for initialization of the comment PDA
    pub comment_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteComment>) -> Result<()> {

    let moderator_profile = &ctx.accounts.moderator_profile;

    if !moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the comment state account
    let comment_account_info = &mut (*ctx.accounts.comment).to_account_info();
    close_account(comment_account_info, receiver)?;

    // Decrement forum comment count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_comment_count.try_sub_assign(1)?;

    // Decrement comments added in user profile account's state
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.comments_added.try_sub_assign(1)?;

    msg!("Comments PDA account with address {} now closed", ctx.accounts.comment.key());
    Ok(())
}
