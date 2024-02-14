import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PorkStaking } from "../target/types/pork_staking";

import secret from '../wallet.json';

import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { PublicKey, Keypair, Connection } from "@solana/web3.js";

describe("pork_staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PorkStaking as Program<PorkStaking>;

  const SOLANA_CONNECTION = new Connection("https://rpc-devnet.hellomoon.io/0118d2c0-76a5-41d1-9c2b-68ce1aa6e673", "confirmed");

  const mint = new PublicKey("HkAr1QbfJoxnF5L1EcUQH2bo3kgF9kuMoJ5oUEpTEnqi");

  const fromKp = Keypair.fromSecretKey(new Uint8Array(secret));

  it("Is initialized!", async () => {
    // Create associated token accounts for the new accounts
    const fromAta = await createAssociatedTokenAccount(
      SOLANA_CONNECTION,
      fromKp,
      mint,
      fromKp.publicKey
    );

    // const [launchpadDetails, bump] = await PublicKey.findProgramAddress(
    //   [Buffer.from(anchor.utils.bytes.utf8.encode("launchpad")), mint.toBuffer(), creator.publicKey.toBuffer()],
    //   program.programId
    // );

    console.log(program.programId)

    // const toAta = await createAssociatedTokenAccount(
    //   SOLANA_CONNECTION,
    //   fromKp,
    //   mint,
    //   toKp.publicKey
    // );

  });
});
