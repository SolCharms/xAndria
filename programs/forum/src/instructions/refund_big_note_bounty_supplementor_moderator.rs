use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::{invoke};
use anchor_lang::solana_program::system_instruction::{self};

use crate::state::{BigNote, BountyContributionState, Forum, UserProfile};
use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8, bump_user_profile: u8, bump_supplementor_profile: u8, bump_big_note: u8, bump_bounty_pda: u8)]
pub struct RefundBigNoteBountySupplementor<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

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

    /// CHECK:
    #[account(mut)]
    pub supplementor: AccountInfo<'info>,

    // The supplementor profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), supplementor.key().as_ref()],
              bump = bump_supplementor_profile, has_one = forum, constraint = supplementor_profile.profile_owner == supplementor.key())]
    pub supplementor_profile: Box<Account<'info, UserProfile>>,

    // Big Note pda account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK: The big note bounty pda account
    #[account(mut, seeds = [b"bounty_pda".as_ref(), big_note.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

}

impl<'info> RefundBigNoteBountySupplementor<'info> {

    fn transfer_bounty_ctx(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.bounty_pda.key, self.supplementor.key, lamports),
            &[
                self.bounty_pda.to_account_info(),
                self.supplementor.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<RefundBigNoteBountySupplementor>) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    let bounty_contributions = &ctx.accounts.big_note.bounty_contributions;
    let supplementor_profile_key = ctx.accounts.supplementor_profile.key();

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Ensure bounty has not yet been awarded
    let is_bounty_awarded = ctx.accounts.big_note.bounty_awarded;
    if is_bounty_awarded {
        return Err(error!(ErrorCode::BountyAlreadyAwarded));
    }

    // Ensure supplementor profile is (still) a bounty contributor for this big note (may have already been refunded)
    if bounty_contributions.iter().find(|&&x| x.bounty_contributor == supplementor_profile_key).is_none() {
        return Err(error!(ErrorCode::NotABountyContributor));
    }

    let mut total_refund_bounty_amount: u64 = 0;
    let indices: Vec<usize> = ctx.accounts.big_note.bounty_contributions.iter().enumerate().filter_map(|(index, &x)| (x.bounty_contributor == supplementor_profile_key).then(|| index)).collect();

    for index in indices {

        // Ensure specific bounty has not yet been awarded or refunded
        if ctx.accounts.big_note.bounty_contributions[index].bounty_contribution_state != BountyContributionState::Available {
            continue;
        }

        let refund_bounty_amount: u64 = ctx.accounts.big_note.bounty_contributions[index].bounty_amount;
        let forum_big_note_bounty_minimum: u64 = ctx.accounts.big_note.bounty_contributions[index].forum_bounty_minimum;
        let bounty_contribution_rep: u64 = ctx.accounts.big_note.bounty_contributions[index].bounty_contribution_rep;

        // Decrement bounty amount and remove bounty contribution entry in big note's state account
        let big_note = &mut ctx.accounts.big_note;
        big_note.bounty_amount.try_sub_assign(refund_bounty_amount)?;
        big_note.bounty_contributions.remove(index);

        // Calculate bounty contribution reputation score
        let bounty_amount_mod_minimum_remainder = refund_bounty_amount % forum_big_note_bounty_minimum;
        let bounty_amount_divisible_minimum = refund_bounty_amount.try_sub(bounty_amount_mod_minimum_remainder)?;
        let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_big_note_bounty_minimum)?;
        let big_note_bounty_rep = multiples_bounty_minimum.try_mul(bounty_contribution_rep)?;

        // Decrement reputation score in supplementor profile's state account
        let supplementor_profile = &mut ctx.accounts.supplementor_profile;
        supplementor_profile.total_bounty_contributed.try_sub_assign(refund_bounty_amount)?;
        supplementor_profile.reputation_score.try_sub_assign(big_note_bounty_rep)?;

        total_refund_bounty_amount.try_add_assign(refund_bounty_amount)?;
    }

    // Transfer the bounty amount from the big note's bounty pda account to the supplementor profile's owner
    ctx.accounts.transfer_bounty_ctx(total_refund_bounty_amount)?;

    // Update moderator profile's most recent engagement
    let moderator_profile = &mut ctx.accounts.moderator_profile;
    moderator_profile.most_recent_engagement_ts = now_ts;

    msg!("Total bounty amount of {} refunded to user profile with pubkey {}",
         total_refund_bounty_amount, ctx.accounts.user_profile.key());
    Ok(())
}
