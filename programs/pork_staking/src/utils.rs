use anchor_lang::prelude::*;

const PERCENT: u64 = 2;

pub fn calculate_rewards(amount: u64, last_deposit_timestamp: i64, current_timestamp: i64) -> u64 {
    let time_diff: u64 = (current_timestamp - last_deposit_timestamp)
        .try_into()
        .unwrap();
    let reward: u64 = ((amount * PERCENT / 100) * time_diff / (60 * 60 * 24))
        .try_into()
        .unwrap();
    msg!(&(reward).to_string());

    reward
}
