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
        policy.is_claimed = false; // initially false!

        // unique claimId based on the owner's public key and current timestamp
        let clock = Clock::get()?;
        policy.claim_id = {
            let mut id = [0u8; 96];
            id[..32].copy_from_slice(&policy.owner.to_bytes());
            id[32..40].copy_from_slice(&clock.unix_timestamp.to_le_bytes());
            id
        };

        policy.claimable_after = clock.unix_timestamp + 60; // claimable after 60 seconds

        Ok(())
    }

    // Claiming the policy
    pub fn claim_policy(ctx: Context<ClaimPolicy>, claim_id: [u8; 96]) -> Result<()> {
        let policy = &mut ctx.accounts.policy;
        let clock = Clock::get()?;
        // ensure the provided claim_id matches the policy's claim_id
        if claim_id != policy.claim_id {
            return Err(ErrorCode::InvalidClaimId.into());
        }

        if policy.is_claimed {
            return Err(ErrorCode::AlreadyClaimed.into());
        }

        // imp! ensure the policy is claimable -> (the event has occurred or the time has passed)
        if clock.unix_timestamp > policy.claimable_after {
            let user = &mut ctx.accounts.user;
            let payout_amount = policy.amount;

            // checking the policy account has enough funds to pay out the insurance
            let policy_balance = policy.to_account_info().lamports();
            if payout_amount > policy_balance {
                return Err(ErrorCode::InsufficientFunds.into());
            }

            // transfer the payout amount to the user
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

            // mark the policy as claimed
            policy.is_claimed = true;
        } else {
            return Err(ErrorCode::NotYetClaimable.into());
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct PurchasePolicy<'info> {
    #[account(init, payer = user, space = 8 + 8 + 64 + 96 + 1 + 8)] // update space to accommodate claim_id
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
    pub claim_id: [u8; 96], // Fixed-size array for claim_id
}

#[error_code]
pub enum ErrorCode {
    #[msg("The policy is not yet claimable.")]
    NotYetClaimable,
    #[msg("Insufficient funds in policy account.")]
    InsufficientFunds,
    #[msg("The claim ID is invalid.")]
    InvalidClaimId,
    #[msg("The policy has already been claimed.")]
    AlreadyClaimed,
}