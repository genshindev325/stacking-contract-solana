use crate::state::stake::*;
use crate::state::user::*;
use crate::utils::{
  calculate_rewards, 
  calculate_bigger_holder_rewards,
  TREASURY_ADDRESS,
  PORK_MINT_ADDRESS,
};
use crate::errors::PorkStakeError;
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ self, Mint, Token, TokenAccount, Transfer as SplTransfer }
};


pub fn cashout(ctx: Context<CashOut>, stake_bump: u8) -> Result<()> {
  
  let destination = &ctx.accounts.to_ata;
  let source = &ctx.accounts.stake_ata;
  let treasury = &ctx.accounts.treasury_ata;
  let token_program = &ctx.accounts.token_program;
  let stake = &mut ctx.accounts.pork_stake;
  let user = &mut ctx.accounts.pork_user;

  let mut amount: u64 = user.claimable_amount;

  let current_timestamp = Clock::get()?.unix_timestamp;

  require_gte!(current_timestamp, user.last_deposit_timestamp + 10, PorkStakeError::ClaimOrCompoundEveryHourError);

  amount += calculate_rewards(user.deposted_amount, user.last_deposit_timestamp, current_timestamp);

  if user.times_of_bigger_holder > 0 {
    amount += calculate_bigger_holder_rewards(stake.total_amount, user.times_of_bigger_holder, user.bigger_holder_timestamp, current_timestamp);
    user.bigger_holder_timestamp = current_timestamp;
  }

  user.claimable_amount = 0;
  
  user.last_deposit_timestamp = current_timestamp;

  stake.total_amount -= amount;

  let deposit_amount: u64 = (amount / 100 * 95).try_into().unwrap();
  let treasury_amount: u64 = (amount / 100 * 5).try_into().unwrap();
  
  token::transfer(
    CpiContext::new_with_signer(
        token_program.to_account_info(),
        SplTransfer {
          from: source.to_account_info().clone(),
          to: destination.to_account_info().clone(),
          authority: stake.to_account_info().clone(),
        },
        &[&["pork".as_bytes(), &[stake_bump]]],
    ),
    deposit_amount
  )?;

  token::transfer(
    CpiContext::new_with_signer(
        token_program.to_account_info(),
        SplTransfer {
          from: source.to_account_info().clone(),
          to: treasury.to_account_info().clone(),
          authority: stake.to_account_info().clone(),
        },
        &[&["pork".as_bytes(), &[stake_bump]]],
    ),
    treasury_amount
  )?;
  Ok(())
}

#[derive(Accounts)]
#[instruction(stake_bump: u8)]
pub struct CashOut<'info> {
  
  // #[account(address = PORK_MINT_ADDRESS)]
  pub pork_mint: Account<'info, Mint>,

  #[account(mut)]
  pub to: Signer<'info>,

  #[account(
      init_if_needed, 
      payer = to, 
      associated_token::mint = pork_mint,
      associated_token::authority = to,
  )]
  pub to_ata: Account<'info, TokenAccount>,

  #[account(
      mut,  
      seeds = ["pork".as_bytes()],
      bump = stake_bump,
  )]
  pub pork_stake: Account<'info, PorkStake>,

  #[account(
    mut,
    associated_token::mint = pork_mint,
    associated_token::authority = pork_stake,
  )]
  pub stake_ata: Account<'info, TokenAccount>,

  #[account(
    mut,
    seeds = ["porkuser".as_bytes(), to.key().as_ref()],
    bump,
  )]
  pub pork_user: Account<'info, PorkUser>,

  #[account(
    mut, 
    associated_token::mint = pork_mint,
    associated_token::authority = TREASURY_ADDRESS,
  )]
  pub treasury_ata: Account<'info, TokenAccount>,
  
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>
}
