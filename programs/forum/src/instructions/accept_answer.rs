use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use prog_common::{close_account, now_ts, TryAdd};
use crate::state::{Answer, Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_question: u8, bump_bounty_pda: u8, bump_answer_user_profile: u8, bump_answer: u8)]
pub struct AcceptAnswer<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = user_profile, has_one = question_seed)]
    pub question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"bounty_pda".as_ref(), question.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub answer_profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), answer_profile_owner.key().as_ref()],
              bump = bump_answer_user_profile, constraint = answer_user_profile.profile_owner == answer_profile_owner.key())]
    pub answer_user_profile: Box<Account<'info, UserProfile>>,

    // Answer PDA account and seed
    #[account(mut, seeds = [b"answer".as_ref(), forum.key().as_ref(), answer_user_profile.key().as_ref(), answer_seed.key().as_ref()],
              bump = bump_answer, has_one = user_profile, has_one = answer_seed, has_one = question)]
    pub answer: Box<Account<'info, Answer>>,

    /// CHECK: The seed address used for initialization of the answer PDA
    pub answer_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> AcceptAnswer<'info> {

    fn transfer_bounty_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.bounty_pda.key, self.answer_profile_owner.key, lamports),
            &[
                self.bounty_pda.to_account_info(),
                self.answer_profile_owner.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx:Context<AcceptAnswer>) -> Result<()> {

    let now_ts = now_ts()?;
    let bounty_amount = ctx.accounts.question.bounty_amount;
    let accepted_answer_rep = ctx.accounts.forum.reputation_matrix.accepted_answer_rep;

    // Award bounty to user profile of answer account
    ctx.accounts.transfer_bounty_ctx(bounty_amount)?;

    // Update question account's state
    let question = &mut ctx.accounts.question;
    question.bounty_awarded = true;
    question.most_recent_engagement_ts = now_ts;

    // Update answer account's state
    let answer = &mut ctx.accounts.answer;
    answer.accepted_answer = true;
    answer.most_recent_engagement_ts = now_ts;

    // Update user profile's state
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    // Update answer user profile's state
    let answer_user_profile = &mut ctx.accounts.answer_user_profile;
    answer_user_profile.most_recent_engagement_ts = now_ts;
    answer_user_profile.answers_accepted.try_add_assign(1)?;
    answer_user_profile.total_bounty_received.try_add_assign(bounty_amount)?;
    answer_user_profile.reputation_score.try_add_assign(accepted_answer_rep)?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the bounty pda account
    let bounty_pda_account_info = &mut ctx.accounts.bounty_pda;
    close_account(bounty_pda_account_info, receiver)?;

    msg!("Answer with pubkey {} now accepted", ctx.accounts.answer.key());
    msg!("User profile with pubkey {} awarded bounty of {}", ctx.accounts.answer_user_profile.key(), bounty_amount);
    Ok(())
}
