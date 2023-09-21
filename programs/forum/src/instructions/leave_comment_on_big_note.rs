use anchor_lang::prelude::*;

use crate::state::{BigNote, Comment, Forum, UserProfile};
use prog_common::{now_ts, TryAdd};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct LeaveCommentOnBigNote<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account
    #[account(mut, has_one = forum)]
    pub big_note: Box<Account<'info, BigNote>>,

    // Comment PDA account and seed
    #[account(init, seeds = [b"comment".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), comment_seed.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<Comment>())]
    pub comment: Box<Account<'info, Comment>>,

    /// CHECK: The seed address used for initialization of the comment PDA
    pub comment_seed: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the comment struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn leave_comment_on_big_note(ctx: Context<LeaveCommentOnBigNote>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let comment_rep = ctx.accounts.forum.reputation_matrix.comment_rep;

    // Record Comment's State
    let comment = &mut ctx.accounts.comment;
    comment.commented_on = ctx.accounts.big_note.key();
    comment.user_profile = ctx.accounts.user_profile.key();
    comment.comment_seed = ctx.accounts.comment_seed.key();

    comment.comment_posted_ts = now_ts;
    comment.most_recent_engagement_ts = now_ts;

    comment.content_data_hash = ctx.accounts.content_data_hash.key();
    comment.comment_rep = comment_rep;

    // Increment comment count in forum state's account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_comment_count.try_add_assign(1)?;

    // Increment comments added count in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.comments_added.try_add_assign(1)?;

    // Update user profile's most recent engagement timestamp and reputation score
    user_profile.most_recent_engagement_ts = now_ts;
    user_profile.reputation_score.try_add_assign(comment_rep)?;

    // Update Big Note account's most recent engagement timestamp
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;

    msg!("Comment PDA account with address {} now created", ctx.accounts.comment.key());
    Ok(())
}
