use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_lang::solana_program::system_instruction::{self, create_account};

use prog_common::{now_ts, TryAdd, errors::ErrorCode};
use crate::state::{Forum, Tags, UserProfile};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_user_profile: u8)]
pub struct CreateBigNote<'info> {

    // Forum
    #[account(mut, has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    pub big_note: AccountInfo<'info>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateBigNote<'info> {

    fn transfer_payment_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, self.forum_treasury.key, lamports),
            &[
                self.profile_owner.to_account_info(),
                self.forum_treasury.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<CreateBigNote>, title: String, content: String, tag: Tags) -> Result<()> {

    let bounty_amount: u64 = 0;
    let bounty_awarded = false;
    let solicit_contributors = false;
    let is_verified = false;

    let title_length = title.len();
    let content_length = content.len();

    let now_ts: u64 = now_ts()?;

    // Ensure that the length of title and content strings are non-zero
    if (title_length == 0) || (content_length == 0) {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Ensure that title does not exceed 256 characters
    if title_length > 256 {
        return Err(error!(ErrorCode::TitleTooLong));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"big_note".as_ref(),
            ctx.accounts.forum.key().as_ref(),
            ctx.accounts.user_profile.key().as_ref(),
            ctx.accounts.big_note_seed.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the big note account PDA if it doesn't exist
    if ctx.accounts.big_note.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut tag_buffer: Vec<u8> = Vec::new();
        tag.serialize(&mut tag_buffer).unwrap();

        let tag_buffer_as_slice: &[u8] = tag_buffer.as_slice();
        let tag_buffer_slice_length: usize = tag_buffer_as_slice.len();
        let tag_slice_end_byte = 131 + tag_buffer_slice_length;

        let mut title_buffer: Vec<u8> = Vec::new();
        title.serialize(&mut title_buffer).unwrap();

        let title_buffer_as_slice: &[u8] = title_buffer.as_slice();
        let title_buffer_slice_length: usize = title_buffer_as_slice.len();
        let title_slice_end_byte = tag_slice_end_byte + title_buffer_slice_length;

        let mut content_buffer: Vec<u8> = Vec::new();
        content.serialize(&mut content_buffer).unwrap();

        let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
        let content_buffer_slice_length: usize = content_buffer_as_slice.len();
        let content_slice_end_byte = title_slice_end_byte + content_buffer_slice_length;

        create_pda_with_space(
            &[
                b"big_note".as_ref(),
                ctx.accounts.forum.key().as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                ctx.accounts.big_note_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.big_note,
            8 + 120 + 3 + tag_buffer_slice_length + title_buffer_slice_length + content_buffer_slice_length,
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:BigNote".as_bytes());

        // Pack byte data into Listing account
        let mut big_note_account_raw = ctx.accounts.big_note.data.borrow_mut();
        big_note_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        big_note_account_raw[8..40].clone_from_slice(&ctx.accounts.forum.key().to_bytes());
        big_note_account_raw[40..72].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        big_note_account_raw[72..104].clone_from_slice(&ctx.accounts.big_note_seed.key().to_bytes());
        big_note_account_raw[104..112].clone_from_slice(&now_ts.to_le_bytes());
        big_note_account_raw[112..120].clone_from_slice(&now_ts.to_le_bytes());
        big_note_account_raw[120..128].clone_from_slice(&bounty_amount.to_le_bytes());
        big_note_account_raw[128..129].clone_from_slice(&(solicit_contributors as u8).to_le_bytes());
        big_note_account_raw[129..130].clone_from_slice(&(bounty_awarded as u8).to_le_bytes());
        big_note_account_raw[130..131].clone_from_slice(&(is_verified as u8).to_le_bytes());
        big_note_account_raw[131..tag_slice_end_byte].clone_from_slice(tag_buffer_as_slice);
        big_note_account_raw[tag_slice_end_byte..title_slice_end_byte].clone_from_slice(title_buffer_as_slice);
        big_note_account_raw[title_slice_end_byte..content_slice_end_byte].clone_from_slice(content_buffer_as_slice);

        // Transfer fee for posting big_note
        let forum_big_notes_fee = ctx.accounts.forum.forum_fees.forum_big_notes_fee;

        if forum_big_notes_fee > 0 {
            ctx.accounts.transfer_payment_ctx(forum_big_notes_fee)?;
        }

        // Increment big_notes count in forum state's account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_big_notes_count.try_add_assign(1)?;

        // Increment big_note posted count in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.big_notes_posted.try_add_assign(1)?;

        // Update reputation score in user profile
        let big_notes_rep = ctx.accounts.forum.reputation_matrix.post_big_notes_rep;
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.reputation_score.try_add_assign(big_notes_rep)?;
    }

    msg!("Big Note PDA account with address {} now created", ctx.accounts.big_note.key());
    Ok(())
}

// Auxiliary helper functions

fn create_pda_with_space<'info>(
    pda_seeds: &[&[u8]],
    pda_info: &AccountInfo<'info>,
    space: usize,
    owner: &Pubkey,
    funder_info: &AccountInfo<'info>,
    system_program_info: &AccountInfo<'info>,
) -> Result<()> {
    //create a PDA and allocate space inside of it at the same time - can only be done from INSIDE the program
    //based on https://github.com/solana-labs/solana-program-library/blob/7c8e65292a6ebc90de54468c665e30bc590c513a/feature-proposal/program/src/processor.rs#L148-L163
    invoke_signed(
        &create_account(
            &funder_info.key,
            &pda_info.key,
            1.max(Rent::get()?.minimum_balance(space)),
            space as u64,
            owner,
        ),
        &[
            funder_info.clone(),
            pda_info.clone(),
            system_program_info.clone(),
        ],
        &[pda_seeds], //this is the part you can't do outside the program
    )
        .map_err(Into::into)
}
