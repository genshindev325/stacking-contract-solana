use anchor_lang::prelude::*;
use solana_program::pubkey;

const PERCENT: u64 = 2;
const BIGGER_HOLDER_PERCENT: u64 = 5;
pub const TREASURY_ADDRESS: Pubkey = pubkey!("76hTqNGeRJ4m5j12WfwsQNJTcpyKNNUCMpKnYvmYY9Mv");
pub const PORK_MINT_ADDRESS: Pubkey = pubkey!("2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy");

pub const BIGGER_HOLDER: u64 = 10_000_000_000_000_000;
pub const MINIMUM_DEPOSIT: u64 = 10_000_000_000_000;

pub fn calculate_rewards(amount: u64, last_deposit_timestamp: i64, current_timestamp: i64) -> u64 {
    let time_diff: u64 = (current_timestamp - last_deposit_timestamp)
        .try_into()
        .unwrap();
    let reward: u64 = ((amount * PERCENT / (100 * 60 * 60 * 24)) * time_diff)
        .try_into()
        .unwrap();
    msg!(&(reward).to_string());

    reward
}

pub fn calculate_bigger_holder_rewards(
    tvl: u64,
    times_of_bigger_holder: u64,
    bigger_holder_timestamp: i64,
    current_timestamp: i64,
) -> u64 {
    let time_diff: u64 = (current_timestamp - bigger_holder_timestamp)
        .try_into()
        .unwrap();
    let reward: u64 = ((tvl * BIGGER_HOLDER_PERCENT * times_of_bigger_holder
        / (100_000 * 60 * 60 * 24))
        * time_diff)
        .try_into()
        .unwrap();
    msg!(&(reward).to_string());

    reward
}
