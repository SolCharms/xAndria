use anchor_lang::prelude::*;

use crate::state::{Comment, Forum, Question, UserProfile};
use prog_common::{now_ts};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_comment: u8)]
pub struct EditCommentOnQuestion<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account
    #[account(mut, has_one = forum)]
    pub question: Box<Account<'info, Question>>,

    // Comment PDA account and seed
    #[account(mut, seeds = [b"comment".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), comment_seed.key().as_ref()],
              bump = bump_comment, has_one = user_profile, has_one = comment_seed, constraint = comment.commented_on == question.key())]
    pub comment: Box<Account<'info, Comment>>,

    /// CHECK: The seed address used for initialization of the comment PDA
    pub comment_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the comment struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn edit_comment_on_question(ctx: Context<EditCommentOnQuestion>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Update comment account's most recent engagement timestamp and overwrite with the new content data hash
    let comment = &mut ctx.accounts.comment;
    comment.most_recent_engagement_ts = now_ts;
    comment.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update question account's most recent engagement timestamp
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Comment PDA account with address {} has been edited", ctx.accounts.comment.key());
    Ok(())
}
