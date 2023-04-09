use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_lang::solana_program::system_instruction::{self, create_account};

use crate::state::{Forum, Tags, UserProfile};
use prog_common::{now_ts, TryAdd, TrySub, TryDiv, TryMul, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_treasury: u8, bump_user_profile: u8)]
pub struct AskQuestion<'info> {

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

    /// CHECK:
    #[account(mut)]
    pub question: AccountInfo<'info>,

    /// CHECK: The seed address used for initialization of the question PDA
    pub question_seed: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the question struct
    pub content_data_hash: AccountInfo<'info>,

    /// CHECK:
    #[account(init, seeds = [b"bounty_pda".as_ref(), question.key().as_ref()], bump, payer = profile_owner, space = 8)]
    pub bounty_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> AskQuestion<'info> {

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

pub fn handler(ctx: Context<AskQuestion>, title: String, tags: Vec<Tags>, bounty_amount: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let bounty_awarded = false;

    let title_length = title.len();
    let forum_bounty_minimum: u64 = ctx.accounts.forum.forum_fees.forum_question_bounty_minimum;

    // Ensure that the length of title and content strings are non-zero
    if title_length == 0 {
        return Err(error!(ErrorCode::InvalidStringInput));
    }

    // Ensure that title does not exceed 256 characters
    if title_length > 256 {
        return Err(error!(ErrorCode::TitleTooLong));
    }

    // Ensure minimum bounty amount is contributed
    if bounty_amount < forum_bounty_minimum {
        return Err(error!(ErrorCode::InvalidBountyAmount));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"question".as_ref(),
            ctx.accounts.forum.key().as_ref(),
            ctx.accounts.user_profile.key().as_ref(),
            ctx.accounts.question_seed.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the question account PDA if it doesn't exist
    if ctx.accounts.question.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut tag_buffer: Vec<u8> = Vec::new();
        tags.serialize(&mut tag_buffer).unwrap();

        let tag_buffer_as_slice: &[u8] = tag_buffer.as_slice();
        let tag_buffer_slice_length: usize = tag_buffer_as_slice.len();
        let tag_slice_end_byte = 128 + tag_buffer_slice_length;

        let mut title_buffer: Vec<u8> = Vec::new();
        title.serialize(&mut title_buffer).unwrap();

        let title_buffer_as_slice: &[u8] = title_buffer.as_slice();
        let title_buffer_slice_length: usize = title_buffer_as_slice.len();
        let title_slice_end_byte = tag_slice_end_byte + title_buffer_slice_length;

        create_pda_with_space(
            &[
                b"question".as_ref(),
                ctx.accounts.forum.key().as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                ctx.accounts.question_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.question,
            8 + 120 + tag_buffer_slice_length + title_buffer_slice_length + 32 + 1,
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Question".as_bytes());

        // Pack byte data into Question account
        let mut question_account_raw = ctx.accounts.question.data.borrow_mut();
        question_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        question_account_raw[8..40].clone_from_slice(&ctx.accounts.forum.key().to_bytes());
        question_account_raw[40..72].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        question_account_raw[72..104].clone_from_slice(&ctx.accounts.question_seed.key().to_bytes());
        question_account_raw[104..112].clone_from_slice(&now_ts.to_le_bytes());
        question_account_raw[112..120].clone_from_slice(&now_ts.to_le_bytes());
        question_account_raw[120..128].clone_from_slice(&bounty_amount.to_le_bytes());
        question_account_raw[128..tag_slice_end_byte].clone_from_slice(tag_buffer_as_slice);
        question_account_raw[tag_slice_end_byte..title_slice_end_byte].clone_from_slice(title_buffer_as_slice);
        question_account_raw[title_slice_end_byte..title_slice_end_byte+32].clone_from_slice(&ctx.accounts.content_data_hash.key().to_bytes());
        question_account_raw[title_slice_end_byte+32..title_slice_end_byte+32+1].clone_from_slice(&(bounty_awarded as u8).to_le_bytes());

        // Transfer fee for asking question
        let forum_question_fee = ctx.accounts.forum.forum_fees.forum_question_fee;

        if forum_question_fee > 0 {
            let remainder = bounty_amount % 10000;
            let bounty_amount_minus_remainder = bounty_amount.try_sub(remainder)?;
            let bounty_amount_mod_10000 = bounty_amount_minus_remainder.try_div(10000)?;
            let question_fee_due = bounty_amount_mod_10000.try_mul(forum_question_fee)?;

            ctx.accounts.transfer_payment_ctx(question_fee_due)?;
        }

        // Transfer bounty into bounty pda account
        ctx.accounts.transfer_bounty_ctx(bounty_amount)?;

        // Increment question count in forum state's account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_question_count.try_add_assign(1)?;

        // Increment question count in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.questions_asked.try_add_assign(1)?;

        // Update most recent engagement in user profile's state account
        user_profile.most_recent_engagement_ts = now_ts;

        // Calculate question reputation score
        let question_rep_multiplier = ctx.accounts.forum.reputation_matrix.question_rep;
        let bounty_amount_modded_remainder = bounty_amount % forum_bounty_minimum;
        let bounty_amount_divisible_minimum = bounty_amount.try_sub(bounty_amount_modded_remainder)?;
        let multiples_bounty_minimum = bounty_amount_divisible_minimum.try_div(forum_bounty_minimum)?;
        let question_rep = multiples_bounty_minimum.try_mul(question_rep_multiplier)?;

        // Update reputation score in user profile
        user_profile.reputation_score.try_add_assign(question_rep)?;
    }

    msg!("Question PDA account with address {} now created", ctx.accounts.question.key());
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
