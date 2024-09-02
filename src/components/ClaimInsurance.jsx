import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import "../App.css";

function ClaimInsurance() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [claimId, setClaimId] = useState("");

  const handleChange = (e) => {
    setClaimId(e.target.value);
  };

  const claimInsurance = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!claimId) {
      alert("Please enter a claim ID.");
      return;
    }

    try {
      const programId = new PublicKey(
        "AxwofCewZLxn7TJPX1KQv8FA6XEqanC9WwC2q35TnYLx"
      );

      // Convert claimId to Uint8Array directly
      const claimIdBytes = new TextEncoder().encode(claimId);
      const instructionData = new Uint8Array([1, ...claimIdBytes]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: programId, isSigner: false, isWritable: true },
        ],
        programId,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      alert("Insurance claim submitted successfully!");
    } catch (error) {
      console.error("Error claiming insurance:", error);
      alert(`Failed to claim insurance: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Claim Insurance</h2>
      <label htmlFor="claimId">Claim ID:</label>
      <input
        type="text"
        id="claimId"
        placeholder="Enter Claim ID"
        value={claimId}
        onChange={handleChange}
      />
      <button onClick={claimInsurance}>Claim Insurance</button>
    </div>
  );
}

export default ClaimInsurance;
