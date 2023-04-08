use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

use crate::state::{Forum, UserProfile};
use prog_common::{now_ts, TryAdd};

#[derive(Accounts)]
#[instruction(bump_forum_auth: u8, bump_treasury: u8)]
pub struct CreateUserProfile<'info> {

    // Forum
    #[account(mut, has_one = forum_authority, has_one = forum_treasury)]
    pub forum: Box<Account<'info, Forum>>,

    /// CHECK:
    #[account(seeds = [forum.key().as_ref()], bump = bump_forum_auth)]
    pub forum_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), forum.key().as_ref()], bump = bump_treasury)]
    pub forum_treasury: AccountInfo<'info>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(init, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump, payer = profile_owner, space = 8 + std::mem::size_of::<UserProfile>())]
    pub user_profile: Box<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateUserProfile<'info> {

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

pub fn handler(ctx: Context<CreateUserProfile>) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let forum_profile_fee = ctx.accounts.forum.forum_fees.forum_profile_fee;

    if forum_profile_fee > 0 {
        ctx.accounts.transfer_payment_ctx(forum_profile_fee)?;
    }

    let user_profile = &mut ctx.accounts.user_profile;

    // Record User Profile's State
    user_profile.profile_owner = ctx.accounts.profile_owner.key();
    user_profile.forum = ctx.accounts.forum.key();
    user_profile.profile_created_ts = now_ts;
    user_profile.most_recent_engagement_ts = now_ts;

    user_profile.big_notes_posted = 0;
    user_profile.big_notes_contributions = 0;
    user_profile.questions_asked = 0;
    user_profile.questions_answered = 0;
    user_profile.comments_added = 0;
    user_profile.answers_accepted = 0;
    user_profile.total_bounty_received = 0;
    user_profile.reputation_score = 0;

    // user_profile.nft_pfp_token_mint = ;
    user_profile.has_about_me = false;
    user_profile.has_had_about_me = false;
    user_profile.is_moderator = false;

    // Increment user profile count in forum state's account
    let forum = &mut ctx.accounts.forum;
    forum.forum_counts.forum_profile_count.try_add_assign(1)?;

    msg!("New user profile created for user with wallet address {}", ctx.accounts.profile_owner.key());
    Ok(())
}
