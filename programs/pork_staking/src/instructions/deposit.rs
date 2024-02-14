use crate::state::stake::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
  Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
  
  #[account(mut)]
  from: Signer<'info>,

  /// JOHN PORK Token Mint Address
  pork_mint: Account<'info, Mint>,

  /// ATA of JOHN PORK Token Mint
  #[account(
      mut, 
      constraint = from_pork_token.mint == pork_mint.key() && from_pork_token.owner == from.key()
  )]
  from_pork_token: Account<'info, TokenAccount>,

  #[account(
      init_if_needed, 
      payer = from,  
      space=PorkStake::LEN,
      seeds = ["pork".as_bytes()],
      bump,
  )]
  pub pork_stake: Account<'info, PorkStake>,

  #[account(
    init_if_needed,
    payer = from,
    token::mint = pork_mint,
    token::authority = pork_stake,
  )]
  stake_pork_tokens: Account<'info, TokenAccount>,

  token_program: Program<'info, Token>,
  rent: Sysvar<'info, Rent>,
  system_program: Program<'info, System>,
}


