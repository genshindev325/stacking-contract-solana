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
import sinon from 'sinon';

import FakeTimers from "@sinonjs/fake-timers";

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

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

  let initialAmount = BigInt("100000000000000");

  let minimumDeposit = new anchor.BN("1000000000000");

  let firstDeposit = new anchor.BN("10000000000000");

  let secondDeposit = new anchor.BN("10000000000000");

  // let clock: any;

  // const clock = FakeTimers.install(
  //   {
  //     shouldClearNativeTimers: true
  //   }
  // );

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

  afterEach(function () {
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

  // it("Minimum Deposit Error!", async () => {
  //   const txHash = await program.methods.deposit(minimumDeposit)
  //     .accounts({
  //       porkMint: porkMint,
  //       from: fromKp.publicKey,
  //       fromAta: fromAta,
  //       porkStake: porkStake,
  //       stakeAta: stakeAta,
  //       porkUser: porkUser,
  //       treasuryAta: fromAta, 
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .signers([fromKp])
  //     .rpc({ skipPreflight: true })


  //   console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //   await program.provider.connection.confirmTransaction(txHash, "finalized");
  // });

  it("First Deposited!", async () => {
    const txHash = await program.methods.deposit(firstDeposit)
      .accounts({
        porkMint: porkMint,
        from: fromKp.publicKey,
        fromAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        porkUser: porkUser,
        referral: fromKp.publicKey,
        referralUser: null,
        treasuryAta: fromAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })


    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

    console.log(stakeTokenAccount.value.amount);

    const fromTokenAccount = await program.provider.connection.getTokenAccountBalance(fromAta);

    console.log(fromTokenAccount.value.amount);

    let _porkUser = await program.account.porkUser.fetch(porkUser);

    console.log(_porkUser.biggerHolderTimestamp.toString());
    console.log(_porkUser.timesOfBiggerHolder.toString());
    console.log(_porkUser.depostedAmount.toString());
    console.log(_porkUser.claimableAmount.toString());
    console.log(_porkUser.lastDepositTimestamp.toString());
  });

  // it("Second Deposited!", async () => {
  //   await delay(10000);

  //   const txHash = await program.methods.deposit(secondDeposit)
  //     .accounts({
  //       porkMint: porkMint,
  //       from: fromKp.publicKey,
  //       fromAta: fromAta,
  //       porkStake: porkStake,
  //       stakeAta: stakeAta,
  //       porkUser: porkUser,
  //       referral: fromKp.publicKey,
  //       referralUser: porkUser,
  //       treasuryAta: fromAta,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .signers([fromKp])
  //     .rpc({ skipPreflight: true })


  //   console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //   await program.provider.connection.confirmTransaction(txHash, "finalized");
  //   const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

  //   console.log(stakeTokenAccount.value.amount);

  //   const fromTokenAccount = await program.provider.connection.getTokenAccountBalance(fromAta);

  //   console.log(fromTokenAccount.value.amount);

  //   // assert.strictEqual(
  //   //   parseInt(toTokenAccount.value.amount),
  //   //   (firstDeposit.toNumber() + secondDeposit.toNumber()),
  //   //   "Second Deposit"
  //   // );

  //   let _porkUser = await program.account.porkUser.fetch(porkUser);

  //   console.log(_porkUser.biggerHolderTimestamp.toString());
  //   console.log(_porkUser.timesOfBiggerHolder.toString());
  //   console.log(_porkUser.depostedAmount.toString());
  //   console.log(_porkUser.claimableAmount.toString());
  //   console.log(_porkUser.lastDepositTimestamp.toString());
  // });


  it("Cashed out!", async () => {
    await delay(10_000);

    const txHash = await program.methods.cashout(bump)
      .accounts({
        to: fromKp.publicKey,
        porkMint: porkMint,
        toAta: fromAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        porkUser: porkUser,
        treasuryAta: fromAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([fromKp])
      .rpc({ skipPreflight: true })


    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

    console.log(stakeTokenAccount.value.amount);

    const fromTokenAccount = await program.provider.connection.getTokenAccountBalance(fromAta);

    console.log(fromTokenAccount.value.amount);

    let _porkUser = await program.account.porkUser.fetch(porkUser);

    console.log(_porkUser.biggerHolderTimestamp.toString());
    console.log(_porkUser.timesOfBiggerHolder.toString());
    console.log(_porkUser.depostedAmount.toString());
    console.log(_porkUser.claimableAmount.toString());
    console.log(_porkUser.lastDepositTimestamp.toString());

    // assert.strictEqual(
    //   parseInt(toTokenAccount.value.amount),
    //   300,
    //   "Cash Out"
    // );
  });

});
