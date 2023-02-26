use anchor_lang::prelude::*;

use prog_common::{close_account, TrySub};
use crate::state::{Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_question: u8)]
pub struct DeleteQuestion<'info> {

    // Forum
    #[account(mut, has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,

    pub forum_manager: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question pda account and seed
    #[account(mut, seeds = [b"question".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), question_seed.key().as_ref()],
              bump = bump_question, has_one = user_profile, has_one = question_seed)]
    question: Box<Account<'info, Question>>,

    /// CHECK: The seed address used for initialization of the listing PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DeleteQuestion>) -> Result<()> {

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the user profile state account
    let question_account_info = &mut (*ctx.accounts.question).to_account_info();
    close_account(question_account_info, receiver)?;

    // Decrement forum question count in forum's state
    let forum = &mut ctx.accounts.forum;
    forum.forum_question_count.try_sub_assign(1)?;

    msg!("Question PDA account with address {} now closed", ctx.accounts.question.key());
    Ok(())
}
