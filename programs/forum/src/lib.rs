use anchor_lang::prelude::*;
use instructions::*;
use crate::state::{BigNoteType, ForumConstants, ForumFees, ReputationMatrix, SubmissionState, Tags};

declare_id!("FoRUMvAQAPBBJhMvw2UAc1Yx67rxQf9eao87b75GJ857");

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
        forum_constants: ForumConstants,
        reputation_matrix: ReputationMatrix,
    ) -> Result<()> {
        msg!("initializing forum");
        instructions::init_forum::init_forum(
            ctx,
            forum_fees,
            forum_constants,
            reputation_matrix
        )
    }

    pub fn update_forum_params(
        ctx: Context<UpdateForumParams>,
        new_forum_fees: ForumFees,
        new_forum_constants: ForumConstants,
        new_reputation_matrix: ReputationMatrix,
    ) -> Result<()> {
        msg!("updating forum parameters");
        instructions::update_forum_params::update_forum_params(
            ctx,
            new_forum_fees,
            new_forum_constants,
            new_reputation_matrix
        )
    }

    pub fn payout_from_treasury(
        ctx: Context<PayoutFromTreasury>,
        _bump_forum_treasury: u8,
    ) -> Result<()> {
        msg!("paying out funds from treasury");
        instructions::payout_from_treasury::payout_from_treasury(ctx)
    }

    pub fn close_forum(
        ctx: Context<CloseForum>,
        _bump_forum_treasury: u8,
    ) -> Result<()> {
        msg!("closing forum");
        instructions::close_forum::close_forum(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        _bump_treasury: u8,
    ) -> Result<()> {
        msg!("creating user profile");
        instructions::create_user_profile::create_user_profile(ctx)
    }

    pub fn edit_user_profile(
        ctx: Context<EditUserProfile>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("editing user profile");
        instructions::edit_user_profile::edit_user_profile(ctx)
    }

    pub fn delete_user_profile(
        ctx: Context<DeleteUserProfile>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("deleting user profile");
        instructions::delete_user_profile::delete_user_profile(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_about_me(
        ctx: Context<CreateAboutMe>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("creating user about me");
        instructions::create_about_me::create_about_me(ctx)
    }

    pub fn edit_about_me(
        ctx: Context<EditAboutMe>,
        _bump_user_profile: u8,
        _bump_about_me: u8,
    ) -> Result<()> {
        msg!("editing user about me");
        instructions::edit_about_me::edit_about_me(ctx)
    }

    pub fn delete_about_me(
        ctx: Context<DeleteAboutMe>,
        _bump_user_profile: u8,
        _bump_about_me: u8,
    ) -> Result<()> {
        msg!("deleting user about me");
        instructions::delete_about_me::delete_about_me(ctx)
    }

    pub fn delete_user_profile_and_about_me(
        ctx: Context<DeleteUserProfileAndAboutMe>,
        _bump_user_profile: u8,
        _bump_about_me: u8,
    ) -> Result<()>{
        msg!("deleting user profile and about me");
        instructions::delete_user_profile_and_about_me::delete_user_profile_and_about_me(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn add_moderator(
        ctx: Context<AddModerator>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("adding moderator");
        instructions::add_moderator::add_moderator(ctx)
    }

    pub fn remove_moderator(
        ctx: Context<RemoveModerator>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("removing moderator");
        instructions::remove_moderator::remove_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn ask_question(
        ctx: Context<AskQuestion>,
        _bump_treasury: u8,
        _bump_user_profile: u8,
        tags: Vec<Tags>,
        title: String,
        content_data_url: String,
        bounty_amount: u64
    ) -> Result<()> {
        msg!("asking question");
        instructions::ask_question::ask_question(
            ctx,
            tags,
            title,
            content_data_url,
            bounty_amount
        )
    }

    pub fn edit_question(
        ctx: Context<EditQuestion>,
        _bump_user_profile: u8,
        _bump_question: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String
    ) -> Result<()> {
        msg!("editing question");
        instructions::edit_question::edit_question(
            ctx,
            new_tags,
            new_title,
            new_content_data_url
        )
    }

    pub fn edit_question_moderator(
        ctx: Context<EditQuestionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_question: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String
    ) -> Result<()> {
        msg!("moderator editing question");
        instructions::edit_question_moderator::edit_question_moderator(
            ctx,
            new_tags,
            new_title,
            new_content_data_url
        )
    }

    pub fn delete_question_moderator(
        ctx: Context<DeleteQuestionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_question: u8,
    ) -> Result<()> {
        msg!("moderator deleting question");
        instructions::delete_question_moderator::delete_question_moderator(ctx)
    }

    pub fn supplement_question_bounty(
        ctx: Context<SupplementQuestionBounty>,
        _bump_treasury: u8,
        _bump_supplementor_profile: u8,
        _bump_user_profile: u8,
        _bump_question: u8,
        _bump_bounty_pda: u8,
        supplemental_bounty_amount: u64,
    ) -> Result<()> {
        msg!("supplementing question bounty");
        instructions::supplement_question_bounty::supplement_question_bounty(
            ctx,
            supplemental_bounty_amount
        )
    }

    pub fn refund_question_bounty_supplementor_moderator(
        ctx: Context<RefundQuestionBountySupplementorModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_supplementor_profile: u8,
        _bump_question: u8,
        _bump_bounty_pda: u8,
    ) -> Result<()>{
        msg!("moderator refunding question bounty supplementor");
        instructions::refund_question_bounty_supplementor_moderator::refund_question_bounty_supplementor_moderator(ctx)
    }

    pub fn accept_answer(
        ctx: Context<AcceptAnswer>,
        _bump_user_profile: u8,
        _bump_question: u8,
        _bump_bounty_pda: u8,
        _bump_answer_user_profile: u8,
        _bump_answer: u8,
    ) -> Result<()> {
        msg!("accepting answer");
        instructions::accept_answer::accept_answer(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn answer_question(
        ctx: Context<AnswerQuestion>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("answering question");
        instructions::answer_question::answer_question(ctx)
    }

    pub fn edit_answer(
        ctx: Context<EditAnswer>,
        _bump_user_profile: u8,
        _bump_answer: u8,
    ) -> Result<()> {
        msg!("editing answer");
        instructions::edit_answer::edit_answer(ctx)
    }

    pub fn edit_answer_moderator(
        ctx: Context<EditAnswerModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_answer: u8,
    ) -> Result<()> {
        msg!("moderator editing answer");
        instructions::edit_answer_moderator::edit_answer_moderator(ctx)
    }

    pub fn delete_answer(
        ctx: Context<DeleteAnswer>,
        _bump_user_profile: u8,
        _bump_answer: u8,
    ) -> Result<()> {
        msg!("deleting answer");
        instructions::delete_answer::delete_answer(ctx)
    }

    pub fn delete_answer_moderator(
        ctx: Context<DeleteAnswerModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_answer: u8,
    ) -> Result<()> {
        msg!("moderator deleting answer");
        instructions::delete_answer_moderator::delete_answer_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn leave_comment_on_question(
        ctx: Context<LeaveCommentOnQuestion>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("leaving comment on question");
        instructions::leave_comment_on_question::leave_comment_on_question(ctx)
    }

    pub fn edit_comment_on_question(
        ctx: Context<EditCommentOnQuestion>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("editing comment on question");
        instructions::edit_comment_on_question::edit_comment_on_question(ctx)
    }

    pub fn edit_comment_on_question_moderator(
        ctx: Context<EditCommentOnQuestionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator editing comment on question");
        instructions::edit_comment_on_question_moderator::edit_comment_on_question_moderator(ctx)
    }

    pub fn delete_comment_on_question(
        ctx: Context<DeleteCommentOnQuestion>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("deleting comment on question");
        instructions::delete_comment_on_question::delete_comment_on_question(ctx)
    }

    pub fn delete_comment_on_question_moderator(
        ctx: Context<DeleteCommentOnQuestionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator deleting comment on question");
        instructions::delete_comment_on_question_moderator::delete_comment_on_question_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn leave_comment_on_answer(
        ctx: Context<LeaveCommentOnAnswer>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("leaving comment on answer");
        instructions::leave_comment_on_answer::leave_comment_on_answer(ctx)
    }

    pub fn edit_comment_on_answer(
        ctx: Context<EditCommentOnAnswer>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("editing comment on answer");
        instructions::edit_comment_on_answer::edit_comment_on_answer(ctx)
    }

    pub fn edit_comment_on_answer_moderator(
        ctx: Context<EditCommentOnAnswerModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator editing comment on answer");
        instructions::edit_comment_on_answer_moderator::edit_comment_on_answer_moderator(ctx)
    }

    pub fn delete_comment_on_answer(
        ctx: Context<DeleteCommentOnAnswer>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("deleting comment on answer");
        instructions::delete_comment_on_answer::delete_comment_on_answer(ctx)
    }

    pub fn delete_comment_on_answer_moderator(
        ctx: Context<DeleteCommentOnAnswerModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator deleting comment on answer");
        instructions::delete_comment_on_answer_moderator::delete_comment_on_answer_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_big_note(
        ctx: Context<CreateBigNote>,
        _bump_treasury: u8,
        _bump_user_profile: u8,
        big_note_type: BigNoteType,
        tags: Vec<Tags>,
        title: String,
        content_data_url: String,
    ) -> Result<()> {
        msg!("creating big note");
        instructions::create_big_note::create_big_note(
            ctx,
            big_note_type,
            tags,
            title,
            content_data_url
        )
    }

    pub fn edit_big_note_open_contribution(
        ctx: Context<EditBigNoteOpenContribution>,
        _bump_editor_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String,
    ) -> Result<()> {
        msg!("editing big note");
        instructions::edit_big_note_open_contribution::edit_big_note_open_contribution(
            ctx,
            new_tags,
            new_title,
            new_content_data_url
        )
    }

    pub fn edit_big_note_creator_curated(
        ctx: Context<EditBigNoteCreatorCurated>,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String,
    ) -> Result<()> {
        msg!("editing big note");
        instructions::edit_big_note_creator_curated::edit_big_note_creator_curated(
            ctx,
            new_tags,
            new_title,
            new_content_data_url
        )
    }

    pub fn edit_big_note_moderator(
        ctx: Context<EditBigNoteModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String,
    ) -> Result<()> {
        msg!("moderator editing big note");
        instructions::edit_big_note_moderator::edit_big_note_moderator(
            ctx,
            new_tags,
            new_title,
            new_content_data_url
        )
    }

    pub fn delete_big_note_moderator(
        ctx: Context<DeleteBigNoteModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
    ) -> Result<()> {
        msg!("moderator deleting big note");
        instructions::delete_big_note_moderator::delete_big_note_moderator(ctx)
    }

    pub fn supplement_big_note_bounty(
        ctx: Context<SupplementBigNoteBounty>,
        _bump_treasury: u8,
        _bump_supplementor_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_bounty_pda: u8,
        supplemental_bounty_amount: u64
    ) -> Result<()> {
        msg!("supplementing big note bounty");
        instructions::supplement_big_note_bounty::supplement_big_note_bounty(
            ctx,
            supplemental_bounty_amount
        )
    }

    pub fn refund_big_note_bounty_supplementor_moderator(
        ctx: Context<RefundBigNoteBountySupplementorModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_supplementor_profile: u8,
        _bump_big_note: u8,
        _bump_bounty_pda: u8
    ) -> Result<()> {
        msg!("moderator refunding big note bounty supplementor");
        instructions::refund_big_note_bounty_supplementor_moderator::refund_big_note_bounty_supplementor_moderator(ctx)
    }

    pub fn accept_proposed_contribution(
        ctx: Context<AcceptProposedContribution>,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_bounty_pda: u8,
        _bump_proposal_user_profile: u8,
        _bump_proposed_contribution: u8
    ) -> Result<()> {
        msg!("accepting proposed contribution");
        instructions::accept_proposed_contribution::accept_proposed_contribution(ctx)
    }

    pub fn reject_proposed_contribution(
        ctx: Context<RejectProposedContribution>,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_proposal_user_profile: u8,
        _bump_proposed_contribution: u8
    ) -> Result<()> {
        msg!("rejecting proposed contribution");
        instructions::reject_proposed_contribution::reject_proposed_contribution(ctx)
    }

    pub fn apply_for_big_note_verification(
        ctx: Context<ApplyForBigNoteVerification>,
        _bump_user_profile: u8,
        _bump_big_note: u8,
    ) -> Result<()> {
        msg!("applying for big note verification");
        instructions::apply_for_big_note_verification::apply_for_big_note_verification(ctx)
    }

    pub fn delete_big_note_verification_application(
        ctx: Context<DeleteBigNoteVerificationApplication>,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_verification_application: u8,
        _bump_verification_fee_pda: u8
    ) -> Result<()> {
        msg!("deleting big note verification application");
        instructions::delete_big_note_verification_application::delete_big_note_verification_application(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn accept_big_note_verification_application(
        ctx: Context<AcceptBigNoteVerificationApplication>,
        _bump_treasury: u8,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_verification_application: u8,
        _bump_verification_fee_pda: u8
    ) -> Result<()> {
        msg!("accepting big note verification application");
        instructions::accept_big_note_verification_application::accept_big_note_verification_application(ctx)
    }

    pub fn reject_big_note_verification_application(
        ctx: Context<RejectBigNoteVerificationApplication>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_big_note: u8,
        _bump_verification_application: u8,
        _bump_verification_fee_pda: u8
    ) -> Result<()> {
        msg!("rejecting big note verification application");
        instructions::reject_big_note_verification_application::reject_big_note_verification_application(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn propose_contribution(
        ctx: Context<ProposeContribution>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("proposing contribution");
        instructions::propose_contribution::propose_contribution(ctx)
    }

    pub fn edit_proposed_contribution(
        ctx: Context<EditProposedContribution>,
        _bump_user_profile: u8,
        _bump_proposed_contribution: u8,
    ) -> Result<()> {
        msg!("editing proposed contribution");
        instructions::edit_proposed_contribution::edit_proposed_contribution(ctx)
    }

    pub fn edit_proposed_contribution_moderator(
        ctx: Context<EditProposedContributionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_proposed_contribution: u8,
    ) -> Result<()> {
        msg!("moderator editing proposed contribution");
        instructions::edit_proposed_contribution_moderator::edit_proposed_contribution_moderator(ctx)
    }

    pub fn delete_proposed_contribution(
        ctx: Context<DeleteProposedContribution>,
        _bump_user_profile: u8,
        _bump_proposed_contribution: u8,
    ) -> Result<()> {
        msg!("deleting proposed contribution");
        instructions::delete_proposed_contribution::delete_proposed_contribution(ctx)
    }

    pub fn delete_proposed_contribution_moderator(
        ctx: Context<DeleteProposedContributionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_proposed_contribution: u8,
    ) -> Result<()> {
        msg!("moderator deleting proposed contribution");
        instructions::delete_proposed_contribution_moderator::delete_proposed_contribution_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn leave_comment_on_big_note(
        ctx: Context<LeaveCommentOnBigNote>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("leaving comment on big note");
        instructions::leave_comment_on_big_note::leave_comment_on_big_note(ctx)
    }

    pub fn edit_comment_on_big_note(
        ctx: Context<EditCommentOnBigNote>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("editing comment on big note");
        instructions::edit_comment_on_big_note::edit_comment_on_big_note(ctx)
    }

    pub fn edit_comment_on_big_note_moderator(
        ctx: Context<EditCommentOnBigNoteModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator editing comment on big note");
        instructions::edit_comment_on_big_note_moderator::edit_comment_on_big_note_moderator(ctx)
    }

    pub fn delete_comment_on_big_note(
        ctx: Context<DeleteCommentOnBigNote>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("deleting comment on big note");
        instructions::delete_comment_on_big_note::delete_comment_on_big_note(ctx)
    }

    pub fn delete_comment_on_big_note_moderator(
        ctx: Context<DeleteCommentOnBigNoteModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator deleting comment on big note");
        instructions::delete_comment_on_big_note_moderator::delete_comment_on_big_note_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn leave_comment_on_proposed_contribution(
        ctx: Context<LeaveCommentOnProposedContribution>,
        _bump_user_profile: u8,
    ) -> Result<()> {
        msg!("leaving comment on proposed contribution");
        instructions::leave_comment_on_proposed_contribution::leave_comment_on_proposed_contribution(ctx)
    }

    pub fn edit_comment_on_proposed_contribution(
        ctx: Context<EditCommentOnProposedContribution>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("editing comment on proposed contribution");
        instructions::edit_comment_on_proposed_contribution::edit_comment_on_proposed_contribution(ctx)
    }

    pub fn edit_comment_on_proposed_contribution_moderator(
        ctx: Context<EditCommentOnProposedContributionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator editing comment on proposed contribution");
        instructions::edit_comment_on_proposed_contribution_moderator::edit_comment_on_proposed_contribution_moderator(ctx)
    }

    pub fn delete_comment_on_proposed_contribution(
        ctx: Context<DeleteCommentOnProposedContribution>,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("deleting comment on proposed contribution");
        instructions::delete_comment_on_proposed_contribution::delete_comment_on_proposed_contribution(ctx)
    }

    pub fn delete_comment_on_proposed_contribution_moderator(
        ctx: Context<DeleteCommentOnProposedContributionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_comment: u8,
    ) -> Result<()> {
        msg!("moderator deleting comment on proposed contribution");
        instructions::delete_comment_on_proposed_contribution_moderator::delete_comment_on_proposed_contribution_moderator(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        _bump_moderator_profile: u8,
        tags: Vec<Tags>,
        title: String,
        content_data_url: String,
        challenge_expires_ts: u64,
        reputation: u64,
    ) -> Result<()> {
        msg!("moderator creating challenge");
        instructions::create_challenge::create_challenge(
            ctx,
            tags,
            title,
            content_data_url,
            challenge_expires_ts,
            reputation
        )
    }

    pub fn edit_challenge(
        ctx: Context<EditChallenge>,
        _bump_moderator_profile: u8,
        _bump_challenge: u8,
        new_tags: Vec<Tags>,
        new_title: String,
        new_content_data_url: String,
        new_challenge_expires_ts: u64,
        new_reputation: u64,
    ) -> Result<()> {
        msg!("moderator editing challenge");
        instructions::edit_challenge::edit_challenge(
            ctx,
            new_tags,
            new_title,
            new_content_data_url,
            new_challenge_expires_ts,
            new_reputation
        )
    }

    pub fn delete_challenge(
        ctx: Context<DeleteChallenge>,
        _bump_moderator_profile: u8,
        _bump_challenge: u8,
    ) -> Result<()> {
        msg!("moderator deleting challenge");
        instructions::delete_challenge::delete_challenge(ctx)
    }

///////////////////////////////////////////////////////////////////////////

    pub fn create_submission(
        ctx: Context<CreateSubmission>,
        _bump_treasury: u8,
        _bump_user_profile: u8,
        _bump_challenge: u8,
    ) -> Result<()> {
        msg!("creating submission");
        instructions::create_submission::create_submission(ctx)
    }

    pub fn edit_submission(
        ctx: Context<EditSubmission>,
        _bump_user_profile: u8,
        _bump_challenge: u8,
        _bump_submission: u8,
    ) -> Result<()> {
        msg!("editing submission");
        instructions::edit_submission::edit_submission(ctx)
    }

    pub fn edit_submission_moderator(
        ctx: Context<EditSubmissionModerator>,
        _bump_moderator_profile:u8,
        _bump_user_profile: u8,
        _bump_challenge: u8,
        _bump_submission: u8,
    ) -> Result<()> {
        msg!("moderator editing submission");
        instructions::edit_submission_moderator::edit_submission_moderator(ctx)
    }

    pub fn delete_submission(
        ctx: Context<DeleteSubmission>,
        _bump_user_profile: u8,
        _bump_challenge: u8,
        _bump_submission: u8,
    ) -> Result<()> {
        msg!("deleting submission");
        instructions::delete_submission::delete_submission(ctx)
    }

    pub fn delete_submission_moderator(
        ctx: Context<DeleteSubmissionModerator>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_challenge: u8,
        _bump_submission: u8,
    ) -> Result<()> {
        msg!("moderator deleting submission");
        instructions::delete_submission_moderator::delete_submission_moderator(ctx)
    }

    pub fn evaluate_submission(
        ctx: Context<EvaluateSubmission>,
        _bump_moderator_profile: u8,
        _bump_user_profile: u8,
        _bump_challenge: u8,
        _bump_submission: u8,
        submission_state: SubmissionState,
    ) -> Result<()> {
        msg!("moderator evaluating submission");
        instructions::evaluate_submission::evaluate_submission(
            ctx,
            submission_state
        )
    }

///////////////////////////////////////////////////////////////////////////

    pub fn close_account(
        ctx: Context<CloseAccount>,
    ) -> Result<()> {
        msg!("closing account");
        instructions::close_account::handler(ctx)
    }

}
