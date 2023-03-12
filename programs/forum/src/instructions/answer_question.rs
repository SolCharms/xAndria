use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use prog_common::{now_ts, TryAdd};
use crate::state::{Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct AnswerQuestion<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Question PDA account
    pub question: Box<Account<'info, Question>>,

    /// CHECK:
    #[account(mut)]
    pub answer: AccountInfo<'info>,

    /// CHECK: The seed address used for initialization of the answer PDA
    pub answer_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AnswerQuestion>, content: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"answer".as_ref(),
            ctx.accounts.forum.key().as_ref(),
            ctx.accounts.user_profile.key().as_ref(),
            ctx.accounts.answer_seed.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the answer account PDA if it doesn't exist
    if ctx.accounts.answer.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut content_buffer: Vec<u8> = Vec::new();
        content.serialize(&mut content_buffer).unwrap();

        let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
        let content_buffer_slice_length: usize = content_buffer_as_slice.len();
        let content_slice_end_byte = 120 + content_buffer_slice_length;

        create_pda_with_space(
            &[
                b"answer".as_ref(),
                ctx.accounts.forum.key().as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                ctx.accounts.answer_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.answer,
            8 + 112 + content_buffer_slice_length + 1,
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Answer".as_bytes());

        let accepted_answer: bool = false;

        // Pack byte data into Answer account
        let mut answer_account_raw = ctx.accounts.answer.data.borrow_mut();
        answer_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        answer_account_raw[8..40].clone_from_slice(&ctx.accounts.question.key().to_bytes());
        answer_account_raw[40..72].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        answer_account_raw[72..104].clone_from_slice(&ctx.accounts.answer_seed.key().to_bytes());
        answer_account_raw[104..112].clone_from_slice(&now_ts.to_le_bytes());
        answer_account_raw[112..120].clone_from_slice(&now_ts.to_le_bytes());
        answer_account_raw[120..content_slice_end_byte].clone_from_slice(content_buffer_as_slice);
        answer_account_raw[content_slice_end_byte..content_slice_end_byte+1].clone_from_slice(&(accepted_answer as u8).to_le_bytes());

        // Increment answer count in forum state's account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_answer_count.try_add_assign(1)?;

        // Increment answer count in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.questions_answered.try_add_assign(1)?;

        // Update reputation score in user profile's state account
        let answer_rep = ctx.accounts.forum.reputation_matrix.answer_rep;
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.reputation_score.try_add_assign(answer_rep)?;
    }

    msg!("Answer PDA account with address {} now created", ctx.accounts.question.key());
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
