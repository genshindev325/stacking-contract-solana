import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PorkStaking } from "../target/types/pork_staking";
import { assert } from "chai";

import secret from '../wallet.json';
import secondSecret from '../second_wallet.json';

import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  transfer,
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

  const treasuryKp = Keypair.fromSecretKey(new Uint8Array(secret));

  // const secondKp = Keypair.fromSecretKey(new Uint8Array(secondSecret));

  const firstKp = new Keypair();

  const secondKp = new Keypair();

  let porkMint: any;
  let porkStake: any;
  let stakeAta: any;

  let treasuryAta: any;
  let treasuryUser: any;

  let firstAta: any;
  let firstUser: any;

  let secondAta: any;
  let secondUser: any;

  let bump: any;
  let userBump: any;

  let initialAmount = BigInt("1000000000000000000");

  let firstAmount = BigInt("400000000000000000");

  let secondAmount = BigInt("500000000000000000");


  let minimumDeposit = new anchor.BN("1000000000000");

  let firstDeposit = new anchor.BN("20000000000000000");

  let secondDeposit = new anchor.BN("20000000000000000");

  // let clock: any;

  // const clock = FakeTimers.install(
  //   {
  //     shouldClearNativeTimers: true
  //   }
  // );

  before(async () => {
  });

  afterEach(function () {
  });

  it("Set Up!", async () => {
    const signature1 = await program.provider.connection.requestAirdrop(
      firstKp.publicKey,
      3_000_000_000
    );

    const { blockhash: blockhash1, lastValidBlockHeight: lastValidBlockHeight1 } = await program.provider.connection.getLatestBlockhash();

    await program.provider.connection.confirmTransaction({
      blockhash: blockhash1,
      lastValidBlockHeight: lastValidBlockHeight1,
      signature: signature1
    }, 'finalized');

    const signature2 = await program.provider.connection.requestAirdrop(
      secondKp.publicKey,
      3_000_000_000
    );

    const { blockhash: blockhash2, lastValidBlockHeight: lastValidBlockHeight2 } = await program.provider.connection.getLatestBlockhash();

    await program.provider.connection.confirmTransaction({
      blockhash: blockhash2,
      lastValidBlockHeight: lastValidBlockHeight2,
      signature: signature2
    }, 'finalized');



    porkMint = await createMint(
      program.provider.connection,
      treasuryKp,
      treasuryKp.publicKey,
      null,
      9
    );

    treasuryAta = await createAssociatedTokenAccount(
      program.provider.connection,
      treasuryKp,
      porkMint,
      treasuryKp.publicKey
    );

    await mintTo(
      program.provider.connection,
      treasuryKp,
      porkMint,
      treasuryAta,
      treasuryKp.publicKey,
      initialAmount
    );

    firstAta = await createAssociatedTokenAccount(
      program.provider.connection,
      firstKp,
      porkMint,
      firstKp.publicKey
    );


    await transfer(
      program.provider.connection,
      treasuryKp,
      treasuryAta,
      firstAta,
      treasuryKp.publicKey,
      firstAmount
    );

    secondAta = await createAssociatedTokenAccount(
      program.provider.connection,
      secondKp,
      porkMint,
      secondKp.publicKey
    );


    await transfer(
      program.provider.connection,
      treasuryKp,
      treasuryAta,
      secondAta,
      treasuryKp.publicKey,
      secondAmount
    );

    const treasuryTokenAccount = await program.provider.connection.getTokenAccountBalance(treasuryAta);

    console.log(treasuryTokenAccount.value.amount);

    const firstTokenAccount = await program.provider.connection.getTokenAccountBalance(firstAta);

    console.log(firstTokenAccount.value.amount);

    const secondTokenAccount = await program.provider.connection.getTokenAccountBalance(secondAta);

    console.log(secondTokenAccount.value.amount);

    [porkStake, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    stakeAta = getAssociatedTokenAddressSync(
      porkMint,
      porkStake,
      true
    );

    [treasuryUser] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("porkuser")), treasuryKp.publicKey.toBuffer()],
      program.programId
    );

    [firstUser] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("porkuser")), firstKp.publicKey.toBuffer()],
      program.programId
    );

    [secondUser] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("porkuser")), secondKp.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initialized!", async () => {
    const txHash = await program.methods.initialize()
      .accounts({
        porkMint: porkMint,
        from: treasuryKp.publicKey,
        porkStake: porkStake,
        stakeAta: stakeAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([treasuryKp])
      .rpc({ skipPreflight: true })


    console.log(`https://solscan.io/token/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

    assert.strictEqual(
      parseInt(stakeTokenAccount.value.amount),
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
  //       referral: secondKp.publicKey,
  //       referralUser: null,
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
        from: treasuryKp.publicKey,
        fromAta: treasuryAta,
        porkStake: porkStake,
        stakeAta: stakeAta,
        porkUser: treasuryUser,
        referral: treasuryKp.publicKey,
        referralUser: null,
        treasuryAta: treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([treasuryKp])
      .rpc({ skipPreflight: true })


    console.log(`https://solscan.io/tx/${txHash}?cluster=devnet`);

    await program.provider.connection.confirmTransaction(txHash, "finalized");

    // const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

    // console.log(stakeTokenAccount.value.amount);

    // const treasuryTokenAccount = await program.provider.connection.getTokenAccountBalance(treasuryAta);

    // console.log(treasuryTokenAccount.value.amount);

    // const firstTokenAccount = await program.provider.connection.getTokenAccountBalance(firstAta);

    // console.log(firstTokenAccount.value.amount);

    // const secondTokenAccount = await program.provider.connection.getTokenAccountBalance(secondAta);

    // console.log(secondTokenAccount.value.amount);

    // let _porkStake = await program.account.porkStake.fetch(porkStake);

    // console.log(_porkStake.totalAmount.toString());

    // let _porkUser = await program.account.porkUser.fetch(firstUser);

    // console.log(_porkUser.biggerHolderTimestamp.toString());
    // console.log(_porkUser.timesOfBiggerHolder.toString());
    // console.log(_porkUser.depostedAmount.toString());
    // console.log(_porkUser.claimableAmount.toString());
    // console.log(_porkUser.lastDepositTimestamp.toString());

    // let _secondUser = await program.account.porkUser.fetch(secondUser);

    // console.log(_secondUser.biggerHolderTimestamp.toString());
    // console.log(_secondUser.timesOfBiggerHolder.toString());
    // console.log(_secondUser.depostedAmount.toString());
    // console.log(_secondUser.claimableAmount.toString());
    // console.log(_secondUser.lastDepositTimestamp.toString());

  });

  // it("Second Deposited!", async () => {
  //   // await delay(10000);

  //   const txHash = await program.methods.deposit(secondDeposit)
  //     .accounts({
  //       porkMint: porkMint,
  //       from: fromKp.publicKey,
  //       fromAta: fromAta,
  //       porkStake: porkStake,
  //       stakeAta: stakeAta,
  //       porkUser: porkUser,
  //       referral: fromKp.publicKey,
  //       referralUser: null,
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

  //   const secondTokenAccount = await program.provider.connection.getTokenAccountBalance(secondAta);

  //   console.log(secondTokenAccount.value.amount);

  //   let _porkStake = await program.account.porkStake.fetch(porkStake);

  //   console.log(_porkStake.totalAmount.toString());

  //   let _porkUser = await program.account.porkUser.fetch(porkUser);

  //   console.log(_porkUser.biggerHolderTimestamp.toString());
  //   console.log(_porkUser.timesOfBiggerHolder.toString());
  //   console.log(_porkUser.depostedAmount.toString());
  //   console.log(_porkUser.claimableAmount.toString());
  //   console.log(_porkUser.lastDepositTimestamp.toString());

  //   let _secondUser = await program.account.porkUser.fetch(secondUser);

  //   console.log(_secondUser.biggerHolderTimestamp.toString());
  //   console.log(_secondUser.timesOfBiggerHolder.toString());
  //   console.log(_secondUser.depostedAmount.toString());
  //   console.log(_secondUser.claimableAmount.toString());
  //   console.log(_secondUser.lastDepositTimestamp.toString());

  // });

  // it("Compound!", async () => {
  //   await delay(10000);

  //   const txHash = await program.methods.compound(bump)
  //     .accounts({
  //       signer: fromKp.publicKey,
  //       porkStake: porkStake,
  //       porkUser: porkUser,
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

  //   let _porkUser = await program.account.porkUser.fetch(porkUser);

  //   console.log(_porkUser.biggerHolderTimestamp.toString());
  //   console.log(_porkUser.timesOfBiggerHolder.toString());
  //   console.log(_porkUser.depostedAmount.toString());
  //   console.log(_porkUser.claimableAmount.toString());
  //   console.log(_porkUser.lastDepositTimestamp.toString());

  //   let _porkStake = await program.account.porkStake.fetch(porkStake);

  //   console.log(_porkStake.totalAmount.toString());
  // });


  // it("Cashed out!", async () => {
  //   await delay(10_000);

  //   const txHash = await program.methods.cashout(bump)
  //     .accounts({
  //       to: fromKp.publicKey,
  //       porkMint: porkMint,
  //       toAta: fromAta,
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
  //   const stakeTokenAccount = await program.provider.connection.getTokenAccountBalance(stakeAta);

  //   console.log(stakeTokenAccount.value.amount);

  //   const fromTokenAccount = await program.provider.connection.getTokenAccountBalance(fromAta);

  //   console.log(fromTokenAccount.value.amount);

  //   let _porkUser = await program.account.porkUser.fetch(porkUser);

  //   console.log(_porkUser.biggerHolderTimestamp.toString());
  //   console.log(_porkUser.timesOfBiggerHolder.toString());
  //   console.log(_porkUser.depostedAmount.toString());
  //   console.log(_porkUser.claimableAmount.toString());
  //   console.log(_porkUser.lastDepositTimestamp.toString());

  //   let _porkStake = await program.account.porkStake.fetch(porkStake);

  //   console.log(_porkStake.totalAmount.toString());

  //   // assert.strictEqual(
  //   //   parseInt(toTokenAccount.value.amount),
  //   //   300,
  //   //   "Cash Out"
  //   // );
  // });

});
