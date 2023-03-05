use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use prog_common::{now_ts, TryAdd, errors::ErrorCode};
use crate::state::{Forum, UserProfile};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8)]
pub struct CreateAboutMe<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    about_me: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateAboutMe>, content: String) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Record character length of content data to be added
    let content_length = content.len();

    // Ensure that the length of content string is non-zero
    if content_length == 0 {
        return Err(error!(ErrorCode::InvalidStringInputs));
    }

    // Ensure that content does not exceed 512 characters
    if content_length > 512 {
        return Err(error!(ErrorCode::AboutMeContentTooLong));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"about_me".as_ref(),
            ctx.accounts.user_profile.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the about me account PDA if it doesn't exist
    if ctx.accounts.about_me.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut content_buffer: Vec<u8> = Vec::new();
        content.serialize(&mut content_buffer).unwrap();

        let content_buffer_as_slice: &[u8] = content_buffer.as_slice();
        let content_buffer_slice_length: usize = content_buffer_as_slice.len();
        let content_slice_end_byte = 56 + content_buffer_slice_length;

        create_pda_with_space(
            &[
                b"about_me".as_ref(),
                ctx.accounts.user_profile.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.about_me,
            8 + 32 + 16 + (4 + content_buffer_slice_length),
            ctx.program_id,
            &ctx.accounts.profile_owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:AboutMe".as_bytes());

        // Pack byte data into Listing account
        let mut about_me_account_raw = ctx.accounts.about_me.data.borrow_mut();
        about_me_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        about_me_account_raw[8..40].clone_from_slice(&ctx.accounts.user_profile.key().to_bytes());
        about_me_account_raw[40..48].clone_from_slice(&now_ts.to_le_bytes());
        about_me_account_raw[48..56].clone_from_slice(&now_ts.to_le_bytes());
        about_me_account_raw[56..content_slice_end_byte].clone_from_slice(content_buffer_as_slice);

        // Update user profile's most recent engagement timestamp and flip has about me boolean
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.most_recent_engagement_ts = now_ts;
        user_profile.has_about_me = true;

        // Update user profile's reputation score if has had about me boolean is false
        if !user_profile.has_had_about_me {
            let about_me_rep = ctx.accounts.forum.reputation_matrix.about_me_rep;
            user_profile.reputation_score.try_add_assign(about_me_rep)?;
            user_profile.has_had_about_me = true;
        }

        msg!("About Me PDA account with address {} now created", ctx.accounts.about_me.key());
    }
    else {
        msg!("About Me PDA account with address {} already exists", ctx.accounts.about_me.key());
    }

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
