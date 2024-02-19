use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

declare_id!("FhWWsKM5erDU1xbhkpZayeieAXhGXauKZWKmRjEL9BZW");

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
