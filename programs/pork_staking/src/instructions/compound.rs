use crate::state::stake::*;
use crate::state::user::*;
use crate::utils::{
  calculate_rewards, 
  calculate_bigger_holder_rewards,
};
use anchor_lang::prelude::*;


pub fn compound(ctx: Context<Compound>, _stake_bump: u8) -> Result<()> {
  
  let stake = &mut ctx.accounts.pork_stake;
  let user = &mut ctx.accounts.pork_user;

  let mut amount: u64 = user.claimable_amount;

  let current_timestamp = Clock::get()?.unix_timestamp;

  amount += calculate_rewards(user.deposted_amount, user.last_deposit_timestamp, current_timestamp);

  if user.times_of_bigger_holder > 0 {
    amount += calculate_bigger_holder_rewards(stake.total_amount, user.times_of_bigger_holder, user.bigger_holder_timestamp, current_timestamp);
    user.bigger_holder_timestamp = current_timestamp;
  }

  user.claimable_amount = 0;
  
  user.last_deposit_timestamp = current_timestamp;

  user.deposted_amount += amount;

  Ok(())
}

#[derive(Accounts)]
#[instruction(_stake_bump: u8)]
pub struct Compound<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
      mut,  
      seeds = ["pork".as_bytes()],
      bump = _stake_bump,
  )]
  pub pork_stake: Account<'info, PorkStake>,

  #[account(
    mut,
    seeds = ["porkuser".as_bytes(), signer.key().as_ref()],
    bump,
  )]
  pub pork_user: Account<'info, PorkUser>,

  pub system_program: Program<'info, System>
}
