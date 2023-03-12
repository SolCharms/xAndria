use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use prog_common::{now_ts, TrySub, errors::ErrorCode};
use crate::state::{BigNote, Forum, Tags, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_big_note: u8)]
pub struct EditBigNote<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditBigNote<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, &self.big_note.key(), lamports),
            &[
                self.profile_owner.to_account_info(),
                self.big_note.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<EditBigNote>, new_title: String, new_content: String, new_tags: Tags) -> Result<()> {

    // Record character length of new data to be added
    let new_title_length = new_title.len();
    let new_content_length = new_content.len();

    let now_ts: u64 = now_ts()?;

    // Ensure that the length of title and content strings are non-zero
    if (new_title_length == 0) || (new_content_length == 0) {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Ensure that title does not exceed 256 characters
    if new_title_length > 256 {
        return Err(error!(ErrorCode::TitleTooLong));
    }

    // Calculate data sizes and convert data to slice arrays
    let mut title_buffer: Vec<u8> = Vec::new();
    new_title.serialize(&mut title_buffer).unwrap();

    let title_buffer_as_slice: &[u8] = title_buffer.as_slice();
    let title_buffer_slice_length: usize = title_buffer_as_slice.len();

    let mut content_buffer: Vec<u8> = Vec::new();
    new_content.serialize(&mut content_buffer).unwrap();

    let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
    let content_buffer_slice_length: usize = content_buffer_as_slice.len();

    let mut tag_buffer: Vec<u8> = Vec::new();
    new_tags.serialize(&mut tag_buffer).unwrap();

    let tag_buffer_as_slice: &[u8] = tag_buffer.as_slice();
    let tag_buffer_slice_length: usize = tag_buffer_as_slice.len();

    // Calculate total space required for the addition of the new data
    let new_data_bytes_amount: usize = 131 + title_buffer_slice_length + content_buffer_slice_length + tag_buffer_slice_length;
    let old_data_bytes_amount: usize = ctx.accounts.big_note.to_account_info().data_len();

    if new_data_bytes_amount > old_data_bytes_amount {

        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.big_note.to_account_info().lamports())?;

        // Transfer the required difference in Lamports to accommodate this increase in space
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Reallocate the question pda account with the proper byte data size
        ctx.accounts.big_note.to_account_info().realloc(new_data_bytes_amount, false)?;
    }

    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_update_ts = now_ts;
    big_note.tag = new_tags;
    big_note.title = new_title;
    big_note.content = new_content;

    msg!("Big note PDA account with address {} has been edited", ctx.accounts.big_note.key());
    Ok(())
}
