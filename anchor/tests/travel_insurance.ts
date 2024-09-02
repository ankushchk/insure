import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TravelInsurance } from "../target/types/travel_insurance";

describe("travel_insurance", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.TravelInsurance as Program<TravelInsurance>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
