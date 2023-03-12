use anchor_lang::prelude::*;
use anchor_lang::Discriminator;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use arrayref::array_ref;
use prog_common::{now_ts, TryAdd};
use prog_common::errors::ErrorCode;
use crate::state::{Answer, Forum, Question, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct LeaveComment<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()], bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    /// CHECK: Account (question or answer) being commented on
    pub commented_on: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub comment: AccountInfo<'info>,

    /// CHECK: The seed address used for initialization of the comment PDA
    pub comment_seed: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<LeaveComment>, content: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;
    let content_length = content.len();

    // Ensure that the length of the content string is non-zero
    if content_length == 0 {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Ensure that the content does not exceed 512 characters
    if content_length > 512 {
        return Err(error!(ErrorCode::ContentTooLong));
    }

    // Ensure that comment is being added to either a question or an answer account
    let commented_on_to_account_info = &ctx.accounts.commented_on.to_account_info();
    let commented_on_account_data: &[u8] = &commented_on_to_account_info.try_borrow_data()?;
    let commented_on_disc = array_ref![commented_on_account_data, 0, 8];

    if (commented_on_disc != &Question::discriminator()) && (commented_on_disc != &Answer::discriminator()) {
        return Err(error!(ErrorCode::InvalidAccountDiscriminator));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"comment".as_ref(),
            ctx.accounts.forum.key().as_ref(),
            ctx.accounts.user_profile.key().as_ref(),
            ctx.accounts.comment_seed.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the answer account PDA if it doesn't exist
    if ctx.accounts.comment.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut content_buffer: Vec<u8> = Vec::new();
        content.serialize(&mut content_buffer).unwrap();

        let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
        let content_buffer_slice_length: usize = content_buffer_as_slice.len();
        let content_slice_end_byte = 120 + content_buffer_slice_length;

        create_pda_with_space(
            &[
                b"comment".as_ref(),
                ctx.accounts.forum.key().as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                ctx.accounts.comment_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.comment,
            8 + 112 + content_buffer_slice_length,
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Comment".as_bytes());

        // Pack byte data into Comment account
        let mut comment_account_raw = ctx.accounts.comment.data.borrow_mut();
        comment_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        comment_account_raw[8..40].clone_from_slice(&ctx.accounts.commented_on.key().to_bytes());
        comment_account_raw[40..72].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        comment_account_raw[72..104].clone_from_slice(&ctx.accounts.comment_seed.key().to_bytes());
        comment_account_raw[104..112].clone_from_slice(&now_ts.to_le_bytes());
        comment_account_raw[112..120].clone_from_slice(&now_ts.to_le_bytes());
        comment_account_raw[120..content_slice_end_byte].clone_from_slice(content_buffer_as_slice);

        // Increment comment count in forum state's account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_comment_count.try_add_assign(1)?;

        // Increment comments added count in user profile's state account
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.comments_added.try_add_assign(1)?;

        // Update reputation score in user profile's state account
        let comment_rep = ctx.accounts.forum.reputation_matrix.comment_rep;
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.reputation_score.try_add_assign(comment_rep)?;
    }

    msg!("Comment PDA account with address {} now created", ctx.accounts.comment.key());
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
