use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{BigNote, BigNoteVerificationApplication, BigNoteVerificationState, Forum, UserProfile};
use prog_common::{now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_big_note: u8)]
pub struct ApplyForBigNoteVerification<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    // Big Note Verification Application PDA account
    #[account(init, seeds = [b"verification_application".as_ref(), big_note.key().as_ref()],
              bump, payer = profile_owner, space = 8)]
    pub verification_application: Box<Account<'info, BigNoteVerificationApplication>>,

    /// CHECK:
    #[account(init, seeds = [b"verification_fee_pda".as_ref(), big_note.key().as_ref()], bump, payer = profile_owner, space = 8)]
    pub verification_fee_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ApplyForBigNoteVerification<'info> {

    fn transfer_fee_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, &self.verification_fee_pda.key(), lamports),
            &[
                self.profile_owner.to_account_info(),
                self.verification_fee_pda.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn apply_for_big_note_verification(ctx: Context<ApplyForBigNoteVerification>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let verification_fee: u64 = ctx.accounts.forum.forum_fees.forum_big_notes_verification_fee;
    let big_note_verification_state = ctx.accounts.big_note.verification_state;

    // Ensure big note is not already verified or an application for verification has not already been submitted
    if !(big_note_verification_state == BigNoteVerificationState::Unverified) {
        return Err(error!(ErrorCode::BigNoteNotUnverified));
    }

    // Transfer the big note verification fee to the verification fee pda
    ctx.accounts.transfer_fee_ctx(verification_fee)?;

    // Record big note verification application's state
    let verification_application = &mut ctx.accounts.verification_application;
    verification_application.big_note = ctx.accounts.big_note.key();
    verification_application.verification_fee_pda = ctx.accounts.verification_fee_pda.key();
    verification_application.verification_fee = verification_fee;

    // Update big note account's most recent engagement timestamp and verification state
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;
    big_note.verification_state = BigNoteVerificationState::AppliedForVerification;

    // Update user profile account's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    msg!("Created Big Note verification application PDA with account address {}",
         ctx.accounts.verification_application.key());
    Ok(())
}
