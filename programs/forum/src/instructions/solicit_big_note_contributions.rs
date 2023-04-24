use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction::{self};

use crate::state::{BigNote, Forum, UserProfile};
use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_user_profile: u8, bump_big_note: u8)]
pub struct SolicitBigNoteContributions<'info> {

    // Forum
    #[account(has_one = forum_treasury)]
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

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(init, seeds = [b"bounty_pda".as_ref(), big_note.key().as_ref()], bump, payer = profile_owner, space = 8)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> SolicitBigNoteContributions<'info> {

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

    fn transfer_bounty_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.profile_owner.key, self.bounty_pda.key, lamports),
            &[
                self.profile_owner.to_account_info(),
                self.bounty_pda.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<SolicitBigNoteContributions>, bounty_amount: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let forum_big_notes_bounty_minimum: u64 = ctx.accounts.forum.forum_fees.forum_big_notes_bounty_minimum;

    // Ensure soliciting contributions boolean is not already true
    if ctx.accounts.big_note.soliciting_contributors {
        // ErrorCode here
    }

    // Ensure minimum bounty amount is contributed
    if bounty_amount < forum_big_notes_bounty_minimum {
        return Err(error!(ErrorCode::InvalidBountyAmount));
    }

    // Transfer fee for soliciting big notes contributions
    let forum_big_notes_solicitation_fee = ctx.accounts.forum.forum_fees.forum_big_notes_solicitation_fee;

    if forum_big_notes_solicitation_fee > 0 {
        let remainder = bounty_amount % 10000;
        let bounty_amount_minus_remainder = bounty_amount.try_sub(remainder)?;
        let bounty_amount_mod_10000 = bounty_amount_minus_remainder.try_div(10000)?;
        let big_notes_solicitation_fee_due = bounty_amount_mod_10000.try_mul(forum_big_notes_solicitation_fee)?;

        ctx.accounts.transfer_payment_ctx(big_notes_solicitation_fee_due)?;
    }

    // Transfer bounty into bounty pda account
    ctx.accounts.transfer_bounty_ctx(bounty_amount)?;

    // Update most recent engagement in user profile's state account
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    // Calculate big note solicitation reputation score
    let big_note_rep_multiplier = ctx.accounts.forum.reputation_matrix.contribute_big_notes_rep;
    let bounty_amount_modded_remainder = bounty_amount % forum_big_notes_bounty_minimum;
    let bounty_amount_divisible_minimum = bounty_amount.try_sub(bounty_amount_modded_remainder)?;
    let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_big_notes_bounty_minimum)?;
    let big_notes_solicitation_rep = multiples_bounty_minimum.try_mul(big_note_rep_multiplier)?;

    // Update reputation score in user profile
    user_profile.reputation_score.try_add_assign(big_notes_solicitation_rep)?;

    // Update big note account's state
    let big_note = &mut ctx.accounts.big_note;
    big_note.most_recent_update_ts = now_ts;
    big_note.bounty_amount = bounty_amount;
    big_note.soliciting_contributors = true;

    msg!("Now soliciting contributions for big note account with pubkey {}", ctx.accounts.big_note.key());
    Ok(())
}
