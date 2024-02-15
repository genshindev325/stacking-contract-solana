use crate::state::stake::*;
use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{ self, Mint, Token, TokenAccount, Transfer as SplTransfer }
};

pub fn cashout(ctx: Context<CashOut>, stake_bump: u8, amount: u64) -> Result<()> {
  
  let destination = &ctx.accounts.to_ata;
  let source = &ctx.accounts.stake_ata;
  let token_program = &ctx.accounts.token_program;
  let authority = &ctx.accounts.pork_stake;

  // Transfer tokens from taker to initializer
  let cpi_accounts = SplTransfer {
      from: source.to_account_info().clone(),
      to: destination.to_account_info().clone(),
      authority: authority.to_account_info().clone(),
  };
  let cpi_program = token_program.to_account_info();
  
  token::transfer(
      CpiContext::new_with_signer(
          cpi_program, 
          cpi_accounts, 
          &[&["pork".as_bytes(), &[stake_bump]]]),
      amount)?;
  Ok(())
}

#[derive(Accounts)]
#[instruction(stake_bump: u8)]
pub struct CashOut<'info> {
  
  /// JOHN PORK Token Mint Address
  pub pork_mint: Account<'info, Mint>,

  #[account(mut)]
  pub to: Signer<'info>,

  // ATA of JOHN PORK Token Mint
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
  
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>
}