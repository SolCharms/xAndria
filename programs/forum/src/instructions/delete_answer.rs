use anchor_lang::prelude::*;

use crate::state::{Answer, Forum, Question, UserProfile};
use prog_common::{now_ts, close_account, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_answer: u8)]
pub struct DeleteAnswer<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account
    #[account(mut, has_one = forum)]
    pub question: Box<Account<'info, Question>>,

    // Answer PDA account and seed
    #[account(mut, seeds = [b"answer".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), answer_seed.key().as_ref()],
              bump = bump_answer, has_one = question, has_one = user_profile, has_one = answer_seed)]
    pub answer: Box<Account<'info, Answer>>,

    /// CHECK: The seed address used for initialization of the answer PDA
    pub answer_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn delete_answer(ctx: Context<DeleteAnswer>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let answer_rep = ctx.accounts.answer.answer_rep;
    let is_accepted_answer = ctx.accounts.answer.accepted_answer;

    // Ensure answer is not an accepted answer
    if is_accepted_answer {
        return Err(error!(ErrorCode::AccountCannotBeEdited));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the answer state account
    let answer_account_info = &mut (*ctx.accounts.answer).to_account_info();
    close_account(answer_account_info, receiver)?;

    // Decrement forum answer count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_answer_count.try_sub_assign(1)?;

    // Decrement questions answered and reputation score in user profile account's state
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.questions_answered.try_sub_assign(1)?;
    user_profile.reputation_score.try_sub_assign(answer_rep)?;
    user_profile.most_recent_engagement_ts = now_ts;

    // Update question account's most recent engagement timestamp
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    msg!("Answer PDA account with address {} now closed", ctx.accounts.answer.key());
    Ok(())
}
