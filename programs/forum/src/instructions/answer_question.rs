use anchor_lang::prelude::*;

use crate::state::{Answer, Forum, Question, UserProfile};
use prog_common::{now_ts, TryAdd};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct AnswerQuestion<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account
    #[account(mut, has_one = forum)]
    pub question: Box<Account<'info, Question>>,

    // Answer PDA account and seed
    #[account(init, seeds = [b"answer".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), answer_seed.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<Answer>())]
    pub answer: Box<Account<'info, Answer>>,

    /// CHECK: The seed address used for initialization of the answer PDA
    pub answer_seed: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the answer struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AnswerQuestion>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let answer_rep = ctx.accounts.forum.reputation_matrix.answer_rep;

    // Record Answer's State
    let answer = &mut ctx.accounts.answer;
    answer.question = ctx.accounts.question.key();
    answer.user_profile = ctx.accounts.user_profile.key();
    answer.answer_seed = ctx.accounts.answer_seed.key();

    answer.answer_posted_ts = now_ts;
    answer.most_recent_engagement_ts = now_ts;
    answer.content_data_hash = ctx.accounts.content_data_hash.key();

    answer.answer_rep = answer_rep;
    answer.accepted_answer = false;
    answer.accepted_answer_rep = 0;

    // Increment answer count in forum state's account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_answer_count.try_add_assign(1)?;

    // Increment questions answered count in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.questions_answered.try_add_assign(1)?;

    // Update user profile's most recent engagement timestamp and reputation score
    user_profile.most_recent_engagement_ts = now_ts;
    user_profile.reputation_score.try_add_assign(answer_rep)?;

    // Update question account's most recent engagement timestamp
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    msg!("Answer PDA account with address {} now created", ctx.accounts.answer.key());
    Ok(())
}
