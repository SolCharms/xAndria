use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction;

use crate::state::{BigNote, BigNoteVerificationApplication, BigNoteVerificationState, Forum, UserProfile};
use prog_common::{close_account, now_ts, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_big_note: u8, bump_verification_application: u8, bump_verification_fee_pda: u8)]
pub struct DeleteBigNoteVerificationApplicationModerator<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    #[account(mut)]
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    // Big Note Verification Application PDA account
    #[account(mut, seeds = [b"verification_application".as_ref(), big_note.key().as_ref()],
              bump = bump_verification_application, has_one = big_note, has_one = verification_fee_pda)]
    pub verification_application: Box<Account<'info, BigNoteVerificationApplication>>,

    /// CHECK:
    #[account(mut, seeds = [b"verification_fee_pda".as_ref(), big_note.key().as_ref()], bump = bump_verification_fee_pda)]
    pub verification_fee_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> DeleteBigNoteVerificationApplicationModerator<'info> {

    fn transfer_fee_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.verification_fee_pda.key, &self.profile_owner.key(), lamports),
            &[
                self.verification_fee_pda.to_account_info(),
                self.profile_owner.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn delete_big_note_verification_application_moderator(ctx: Context<DeleteBigNoteVerificationApplicationModerator>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Ensure that big note account's verification state is 'AppliedForVerification'
    if !(ctx.accounts.big_note.verification_state == BigNoteVerificationState::AppliedForVerification) {
        return Err(error!(ErrorCode::BigNoteNotAppliedForVerification));
    }

    // Transfer verification fee back to the user profile's owner account
    let verification_fee = ctx.accounts.verification_application.verification_fee;
    ctx.accounts.transfer_fee_ctx(verification_fee)?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.profile_owner.to_account_info();

    // Close the verification PDA account
    let verification_application_account_info = &mut ctx.accounts.verification_application.to_account_info();
    close_account(verification_application_account_info, receiver)?;

    // Close the verification fee PDA account
    let verification_fee_pda_account_info = &mut ctx.accounts.verification_fee_pda.to_account_info();
    close_account(verification_fee_pda_account_info, receiver)?;

    // Update big note account's most recent engagement timestamp and verification state
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_engagement_ts = now_ts;
    big_note.verification_state = BigNoteVerificationState::Unverified;

    // Update moderator profile account's most recent engagement timestamp
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Big Note Verification Application PDA account with address {} has been closed by moderator profile with pubkey {}",
         ctx.accounts.verification_application.key(), ctx.accounts.moderator_profile.key());
    Ok(())
}
