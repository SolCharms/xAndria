use anchor_lang::prelude::*;

use crate::state::{Forum, ForumFees, ReputationMatrix, LATEST_FORUM_VERSION};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_forum_auth: u8)]
pub struct InitForum<'info> {

    // Forum and Forum Manager
    #[account(init, payer = forum_manager, space = 8 + std::mem::size_of::<Forum>())]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub forum_manager: Signer<'info>,

    /// CHECK:
    #[account(seeds = [forum.key().as_ref()], bump = bump_forum_auth)]
    pub forum_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(init, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump, payer = forum_manager, space = 8)]
    pub forum_treasury: AccountInfo<'info>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitForum>, forum_fees: ForumFees, reputation_matrix: ReputationMatrix) -> Result<()> {

    let forum = &mut ctx.accounts.forum;

    // Manually derive the pubkey of the forum authority PDA responsible for all token transfers in/out of the new forum account
    let (forum_authority_key, bump_forum_auth) = Pubkey::find_program_address(&[forum.key().as_ref()], ctx.program_id);
    // Check that the derived authority PDA pubkey matches the one provided
    assert_eq!(ctx.accounts.forum_authority.key(), forum_authority_key);

    // Manually derive the pubkey of the forum treasury PDA
    let (forum_treasury_key, _bump_forum_treasury) = Pubkey::find_program_address(&[b"treasury".as_ref(), forum.key().as_ref()], ctx.program_id);
    // Check that the derived treasury PDA pubkey matches the one provided
    assert_eq!(ctx.accounts.forum_treasury.key(), forum_treasury_key);

    // Assert forum question fee and forum big notes fees in basis points are between 0 - 10,000
    if (forum_fees.forum_question_fee > 10000) || (forum_fees.forum_big_notes_solicitation_fee > 10000) {
        return Err(error!(ErrorCode::InvalidFeeInputs));
    }

    // Record Forum's State
    forum.version = LATEST_FORUM_VERSION;
    forum.forum_manager = ctx.accounts.forum_manager.key();

    forum.forum_authority = ctx.accounts.forum_authority.key();
    forum.forum_authority_seed = forum.key();
    forum.forum_authority_bump_seed = [bump_forum_auth];

    forum.forum_treasury = ctx.accounts.forum_treasury.key();
    forum.forum_fees = forum_fees;

    forum.forum_counts.forum_profile_count = 0;
    forum.forum_counts.forum_big_notes_count = 0;
    forum.forum_counts.forum_question_count = 0;
    forum.forum_counts.forum_answer_count = 0;
    forum.forum_counts.forum_comment_count = 0;

    forum.reputation_matrix = reputation_matrix;

    msg!("New forum account with pubkey {} initialized", ctx.accounts.forum.key());
    Ok(())
}
