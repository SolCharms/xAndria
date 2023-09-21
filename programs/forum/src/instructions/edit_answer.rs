use anchor_lang::prelude::*;

use crate::state::{Answer, Forum, Question, UserProfile};
use prog_common::{now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_answer: u8)]
pub struct EditAnswer<'info> {

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

    // Answer PDA account and seed
    #[account(mut, seeds = [b"answer".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), answer_seed.key().as_ref()],
              bump = bump_answer, has_one = question, has_one = user_profile, has_one = answer_seed)]
    pub answer: Box<Account<'info, Answer>>,

    /// CHECK: The seed address used for initialization of the answer PDA
    pub answer_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the answer struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn edit_answer(ctx: Context<EditAnswer>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let is_accepted_answer = ctx.accounts.answer.accepted_answer;

    // Ensure answer is not an accepted answer
    if is_accepted_answer {
        return Err(error!(ErrorCode::AccountCannotBeEdited));
    }

    // Update answer account's most recent engagement timestamp and overwrite with the new content data hash
    let answer = &mut ctx.accounts.answer;
    answer.most_recent_engagement_ts = now_ts;
    answer.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    // Update question account's most recent engagement timestamp
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    msg!("Answer PDA account with address {} has been edited", ctx.accounts.answer.key());
    Ok(())
}
