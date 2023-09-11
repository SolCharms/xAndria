use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_lang::solana_program::system_instruction::{self, create_account};

use crate::state::{Challenge, Forum, SubmissionState, UserProfile};
use prog_common::{now_ts, TryAdd, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_user_profile: u8, bump_challenge: u8)]
pub struct CreateSubmission<'info> {

    // Forum
    #[account(mut, has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Challenge PDA account and seed
    #[account(seeds = [b"challenge".as_ref(), forum.key().as_ref(),challenge_seed.key().as_ref()],
              bump = bump_challenge, has_one = forum, has_one = challenge_seed)]
    pub challenge: Box<Account<'info, Challenge>>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub submission: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the submission struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateSubmission<'info> {

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

pub fn handler(ctx: Context<CreateSubmission>, content_data_url: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let submission_state = SubmissionState::Pending;

    let url_length: u64 = content_data_url.len() as u64;
    let max_url_length = ctx.accounts.forum.forum_constants.max_url_length;

    // Ensure that the length of the content_data_url string is non-zero and not more than max_url_length characters long
    if (url_length == 0) || (url_length > max_url_length) {
        return Err(error!(ErrorCode::InvalidUrlStringInput));
    }

    // Ensure challenge expires timestamp has not yet passed
    let challenge_expires_ts = ctx.accounts.challenge.challenge_expires_ts;
    if now_ts > challenge_expires_ts {
        return Err(error!(ErrorCode::ChallengeExpired));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"submission".as_ref(),
            ctx.accounts.challenge.key().as_ref(),
            ctx.accounts.user_profile.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the submission account PDA if it doesn't exist
    if ctx.accounts.submission.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays

        let mut content_data_url_buffer: Vec<u8> = Vec::new();
        content_data_url.serialize(&mut content_data_url_buffer).unwrap();

        let content_data_url_buffer_as_slice: &[u8] = content_data_url_buffer.as_slice();
        let content_data_url_buffer_slice_length: usize = content_data_url_buffer_as_slice.len();
        let content_data_url_slice_end_byte = 88 + content_data_url_buffer_slice_length;

        let mut submission_state_buffer: Vec<u8> = Vec::new();
        submission_state.serialize(&mut submission_state_buffer).unwrap();

        let submission_state_buffer_as_slice: &[u8] = submission_state_buffer.as_slice();
        let submission_state_buffer_slice_length: usize = submission_state_buffer_as_slice.len();
        let submission_state_slice_end_byte = content_data_url_slice_end_byte + 32 + submission_state_buffer_slice_length;

        create_pda_with_space(
            &[
                b"submission".as_ref(),
                ctx.accounts.challenge.key().as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.submission,
            8 + 80 + content_data_url_buffer_slice_length + 32 + submission_state_buffer_slice_length,
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Submission".as_bytes());

        // Pack byte data into Submission account
        let mut submission_account_raw = ctx.accounts.submission.data.borrow_mut();
        submission_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        submission_account_raw[8..40].clone_from_slice(&ctx.accounts.challenge.key().to_bytes());
        submission_account_raw[40..72].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        submission_account_raw[72..80].clone_from_slice(&now_ts.to_le_bytes());
        submission_account_raw[80..88].clone_from_slice(&now_ts.to_le_bytes());
        submission_account_raw[88..content_data_url_slice_end_byte].clone_from_slice(content_data_url_buffer_as_slice);
        submission_account_raw[content_data_url_slice_end_byte..content_data_url_slice_end_byte+32].clone_from_slice(&ctx.accounts.content_data_hash.key().to_bytes());
        submission_account_raw[content_data_url_slice_end_byte+32..submission_state_slice_end_byte].clone_from_slice(submission_state_buffer_as_slice);

        // Transfer fee for making submission
        let submission_fee = ctx.accounts.forum.forum_fees.forum_challenge_submission_fee;

        if submission_fee > 0 {
            ctx.accounts.transfer_payment_ctx(submission_fee)?;
        }

        // Increment submission count in forum's state account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_submission_count.try_add_assign(1)?;

        // Increment submission count in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.challenges_submitted.try_add_assign(1)?;

        // Update user profile's most recent engagement ts
        user_profile.most_recent_engagement_ts = now_ts;

        msg!("Submission PDA account with address {} now created", ctx.accounts.submission.key());
    }
    else {
        msg!("Submission PDA account with address {} already exists", ctx.accounts.submission.key());
    }

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
