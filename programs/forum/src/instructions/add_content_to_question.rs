use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use prog_common::{now_ts, TrySub, errors::ErrorCode};
use crate::state::{Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_question: u8)]
pub struct AddContentToQuestion<'info> {

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

    pub system_program: Program<'info, System>,
}

impl<'info> AddContentToQuestion<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, &self.question.key(), lamports),
            &[
                self.profile_owner.to_account_info(),
                self.question.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<AddContentToQuestion>, new_content: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Record character length of new data to be added
    let new_content_length = new_content.len();

    // Ensure that the length of title and content strings are non-zero
    if new_content_length == 0 {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Calculate new data size and convert data to slice arrays
    let mut content_buffer: Vec<u8> = Vec::new();
    new_content.serialize(&mut content_buffer).unwrap();

    let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
    let content_buffer_slice_length: usize = content_buffer_as_slice.len();

    // Calculate total space required for the addition of the new data
    let old_data_bytes_amount: usize = ctx.accounts.question.to_account_info().data_len();
    let new_data_bytes_amount: usize = old_data_bytes_amount + content_buffer_slice_length;

    // Calculate amount of lamports required to make account rent-exempt according to new data requirement
    let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
    let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.question.to_account_info().lamports())?;

    // Transfer the required difference in Lamports to accommodate this increase in space
    ctx.accounts.pay_lamports_difference(lamports_difference)?;

    // Reallocate the question pda account with the proper byte data size
    ctx.accounts.question.to_account_info().realloc(new_data_bytes_amount, false)?;

    // Update question PDA's most recent engagement
    let question = &mut ctx.accounts.question;
    question.most_recent_engagement_ts = now_ts;

    // Update user profile's most recent engagement
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    let content_string: &mut String = &mut ctx.accounts.question.content;
    content_string.push_str(&new_content);

    msg!("Additional content added to question PDA account with address {}", ctx.accounts.question.key());
    Ok(())
}
