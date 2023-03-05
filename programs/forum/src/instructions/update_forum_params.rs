use anchor_lang::prelude::*;

use crate::state::{Forum, ForumFees, ReputationMatrix};

#[derive(Accounts)]
pub struct UpdateForumParams<'info> {

    // Forum and Forum Manager
    #[account(mut, has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateForumParams>, new_forum_fees: ForumFees, new_reputation_matrix: ReputationMatrix) -> Result<()> {

    let forum = &mut ctx.accounts.forum;
    forum.forum_fees = new_forum_fees;
    forum.reputation_matrix = new_reputation_matrix;

    msg!("Forum profile fees now {:?}", forum.forum_fees);
    msg!("Forum reputation matrix now {:?}", forum.reputation_matrix);
    Ok(())
}
