use anchor_lang::prelude::*;

#[account]
pub struct PorkStake {
    pub authority: Pubkey,
    pub bump: u8,
    pub escrowed_x_tokens: Pubkey,
    pub y_mint: Pubkey,
    pub y_amount: u64,
}

impl PorkStake {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 32 + 8;
}