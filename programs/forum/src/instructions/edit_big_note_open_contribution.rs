use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{BigNote, BigNoteType, BigNoteVerificationState, Forum, Tags, UserProfile};
use prog_common::{now_ts, TrySub, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_editor_profile: u8, bump_user_profile: u8, bump_big_note: u8)]
pub struct EditBigNoteOpenContribution<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub editor: Signer<'info>,

    // The editor profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), editor.key().as_ref()],
              bump = bump_editor_profile, has_one = forum, constraint = editor_profile.profile_owner == editor.key())]
    pub editor_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Used for seed verification of user profile pda account
    pub profile_owner: AccountInfo<'info>,

    // The big note creator's user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK:
    // The new content data hash of the big note struct
    pub new_content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditBigNoteOpenContribution<'info> {
    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.editor.key, &self.big_note.key(), lamports),
            &[
                self.editor.to_account_info(),
                self.big_note.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn edit_big_note_open_contribution(ctx: Context<EditBigNoteOpenContribution>, new_tags: Vec<Tags>, new_title: String, new_content_data_url: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !(ctx.accounts.big_note.big_note_type == BigNoteType::OpenContribution) {
        return Err(error!(ErrorCode::NotOpenContribution));
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

    // Calculate data sizes and convert data to slice arrays
    let bounty_contributions = &ctx.accounts.big_note.bounty_contributions;
    let big_note_type = &ctx.accounts.big_note.big_note_type;
    let old_verification_state = ctx.accounts.big_note.verification_state;
    let new_verification_state = BigNoteVerificationState::Unverified;

    let mut contribution_buffer: Vec<u8> = Vec::new();
    bounty_contributions.serialize(&mut contribution_buffer).unwrap();

    let contribution_buffer_as_slice: &[u8] = contribution_buffer.as_slice();
    let contribution_buffer_slice_length: usize = contribution_buffer_as_slice.len();

    let mut type_buffer: Vec<u8> = Vec::new();
    big_note_type.serialize(&mut type_buffer).unwrap();

    let type_buffer_as_slice: &[u8] = type_buffer.as_slice();
    let type_buffer_slice_length: usize = type_buffer_as_slice.len();

    let mut verification_buffer: Vec<u8> = Vec::new();
    new_verification_state.serialize(&mut verification_buffer).unwrap();

    let verification_buffer_as_slice: &[u8] = verification_buffer.as_slice();
    let verification_buffer_slice_length: usize = verification_buffer_as_slice.len();

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
    let new_data_bytes_amount: usize = 8 + 120 + contribution_buffer_slice_length + type_buffer_slice_length + verification_buffer_slice_length + tag_buffer_slice_length + title_buffer_slice_length + content_data_url_buffer_slice_length + 49;
    let old_data_bytes_amount: usize = ctx.accounts.big_note.to_account_info().data_len();

    if new_data_bytes_amount > old_data_bytes_amount {

        let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
        let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.big_note.to_account_info().lamports())?;

        // Transfer the required difference in Lamports to accommodate this increase in space
        ctx.accounts.pay_lamports_difference(lamports_difference)?;

        // Reallocate the big note pda account with the proper byte data size
        ctx.accounts.big_note.to_account_info().realloc(new_data_bytes_amount, false)?;
    }

    if old_verification_state == BigNoteVerificationState::Verified {
        let big_note_verification_rep: u64 = ctx.accounts.big_note.big_note_verification_rep;
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.big_notes_verified.try_sub_assign(1)?;
        user_profile.reputation_score.try_sub_assign(big_note_verification_rep)?;
    }

    // Update big note account's most recent engagement timestamp and overwrite with the new content and data hash
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;
    big_note.verification_state = new_verification_state;
    big_note.tags = new_tags;
    big_note.title = new_title;
    big_note.content_data_url = new_content_data_url;
    big_note.content_data_hash = ctx.accounts.new_content_data_hash.key();
    big_note.big_note_verification_rep = 0;

    // Update editor profile's most recent engagement
    let editor_profile = &mut ctx.accounts.editor_profile;
    editor_profile.most_recent_engagement_ts = now_ts;

    msg!("Big note PDA account with address {} has been edited by user profile with pubkey {}",
         ctx.accounts.big_note.key(), ctx.accounts.user_profile.key());
    Ok(())
}
