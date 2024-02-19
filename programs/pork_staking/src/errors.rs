use anchor_lang::error_code;

#[error_code]
pub enum PorkStakeError {
  StakeBumpError,
  MinimumDepositError,
  ReferralError,
  ClaimOrCompoundEveryHourError,
  PorkMintError,
}