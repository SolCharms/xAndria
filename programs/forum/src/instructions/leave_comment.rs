use anchor_lang::prelude::*;
use anchor_lang::Discriminator;

use crate::state::{Answer, Comment, Forum, Question, UserProfile};
use prog_common::{now_ts, TryAdd, errors::ErrorCode};

use arrayref::array_ref;

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct LeaveComment<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Account (question or answer) being commented on
    #[account(mut)]
    pub commented_on: AccountInfo<'info>,

    /// CHECK:
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

pub fn handler(ctx: Context<LeaveComment>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let comment_rep = ctx.accounts.forum.reputation_matrix.comment_rep;

    // Ensure that comment is being added to either a question or an answer account
    let mut commented_on_account_raw = ctx.accounts.commented_on.data.borrow_mut();
    let commented_on_disc = array_ref![commented_on_account_raw, 0, 8];

    if (commented_on_disc != &Question::discriminator()) && (commented_on_disc != &Answer::discriminator()) {
        return Err(error!(ErrorCode::InvalidAccountDiscriminator));
    }

    // Update account commented on's most recent engagement timestamp
    commented_on_account_raw[112..120].clone_from_slice(&now_ts.to_le_bytes());

    // Record Comment's State
    let comment = &mut ctx.accounts.comment;
    comment.commented_on = ctx.accounts.commented_on.key();
    comment.user_profile = ctx.accounts.user_profile.key();
    comment.comment_seed = ctx.accounts.comment_seed.key();

    comment.comment_posted_ts = now_ts;
    comment.most_recent_engagement_ts = now_ts;

    comment.content_data_hash = ctx.accounts.content_data_hash.key();

    // Increment comment count in forum state's account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_comment_count.try_add_assign(1)?;

    // Increment comments added count in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.comments_added.try_add_assign(1)?;

    // Update user profile's most recent engagement timestamp and reputation score
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.reputation_score.try_add_assign(comment_rep)?;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Comment PDA account with address {} now created", ctx.accounts.comment.key());
    Ok(())
}
