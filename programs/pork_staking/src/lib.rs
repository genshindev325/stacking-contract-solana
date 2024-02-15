use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("CUEpHJ5D7yEHtQDf5zwRdWTtkxKgB98gaMPoHkBzfZUP");

#[program]
pub mod pork_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, amount)
    }

    pub fn cashout(ctx: Context<CashOut>, stake_bump: u8, amount: u64) -> Result<()> {
        instructions::cashout::cashout(ctx, stake_bump, amount)
    }
}

