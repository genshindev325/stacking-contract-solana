use anchor_lang::prelude::*;

const PERCENT: u64 = 2;

pub fn calculate_rewards(
    amount: u64,
    last_deposit_timestamp: i64,
    current_timestamp: i64,
) -> u64 {
    let total_days: u64 =
        ((current_timestamp - last_deposit_timestamp) / (60 * 60 * 24 * 1000)).try_into().unwrap();
    let reward = amount * PERCENT * total_days / 100;
    msg!(&(reward).to_string());

    reward
}