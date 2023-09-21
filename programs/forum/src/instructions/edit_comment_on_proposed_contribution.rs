use anchor_lang::prelude::*;

use crate::state::{BigNote, Comment, Forum, ProposedContribution, UserProfile};
use prog_common::{now_ts};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_comment: u8)]
pub struct EditCommentOnProposedContribution<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account
    #[account(mut, has_one = forum)]
    pub big_note: Box<Account<'info, BigNote>>,

    // Proposed Contribution PDA account
    #[account(mut, has_one = big_note)]
    pub proposed_contribution: Box<Account<'info, ProposedContribution>>,

    // Comment PDA account and seed
    #[account(mut, seeds = [b"comment".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), comment_seed.key().as_ref()],
              bump = bump_comment, has_one = user_profile, has_one = comment_seed, constraint = comment.commented_on == proposed_contribution.key())]
    pub comment: Box<Account<'info, Comment>>,

    /// CHECK: The seed address used for initialization of the comment PDA
    pub comment_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the comment struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn edit_comment_on_proposed_contribution(ctx: Context<EditCommentOnProposedContribution>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Update comment account's most recent engagement timestamp and overwrite with the new content data hash
    let comment = &mut ctx.accounts.comment;
    comment.most_recent_engagement_ts = now_ts;
    comment.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update Proposed Contribution account's most recent engagement timestamp
    let proposed_contribution = &mut ctx.accounts.proposed_contribution;
    proposed_contribution.most_recent_engagement_ts = now_ts;

    // Update Big Note account's most recent engagement timestamp
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Comment PDA account with address {} has been edited", ctx.accounts.comment.key());
    Ok(())
}
