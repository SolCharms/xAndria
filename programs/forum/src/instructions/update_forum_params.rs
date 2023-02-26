use anchor_lang::prelude::*;

use crate::state::{Forum};

#[derive(Accounts)]
pub struct UpdateForumParams<'info> {

    // Forum and Forum Manager
    #[account(mut, has_one = forum_manager)]
    pub forum: Box<Account<'info, Forum>>,
    pub forum_manager: Signer<'info>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateForumParams>, new_forum_profile_fee: u64, new_forum_question_fee: u64, new_forum_question_bounty_minimum: u64) -> Result<()> {

    let forum = &mut ctx.accounts.forum;
    forum.forum_profile_fee = new_forum_profile_fee;
    forum.forum_question_fee = new_forum_question_fee;
    forum.forum_question_bounty_minimum = new_forum_question_bounty_minimum;

    msg!("Forum profile fee now {}", forum.forum_profile_fee);
    msg!("Forum question fee now {}", forum.forum_question_fee);
    msg!("Forum bounty minimum now {}", forum.forum_question_bounty_minimum);
    Ok(())
}
