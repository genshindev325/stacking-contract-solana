use crate::state::stake::*;
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ Mint, Token, TokenAccount }
};
use crate::errors::PorkStakeError;
use crate::utils::PORK_MINT_ADDRESS;

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {

  // require_keys_eq!(ctx.accounts.pork_mint.key(), PORK_MINT_ADDRESS, PorkStakeError::PorkMintError);
  
  let stake = &mut ctx.accounts.pork_stake;
  
  stake.total_amount = 0;
  
  Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {

  pub pork_mint: Account<'info, Mint>,

  #[account(mut)]
  pub from: Signer<'info>,

  #[account(
    init, 
    payer = from,  
    space=PorkStake::LEN,
    seeds = ["pork".as_bytes()],
    bump,
  )]
  pub pork_stake: Account<'info, PorkStake>,

  #[account(
    init,
    payer = from,
    associated_token::mint = pork_mint,
    associated_token::authority = pork_stake,
  )]
  pub stake_ata: Account<'info, TokenAccount>,
  
  token_program: Program<'info, Token>,
  associated_token_program: Program<'info, AssociatedToken>,
  system_program: Program<'info, System>
}


