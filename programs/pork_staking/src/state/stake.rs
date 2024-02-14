use anchor_lang::prelude::*;

#[account]
pub struct PorkStake {
    authority: Pubkey,
    bump: u8,
    escrowed_x_tokens: Pubkey,
    y_mint: Pubkey,
    y_amount: u64,
}

impl PorkStake {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 32 + 8;
}