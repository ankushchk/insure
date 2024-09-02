use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke,
    system_instruction,
};

declare_id!("AxwofCewZLxn7TJPX1KQv8FA6XEqanC9WwC2q35TnYLx");

#[program]
pub mod travel_insurance {
    use super::*;

    pub fn purchase_policy(ctx: Context<PurchasePolicy>, amount: u64, event_id: [u8; 64]) -> Result<()> {
        let policy = &mut ctx.accounts.policy;
        policy.amount = amount;
        policy.event_id = event_id;
        policy.owner = ctx.accounts.user.key();
        policy.is_claimed = false; // Initialize as not claimed
        policy.claimable_after = Clock::get()?.unix_timestamp + 60; // Claimable after 60 seconds
        Ok(())
    }

    pub fn claim_policy(ctx: Context<ClaimPolicy>) -> Result<()> {
        let policy = &mut ctx.accounts.policy;
        let clock = Clock::get()?;

        if clock.unix_timestamp > policy.claimable_after {
            let user = &mut ctx.accounts.user;
            let payout_amount = policy.amount;

            let policy_balance = policy.to_account_info().lamports();
            if payout_amount > policy_balance {
                return Err(ErrorCode::InsufficientFunds.into());
            }

            invoke(
                &system_instruction::transfer(
                    &policy.to_account_info().key(),
                    &user.to_account_info().key(),
                    payout_amount,
                ),
                &[
                    ctx.accounts.system_program.to_account_info(),
                    policy.to_account_info(),
                    user.to_account_info(),
                ],
            )?;

            policy.is_claimed = true;
        } else {
            return Err(ErrorCode::NotYetClaimable.into());
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct PurchasePolicy<'info> {
    #[account(init, payer = user, space = 8 + 8 + 64 + 32 + 1 + 8)]
    pub policy: Account<'info, Policy>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPolicy<'info> {
    #[account(mut)]
    pub policy: Account<'info, Policy>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Policy {
    pub amount: u64,
    pub event_id: [u8; 64], // Fixed-size array for event_id
    pub owner: Pubkey,
    pub is_claimed: bool,
    pub claimable_after: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The policy is not yet claimable.")]
    NotYetClaimable,
    #[msg("Insufficient funds in policy account.")]
    InsufficientFunds,
}