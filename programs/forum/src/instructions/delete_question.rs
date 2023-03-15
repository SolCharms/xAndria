use anchor_lang::prelude::*;

use crate::state::{Forum, Question, UserProfile};
use prog_common::errors::ErrorCode;
use prog_common::{close_account, now_ts, TrySub};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_question: u8)]
pub struct DeleteQuestion<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question pda account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = user_profile, has_one = question_seed)]
    pub question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteQuestion>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let moderator_profile = &ctx.accounts.moderator_profile;

    if !moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the question state account
    let question_account_info = &mut (*ctx.accounts.question).to_account_info();
    close_account(question_account_info, receiver)?;

    // Decrement forum question count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_question_count.try_sub_assign(1)?;

    // Decrement questions asked in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.questions_asked.try_sub_assign(1)?;

    // Update moderator profile's most recent engagement
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Question PDA account with address {} now closed", ctx.accounts.question.key());
    Ok(())
}
