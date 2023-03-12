use anchor_lang::prelude::*;

use crate::state::{BigNote, Forum, UserProfile};
use prog_common::errors::ErrorCode;
#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_big_note: u8)]
pub struct VerifyBigNote<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(seeds = [b"user_profile".as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    pub profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<VerifyBigNote>) -> Result<()> {

    let moderator_profile = &ctx.accounts.moderator_profile;

    if !moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    let big_note = &mut ctx.accounts.big_note;
    big_note.is_verified = true;

    msg!("Big Note PDA account with address {} now verified", ctx.accounts.big_note.key());
    Ok(())
}
