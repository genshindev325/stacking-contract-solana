use anchor_lang::prelude::*;

declare_id!("CUEpHJ5D7yEHtQDf5zwRdWTtkxKgB98gaMPoHkBzfZUP");

#[program]
pub mod pork_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
