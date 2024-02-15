import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PorkStaking } from "../target/types/pork_staking";
import { assert } from "chai";

import secret from '../wallet.json';

import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";

import { PublicKey, Keypair, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

describe("pork_staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PorkStaking as Program<PorkStaking>;

  const fromKp = Keypair.fromSecretKey(new Uint8Array(secret));


  let porkMint: any;
  let fromAta: any;
  let porkStake: any;
  let stakeAta: any;
  let bump: any;
  let porkUser: any;
  let userBump: any;

  let initialAmount = 1000;

  let firstDeposit = new anchor.BN(100);

  let secondDeposit = new anchor.BN(200);


  before(async () => {
    // Create new mint account
    porkMint = await createMint(
      program.provider.connection,
      fromKp, // payer
      fromKp.publicKey, // mint authority
      null, // freeze authority
      9 // decimals
    );

    fromAta = await createAssociatedTokenAccount(
      program.provider.connection,
      fromKp,
      porkMint,
      fromKp.publicKey
    );

    await mintTo(
      program.provider.connection,
      fromKp,
      porkMint,
      fromAta,
      fromKp.publicKey,
      initialAmount
    );

    [porkStake, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    stakeAta = getAssociatedTokenAddressSync(
      porkMint,
      porkStake,
      true
    );

    [porkUser, userBump] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("porkuser")), fromKp.publicKey.toBuffer()],
      program.programId
    );

  });

  it("Initialized!", async () => {
    const txHash = await program.methods.initialize()
      .accounts({
        porkMint: porkMint,
        from: fromKp.publicKey,
        porkStake: porkStake,
        stakeAta: stakeAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })

    
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
    assert.strictEqual(
      parseInt(toTokenAccount.value.amount),
      0,
      "The 'stake' token account should have the transferred tokens"
    );
  });

  it("First Deposited!", async () => {
    const txHash = await program.methods.deposit(firstDeposit)
      .accounts({
        porkMint: porkMint,
        from: fromKp.publicKey,
        fromAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        porkUser: porkUser,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })

    
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
    assert.strictEqual(
      parseInt(toTokenAccount.value.amount),
      firstDeposit.toNumber(),
      "First Deposit"
    );

    let _porkUser = await program.account.porkUser.fetch(porkUser);

    assert.strictEqual(
      _porkUser.depostedAmount.toNumber(),
      firstDeposit.toNumber(),
      "First Deposit"
    );
  });

  it("Second Deposited!", async () => {
    const txHash = await program.methods.deposit(secondDeposit)
      .accounts({
        porkMint: porkMint,
        from: fromKp.publicKey,
        fromAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        porkUser: porkUser,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })

    
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
    assert.strictEqual(
      parseInt(toTokenAccount.value.amount),
      (firstDeposit.toNumber() + secondDeposit.toNumber()),
      "Second Deposit"
    );

    let _porkUser = await program.account.porkUser.fetch(porkUser);

    assert.strictEqual(
      _porkUser.depostedAmount.toNumber(),
      (firstDeposit.toNumber() + secondDeposit.toNumber()),
      "Second Deposit"
    );
  });


  // it("Cashed out!", async () => {
  //   const amount = new anchor.BN(200);

  //   const txHash = await program.methods.cashout(bump, amount)
  //     .accounts({
  //       to: fromKp.publicKey,
  //       porkMint: porkMint,
  //       toAta: fromAta,
  //       porkStake: porkStake,
  //       stakeAta: stakeAta,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .signers([fromKp])
  //     .rpc({ skipPreflight: true })

    
  //   console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //   await program.provider.connection.confirmTransaction(txHash, "finalized");
  //   const toTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);
    
  //   assert.strictEqual(
  //     parseInt(toTokenAccount.value.amount),
  //     300,
  //     "The 'stake' token account should have the transferred tokens"
  //   );
  // });

});
