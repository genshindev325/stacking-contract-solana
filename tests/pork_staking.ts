import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PorkStaking } from "../target/types/pork_staking";
import { assert } from "chai";

import secret from '../wallet.json';

import {
  createMint,
  createAssociatedTokenAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";

import { PublicKey, Keypair, Connection, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

describe("pork_staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PorkStaking as Program<PorkStaking>;

  const fromKp = Keypair.fromSecretKey(new Uint8Array(secret));


  let mint: any;
  let fromAta: any;
  let porkStake: any;
  let stakeAta: any;

  before(async () => {
    // Create new mint account
    mint = await createMint(
      program.provider.connection,
      fromKp, // payer
      fromKp.publicKey, // mint authority
      null, // freeze authority
      9 // decimals
    );

    fromAta = await createAssociatedTokenAccount(
      program.provider.connection,
      fromKp,
      mint,
      fromKp.publicKey
    );

    const mintAmount = 1000;

    await mintTo(
      program.provider.connection,
      fromKp,
      mint,
      fromAta,
      fromKp.publicKey,
      mintAmount
    );

    [porkStake] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    stakeAta = getAssociatedTokenAddressSync(
      mint,
      porkStake,
      true
    );

  });

  it("Deposited!", async () => {
    const amount = new anchor.BN(500);

    const txHash = await program.methods.deposit(amount)
      .accounts({
        from: fromKp.publicKey,
        porkMint: mint,
        fromAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })

    
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
    assert.strictEqual(
      parseInt(toTokenAccount.value.amount),
      amount.toNumber(),
      "The 'stake' token account should have the transferred tokens"
    );
  });

  it("Cashed out!", async () => {
    const amount = new anchor.BN(200);

    const txHash = await program.methods.cashout(amount)
      .accounts({
        to: fromKp.publicKey,
        porkMint: mint,
        toAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })

    
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
    console.log(toTokenAccount)
    // assert.strictEqual(
    //   parseInt(toTokenAccount.value.amount),
    //   amount.toNumber(),
    //   "The 'stake' token account should have the transferred tokens"
    // );
  });
});
