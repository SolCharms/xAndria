use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{Challenge, Forum, Submission, SubmissionState, UserProfile};
use prog_common::{now_ts, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_challenge: u8, bump_submission: u8)]
pub struct EditSubmissionModerator<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
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

    // Challenge PDA account and seed
    #[account(seeds = [b"challenge".as_ref(), forum.key().as_ref(), challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    #[account(mut, seeds = [b"submission".as_ref(), challenge.key().as_ref(), user_profile.key().as_ref()],
              bump = bump_submission, has_one = challenge, has_one = user_profile)]
    pub submission: Box<Account<'info, Submission>>,

    /// CHECK:
    // The new content data hash of the submission struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditSubmissionModerator<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(&self.moderator.key, &self.submission.key(), lamports),
            &[
                self.moderator.to_account_info(),
                self.submission.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<EditSubmissionModerator>, new_content_data_url: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let submission_state: SubmissionState = ctx.accounts.submission.submission_state;

    let url_length: u64 = new_content_data_url.len() as u64;
    let max_url_length = ctx.accounts.forum.forum_constants.max_url_length;

    // Ensure that the length of the content_data_url string is non-zero and not more than max_url_length characters long
    if (url_length == 0) || (url_length > max_url_length) {
        return Err(error!(ErrorCode::InvalidUrlStringInput));
    }

    // Calculate data sizes and convert data to slice arrays
    let mut content_data_url_buffer: Vec<u8> = Vec::new();
    new_content_data_url.serialize(&mut content_data_url_buffer).unwrap();

    let content_data_url_buffer_as_slice: &[u8] = content_data_url_buffer.as_slice();
    let content_data_url_buffer_slice_length: usize = content_data_url_buffer_as_slice.len();

    let mut submission_state_buffer: Vec<u8> = Vec::new();
    submission_state.serialize(&mut submission_state_buffer).unwrap();

    let submission_state_buffer_as_slice: &[u8] = submission_state_buffer.as_slice();
    let submission_state_buffer_slice_length: usize = submission_state_buffer_as_slice.len();

    // Calculate total space required for the addition of the new data
    let new_data_bytes_amount: usize = 88 + content_data_url_buffer_slice_length + 32 + submission_state_buffer_slice_length;
    let old_data_bytes_amount: usize = ctx.accounts.submission.to_account_info().data_len();

    if new_data_bytes_amount > old_data_bytes_amount {

        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.challenge.to_account_info().lamports())?;

        // Transfer the required difference in Lamports to accommodate this increase in space
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Reallocate the submission pda account with the proper byte data size
        ctx.accounts.submission.to_account_info().realloc(new_data_bytes_amount, false)?;
    }

    // Update submission account's state
    let submission = &mut ctx.accounts.submission;
    submission.most_recent_engagement_ts = now_ts;
    submission.content_data_url = new_content_data_url;
    submission.content_data_hash = ctx.accounts.new_content_data_hash.key();

    // Update moderator profile's most recent engagement ts
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Submission PDA account with address {} has been edited by moderator profile with pubkey {}",
         ctx.accounts.submission.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
