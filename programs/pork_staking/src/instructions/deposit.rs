use crate::state::stake::*;
use crate::state::user::*;
// use crate::errors::PorkStakeError;
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ self, Mint, Token, TokenAccount, Transfer as SplTransfer }
};

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
  let destination = &ctx.accounts.stake_ata;
  let source = &ctx.accounts.from_ata;
  let token_program = &ctx.accounts.token_program;
  let authority = &ctx.accounts.from;
  let user = &mut ctx.accounts.pork_user;

  user.deposted_amount += amount;

  // Transfer tokens from taker to initializer
  let cpi_accounts = SplTransfer {
      from: source.to_account_info().clone(),
      to: destination.to_account_info().clone(),
      authority: authority.to_account_info().clone(),
  };
  let cpi_program = token_program.to_account_info();
  
  token::transfer(
      CpiContext::new(cpi_program, cpi_accounts),
      amount)?;
  
  Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
  
  /// JOHN PORK Token Mint Address
  pub pork_mint: Account<'info, Mint>,

  #[account(mut)]
  pub from: Signer<'info>,

  // ATA of JOHN PORK Token Mint
  #[account(
      mut, 
      associated_token::mint = pork_mint,
      associated_token::authority = from,
  )]
  pub from_ata: Account<'info, TokenAccount>,

  #[account(
    mut,
    seeds = ["pork".as_bytes()],
    bump,
  )]
  pub pork_stake: Account<'info, PorkStake>,

  #[account(
    mut,
    associated_token::mint = pork_mint,
    associated_token::authority = pork_stake,
  )]
  pub stake_ata: Account<'info, TokenAccount>,

  #[account(
    init_if_needed,
    payer = from,
    space=PorkUser::LEN,
    seeds = ["porkuser".as_bytes(), from.key().as_ref()],
    bump,
  )]
  pub pork_user: Account<'info, PorkUser>,
  
  token_program: Program<'info, Token>,
  associated_token_program: Program<'info, AssociatedToken>,
  system_program: Program<'info, System>
}


