use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

declare_id!("7a2ExM7n8CSK2ai1JzsP5pzGrvauy2BZ9kUmZA3zQTs6");

#[program]
pub mod pork_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, amount)
    }

    pub fn cashout(ctx: Context<CashOut>, stake_bump: u8) -> Result<()> {
        instructions::cashout::cashout(ctx, stake_bump)
    }

    pub fn compound(ctx: Context<Compound>) -> Result<()> {
        instructions::compound::compound(ctx)
    }
}
