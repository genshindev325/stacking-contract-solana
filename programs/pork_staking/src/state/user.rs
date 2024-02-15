use anchor_lang::prelude::*;

#[account]
pub struct PorkUser {
  pub deposted_amount: u64,
  pub claimable_amount: u64,
  pub last_deposit_timestamp: i64,
}

impl PorkUser {
  pub const LEN: usize = 8 + 8 + 8 + 8;
}