use anchor_lang::prelude::*;

use crate::state::{BigNote, BountyContributionState, Forum, ProposedContribution, ProposedContributionState, UserProfile};
use prog_common::{close_account, now_ts, TryAdd, TrySub};

#[derive(Accounts)]
#[instruction(bump_user_profile: u8, bump_big_note: u8, bump_bounty_pda: u8, bump_proposal_user_profile: u8, bump_proposed_contribution: u8)]
pub struct AcceptProposedContribution<'info> {

    // Forum
    pub forum: Box<Account<'info, Forum>>,

    pub profile_owner: Signer<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), profile_owner.key().as_ref()],
              bump = bump_user_profile, has_one = forum, has_one = profile_owner)]
    pub user_profile: Box<Account<'info, UserProfile>>,

    // Big Note PDA account and seed
    #[account(mut, seeds = [b"big_note".as_ref(), forum.key().as_ref(), user_profile.key().as_ref(), big_note_seed.key().as_ref()],
              bump = bump_big_note, has_one = forum, has_one = user_profile, has_one = big_note_seed)]
    pub big_note: Box<Account<'info, BigNote>>,

    /// CHECK: The seed address used for initialization of the big note PDA
    pub big_note_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"bounty_pda".as_ref(), big_note.key().as_ref()], bump = bump_bounty_pda)]
    pub bounty_pda: AccountInfo<'info>,

    /// CHECK: Used for seed verification of user profile pda account
    #[account(mut)]
    pub proposal_profile_owner: AccountInfo<'info>,

    // The user profile
    #[account(mut, seeds = [b"user_profile".as_ref(), forum.key().as_ref(), proposal_profile_owner.key().as_ref()],
              bump = bump_proposal_user_profile, has_one = forum, constraint = proposal_user_profile.profile_owner == proposal_profile_owner.key())]
    pub proposal_user_profile: Box<Account<'info, UserProfile>>,

    // Proposed contribution PDA account and seed
    #[account(mut, seeds = [b"answer".as_ref(), forum.key().as_ref(), proposal_user_profile.key().as_ref(), proposed_contribution_seed.key().as_ref()],
              bump = bump_proposed_contribution, constraint = proposed_contribution.user_profile == proposal_user_profile.key(), has_one = proposed_contribution_seed, has_one = big_note)]
    pub proposed_contribution: Box<Account<'info, ProposedContribution>>,

    /// CHECK: The seed address used for initialization of the proposed contribution PDA
    pub proposed_contribution_seed: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx:Context<AcceptProposedContribution>) -> Result<()> {

    let now_ts = now_ts()?;

    let bounty_amount = ctx.accounts.big_note.bounty_amount;
    let accepted_proposal_rep = ctx.accounts.forum.reputation_matrix.accepted_big_notes_contribution_proposal_rep;

    // Manually transfer the lamports from bounty PDA to proposed contribution user profile owner
    let bounty_pda_account_info: &mut AccountInfo = &mut ctx.accounts.bounty_pda.to_account_info();
    let proposal_profile_owner_account_info: &mut AccountInfo = &mut ctx.accounts.proposal_profile_owner.to_account_info();

    let bounty_pda_lamports_initial = bounty_pda_account_info.lamports();
    let proposal_profile_owner_lamports_initial = proposal_profile_owner_account_info.lamports();

    **bounty_pda_account_info.lamports.borrow_mut() = bounty_pda_lamports_initial.try_sub(bounty_amount)?;
    **proposal_profile_owner_account_info.lamports.borrow_mut() = proposal_profile_owner_lamports_initial.try_add(bounty_amount)?;

    // Update big note account's state
    let big_note = &mut ctx.accounts.big_note;
    big_note.bounty_awarded = true;
    big_note.bounty_amount = 0;
    big_note.content_data_hash = ctx.accounts.proposed_contribution.content_data_hash;
    big_note.most_recent_engagement_ts = now_ts;

    // Update bounty contributions in big note account's state
    for index in 0..big_note.bounty_contributions.len() {
        if big_note.bounty_contributions[index].bounty_contribution_state == BountyContributionState::Available {
            big_note.bounty_contributions[index].bounty_contribution_state = BountyContributionState::Awarded;
        }
    }

    // Update proposed contribution account's state
    let proposed_contribution = &mut ctx.accounts.proposed_contribution;
    proposed_contribution.proposed_contribution_state = ProposedContributionState::Accepted;
    proposed_contribution.accepted_contribution_proposal_rep = accepted_proposal_rep;
    proposed_contribution.most_recent_engagement_ts = now_ts;

    // Update user profile's most recent engagement timestamp
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.most_recent_engagement_ts = now_ts;

    // Update proposed contribution user profile's state
    let proposal_user_profile = &mut ctx.accounts.proposal_user_profile;
    proposal_user_profile.most_recent_engagement_ts = now_ts;
    proposal_user_profile.big_notes_contributions_accepted.try_add_assign(1)?;
    proposal_user_profile.total_bounty_earned.try_add_assign(bounty_amount)?;
    proposal_user_profile.reputation_score.try_add_assign(accepted_proposal_rep)?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the bounty pda account
    let bounty_pda_account_info = &mut ctx.accounts.bounty_pda.to_account_info();
    close_account(bounty_pda_account_info, receiver)?;

    msg!("Proposed contribution with pubkey {} now accepted", ctx.accounts.proposed_contribution.key());
    msg!("User profile with pubkey {} awarded bounty of {}", ctx.accounts.proposal_user_profile.key(), bounty_amount);
    Ok(())
}
