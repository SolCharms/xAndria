use anchor_lang::prelude::*;

use crate::state::{Answer, Forum, Question, UserProfile};
use prog_common::{now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_answer: u8)]
pub struct EditAnswerModerator<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
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

pub fn edit_answer_moderator(ctx: Context<EditAnswerModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Update answer account's most recent engagement timestamp and overwrite with the new content data hash
    let answer = &mut ctx.accounts.answer;
    answer.most_recent_engagement_ts = now_ts;
    answer.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update question account's most recent engagement timestamp
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    // Update moderator profile account's most recent engagement timestamp
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Answer PDA account with address {} has been edited by moderator profile with pubkey {}",
         ctx.accounts.answer.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
