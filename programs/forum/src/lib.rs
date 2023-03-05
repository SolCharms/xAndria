use anchor_lang::prelude::*;
use instructions::*;
use crate::state::{ForumFees, ReputationMatrix, Tags};

declare_id!("FoRUMUrDyBL5wh1N5Lntac21rVNRcktQFmkigLaUp4ab");

pub mod instructions;
pub mod state;

#[program]
pub mod forum {
    use super::*;

    // Anchor is retarded and wants variables passed in, in a certain order
    // It must be ctx, bump_seeds, parameters

    pub fn init_forum(
        ctx: Context<InitForum>,
        _bump_forum_auth: u8,
        forum_fees: ForumFees,
        reputation_matrix: ReputationMatrix,
    ) -> Result<()> {
        msg!("initializing forum");
        instructions::init_forum::handler(
            ctx,
            forum_fees,
            reputation_matrix,
        )
    }

    pub fn update_forum_params(
        ctx: Context<UpdateForumParams>,
        new_forum_fees: ForumFees,
        new_reputation_matrix: ReputationMatrix,
    ) -> Result<()> {
        msg!("updating forum fees");
        instructions::update_forum_params::handler(
            ctx,
            new_forum_fees,
            new_reputation_matrix,
        )
    }

    pub fn payout_from_treasury(
        ctx: Context<PayoutFromTreasury>,
        _bump_forum_treasury: u8,
        minimum_balance_for_rent_exemption: u64,
    ) -> Result<()> {
        msg!("paying out funds from treasury");
        instructions::payout_from_treasury::handler(
            ctx,
            minimum_balance_for_rent_exemption
        )
    }

    pub fn close_forum(
        ctx: Context<CloseForum>,
        _bump_forum_treasury: u8,
    ) -> Result<()> {
        msg!("closing forum");
        instructions::close_forum::handler(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        _bump_forum_auth: u8,
        _bump_treasury: u8,
    ) -> Result<()> {
        msg!("creating user profile");
        instructions::create_user_profile::handler(ctx)
    }

    pub fn edit_user_profile(
        ctx: Context<EditUserProfile>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("editing user profile");
        instructions::edit_user_profile::handler(ctx)
    }

    pub fn delete_user_profile(
        ctx: Context<DeleteUserProfile>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("deleting user profile");
        instructions::delete_user_profile::handler(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_about_me(
        ctx: Context<CreateAboutMe>,
        _bump_user_profile: u8,
        content: String,
    ) -> Result<()> {
        msg!("creating user about me");
        instructions::create_about_me::handler(
            ctx,
            content
        )
    }

    pub fn edit_about_me(
        ctx: Context<EditAboutMe>,
        _bump_user_profile: u8,
        _bump_about_me: u8,
        new_content: String,
    ) -> Result<()> {
        msg!("editing user about me");
        instructions::edit_about_me::handler(
            ctx,
            new_content
        )
    }

    pub fn delete_about_me(
        ctx: Context<DeleteAboutMe>,
        _bump_user_profile: u8,
        _bump_about_me: u8,
    ) -> Result<()> {
        msg!("deleting user about me");
        instructions::delete_about_me::handler(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn add_moderator(
        ctx: Context<AddModerator>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("adding moderator");
        instructions::add_moderator::handler(ctx)
    }

    pub fn remove_moderator(
        ctx: Context<RemoveModerator>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("removing moderator");
        instructions::remove_moderator::handler(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn ask_question(
        ctx: Context<AskQuestion>,
        _bump_treasury: u8,
        _bump_user_profile: u8,
        title: String,
        content: String,
        tags: Tags,
        bounty_amount: u64
    ) -> Result<()> {
        msg!("asking question");
        instructions::ask_question::handler(
            ctx,
            title,
            content,
            tags,
            bounty_amount
        )
    }

    pub fn add_content_to_question(
        ctx: Context<AddContentToQuestion>,
        _bump_user_profile: u8,
        _bump_question: u8,
        new_content: String,
    ) -> Result<()> {
        msg!("adding content to question");
        instructions::add_content_to_question::handler(
            ctx,
            new_content
        )
    }

    pub fn edit_question(
        ctx: Context<EditQuestion>,
        _bump_user_profile: u8,
        _bump_question: u8,
        new_title: String,
        new_content: String,
        new_tags: Tags,
    ) -> Result<()> {
        msg!("editing question");
        instructions::edit_question::handler(
            ctx,
            new_title,
            new_content,
            new_tags
        )
    }

    pub fn delete_question(
        ctx: Context<DeleteQuestion>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_question: u8,
    ) -> Result<()> {
        msg!("deleting question");
        instructions::delete_question::handler(ctx)
    }

}
