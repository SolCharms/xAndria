use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use prog_common::{now_ts, TrySub, errors::ErrorCode};
use crate::state::{AboutMe, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_about_me: u8)]
pub struct EditAboutMe<'info> {

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(mut, seeds = [b"about_me".as_ref(), user_profile.key().as_ref()],
              bump = bump_about_me, has_one = user_profile)]
    about_me: Box<Account<'info, AboutMe>>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditAboutMe<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, &self.about_me.key(), lamports),
            &[
                self.profile_owner.to_account_info(),
                self.about_me.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<EditAboutMe>, new_content: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Record character length of new content data to be added
    let new_content_length = new_content.len();

    // Ensure that the length of new content string is non-zero
    if new_content_length == 0 {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Ensure that content does not exceed 512 characters
    if new_content_length > 512 {
        return Err(error!(ErrorCode::AboutMeContentTooLong));
    }

    // Calculate data sizes and convert data to slice arrays
    let mut content_buffer: Vec<u8> = Vec::new();
    new_content.serialize(&mut content_buffer).unwrap();

    let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
    let content_buffer_slice_length: usize = content_buffer_as_slice.len();

    // Calculate total space required for the addition of the new data
    let new_data_bytes_amount: usize = 56 + content_buffer_slice_length;
    let old_data_bytes_amount: usize = ctx.accounts.about_me.to_account_info().data_len();

    if new_data_bytes_amount > old_data_bytes_amount {

        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.about_me.to_account_info().lamports())?;

        // Transfer the required difference in Lamports to accommodate this increase in space
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Reallocate the question pda account with the proper byte data size
        ctx.accounts.about_me.to_account_info().realloc(new_data_bytes_amount, false)?;
    }

    // Update user about me account's most recent update timestamp and overwrite with the new content
    let about_me = &mut ctx.accounts.about_me;
    about_me.most_recent_update_ts = now_ts;
    about_me.content = new_content;

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("About Me PDA account with address {} has been edited", ctx.accounts.about_me.key());
    Ok(())
}
