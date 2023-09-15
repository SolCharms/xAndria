use anchor_lang::prelude::*;

use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use crate::state::{Forum, Tags, UserProfile};
use prog_common::{now_ts, TryAdd, errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_moderator_profile: u8)]
pub struct CreateChallenge<'info> {

    // Forum
    #[account(mut)]
    pub forum: Box<Account<'info, Forum>>,

    #[account(mut)]
    pub moderator: Signer<'info>,

    // The moderator profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), moderator.key().as_ref()],
              bump = bump_moderator_profile, has_one = forum, constraint = moderator_profile.profile_owner == moderator.key())]
    pub moderator_profile: Box<Account<'info, UserProfile>>,

    /// CHECK:
    #[account(mut)]
    pub challenge: AccountInfo<'info>,

    /// CHECK: The seed address used for initialization of the challenge PDA
    pub challenge_seed: AccountInfo<'info>,

    /// CHECK:
    // The content data hash of the challenge struct
    pub content_data_hash: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateChallenge>, tags: Vec<Tags>, title: String, content_data_url: String, challenge_expires_ts: u64, reputation: u64) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    if !ctx.accounts.moderator_profile.is_moderator {
        return Err(error!(ErrorCode::ProfileIsNotModerator));
    }

    // Record vector length of tags and character lengths of title and content_data_url to be added
    let tags_length: u64 = tags.len() as u64;
    let title_length: u64 = title.len() as u64;
    let url_length: u64 = content_data_url.len() as u64;

    let max_tags_length = ctx.accounts.forum.forum_constants.max_tags_length;
    let max_title_length = ctx.accounts.forum.forum_constants.max_title_length;
    let max_url_length = ctx.accounts.forum.forum_constants.max_url_length;

    // Ensure that the length of tags vector is non-zero and not greater than max_tags_length
    if (tags_length == 0) || (tags_length > max_tags_length){
        return Err(error!(ErrorCode::InvalidTagsVectorInput));
    }

    // Ensure that the length of the title string is non-zero and not more than max_title_length characters long
    if (title_length == 0) || (title_length > max_title_length) {
        return Err(error!(ErrorCode::InvalidTitleStringInput));
    }

    // Ensure that the length of the content_data_url string is non-zero and not more than max_url_length characters long
    if (url_length == 0) || (url_length > max_url_length) {
        return Err(error!(ErrorCode::InvalidUrlStringInput));
    }

    // Ensure challenge expires timestamp is greater than now timestamp
    if !(challenge_expires_ts > now_ts) {
        return Err(error!(ErrorCode::InvalidExpiryTs));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"challenge".as_ref(),
            ctx.accounts.forum.key().as_ref(),
            ctx.accounts.challenge_seed.key().as_ref()
        ],
        ctx.program_id,
    );

    // Create the challenge account PDA if it doesn't exist
    if ctx.accounts.challenge.data_is_empty() {

        // Calculate data sizes and convert data to slice arrays
        let mut tag_buffer: Vec<u8> = Vec::new();
        tags.serialize(&mut tag_buffer).unwrap();

        let tag_buffer_as_slice: &[u8] = tag_buffer.as_slice();
        let tag_buffer_slice_length: usize = tag_buffer_as_slice.len();
        let tag_slice_end_byte = 96 + tag_buffer_slice_length;

        let mut title_buffer: Vec<u8> = Vec::new();
        title.serialize(&mut title_buffer).unwrap();

        let title_buffer_as_slice: &[u8] = title_buffer.as_slice();
        let title_buffer_slice_length: usize = title_buffer_as_slice.len();
        let title_slice_end_byte = tag_slice_end_byte + title_buffer_slice_length;

        let mut content_data_url_buffer: Vec<u8> = Vec::new();
        content_data_url.serialize(&mut content_data_url_buffer).unwrap();

        let content_data_url_buffer_as_slice: &[u8] = content_data_url_buffer.as_slice();
        let content_data_url_buffer_slice_length: usize = content_data_url_buffer_as_slice.len();
        let content_data_url_slice_end_byte = title_slice_end_byte + content_data_url_buffer_slice_length;

        create_pda_with_space(
            &[
                b"challenge".as_ref(),
                ctx.accounts.forum.key().as_ref(),
                ctx.accounts.challenge_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.challenge,
            8 + 80 + tag_buffer_slice_length + title_buffer_slice_length + content_data_url_buffer_slice_length + 40,
            ctx.program_id,
            &ctx.accounts.moderator.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Challenge".as_bytes());

        // Pack byte data into Challenge account
        let mut challenge_account_raw = ctx.accounts.challenge.data.borrow_mut();
        challenge_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        challenge_account_raw[8..40].clone_from_slice(&ctx.accounts.forum.key().to_bytes());
        challenge_account_raw[40..72].clone_from_slice(&ctx.accounts.challenge_seed.key().to_bytes());
        challenge_account_raw[72..80].clone_from_slice(&now_ts.to_le_bytes());
        challenge_account_raw[80..88].clone_from_slice(&challenge_expires_ts.to_le_bytes());
        challenge_account_raw[88..tag_slice_end_byte].clone_from_slice(tag_buffer_as_slice);
        challenge_account_raw[tag_slice_end_byte..title_slice_end_byte].clone_from_slice(title_buffer_as_slice);
        challenge_account_raw[title_slice_end_byte..content_data_url_slice_end_byte].clone_from_slice(content_data_url_buffer_as_slice);
        challenge_account_raw[content_data_url_slice_end_byte..content_data_url_slice_end_byte+32].clone_from_slice(&ctx.accounts.content_data_hash.key().to_bytes());
        challenge_account_raw[content_data_url_slice_end_byte+32..content_data_url_slice_end_byte+40].clone_from_slice(&reputation.to_le_bytes());

        // Increment challenge count in forum's state account
        let forum = &mut ctx.accounts.forum;
        forum.forum_counts.forum_challenge_count.try_add_assign(1)?;

        // Update the moderator profile's state account
        let moderator_profile = &mut ctx.accounts.moderator_profile;
        moderator_profile.most_recent_engagement_ts = now_ts;

        msg!("Challenge PDA account with address {} now created", ctx.accounts.challenge.key());
    }
    else {
        msg!("Challenge PDA account with address {} already exists", ctx.accounts.challenge.key());
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
