use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{Challenge, Forum, Tags, UserProfile};
use prog_common::{now_ts, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_challenge: u8)]
pub struct EditChallenge<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    // Challenge PDA account and seed
    #[account(mut, seeds = [b"challenge".as_ref(), forum.key().as_ref(), challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the challenge struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditChallenge<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(&self.moderator.key, &self.challenge.key(), lamports),
            &[
                self.moderator.to_account_info(),
                self.challenge.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<EditChallenge>, new_tags: Vec<Tags>, new_title: String, new_content_data_url: String, new_challenge_expires_ts: u64, new_reputation: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Record vector length of new tags and character length of new title and content_data_url to be added
    let new_tags_length: u64 = new_tags.len() as u64;
    let new_title_length: u64 = new_title.len() as u64;
    let new_url_length: u64 = new_content_data_url.len() as u64;

    let max_tags_length = ctx.accounts.forum.forum_constants.max_tags_length;
    let max_title_length = ctx.accounts.forum.forum_constants.max_title_length;
    let max_url_length = ctx.accounts.forum.forum_constants.max_url_length;

    // Ensure that the length of new tags vector is non-zero and not greater than max_tags_length
    if (new_tags_length == 0) || (new_tags_length > max_tags_length){
        return Err(error!(ErrorCode::InvalidTagsVectorInput));
    }

    // Ensure that the length of the new title string is non-zero and not more than max_title_length characters long
    if (new_title_length == 0) || (new_title_length > max_title_length) {
        return Err(error!(ErrorCode::InvalidTitleStringInput));
    }

    // Ensure that the length of the new content_data_url string is non-zero and not more than max_url_length characters long
    if (new_url_length == 0) || (new_url_length > max_url_length) {
        return Err(error!(ErrorCode::InvalidUrlStringInput));
    }

    // Ensure new challenge expires timestamp is greater than now timestamp
    if !(new_challenge_expires_ts > now_ts) {
        return Err(error!(ErrorCode::InvalidExpiryTs));
    }

    // Calculate data sizes and convert data to slice arrays
    let mut tag_buffer: Vec<u8> = Vec::new();
    new_tags.serialize(&mut tag_buffer).unwrap();

    let tag_buffer_as_slice: &[u8] = tag_buffer.as_slice();
    let tag_buffer_slice_length: usize = tag_buffer_as_slice.len();

    let mut title_buffer: Vec<u8> = Vec::new();
    new_title.serialize(&mut title_buffer).unwrap();

    let title_buffer_as_slice: &[u8] = title_buffer.as_slice();
    let title_buffer_slice_length: usize = title_buffer_as_slice.len();

    let mut content_data_url_buffer: Vec<u8> = Vec::new();
    new_content_data_url.serialize(&mut content_data_url_buffer).unwrap();

    let content_data_url_buffer_as_slice: &[u8] = content_data_url_buffer.as_slice();
    let content_data_url_buffer_slice_length: usize = content_data_url_buffer_as_slice.len();

    // Calculate total space required for the addition of the new data
    let new_data_bytes_amount: usize = 88 + tag_buffer_slice_length + title_buffer_slice_length + content_data_url_buffer_slice_length + 40;
    let old_data_bytes_amount: usize = ctx.accounts.challenge.to_account_info().data_len();

    if new_data_bytes_amount > old_data_bytes_amount {

        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.challenge.to_account_info().lamports())?;

        // Transfer the required difference in Lamports to accommodate this increase in space
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Reallocate the challenge pda account with the proper byte data size
        ctx.accounts.challenge.to_account_info().realloc(new_data_bytes_amount, false)?;
    }

    // Update challenge account's state
    let challenge = &mut ctx.accounts.challenge;
    challenge.challenge_expires_ts = new_challenge_expires_ts;
    challenge.tags = new_tags;
    challenge.title = new_title;
    challenge.content_data_url = new_content_data_url;
    challenge.content_data_hash = ctx.accounts.new_content_data_hash.key();
    challenge.reputation = new_reputation;

    // Update the moderator profile's state account
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Challenge PDA account with address {} has been edited", ctx.accounts.challenge.key());
    Ok(())
}
