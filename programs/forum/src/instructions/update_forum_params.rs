use anchor_lang::prelude::*;

use crate::state::{Forum, ForumConstants, ForumFees, ReputationMatrix};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
pub struct UpdateForumParams<'info> {

    // Forum and Forum Manager
    #[account(mut, has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn update_forum_params(ctx: Context<UpdateForumParams>, new_forum_fees: ForumFees, new_forum_constants: ForumConstants, new_reputation_matrix: ReputationMatrix) -> Result<()> {

    // Assert new forum question and big notes solicitation fees in basis points are between 0 - 10,000
    if (new_forum_fees.forum_question_fee > 10000) || (new_forum_fees.forum_big_notes_solicitation_fee > 10000) {
        return Err(error!(ErrorCode::InvalidFeeInputs));
    }

    let forum = &mut ctx.accounts.forum;
    forum.forum_fees = new_forum_fees;
    forum.forum_constants = new_forum_constants;
    forum.reputation_matrix = new_reputation_matrix;

    msg!("Forum fees now {:?}", forum.forum_fees);
    msg!("Forum constants now {:?}", forum.forum_constants);
    msg!("Forum reputation matrix now {:?}", forum.reputation_matrix);
    Ok(())
}
