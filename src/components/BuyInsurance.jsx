import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import "../App.css";

function BuyInsurance() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [insuranceDetails, setInsuranceDetails] = useState({ amount: 0 });

  const handleChange = (e) => {
    setInsuranceDetails({
      ...insuranceDetails,
      [e.target.name]: e.target.value,
    });
  };

  const buyInsurance = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    if (insuranceDetails.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const programId = new PublicKey(
        "AxwofCewZLxn7TJPX1KQv8FA6XEqanC9WwC2q35TnYLx"
      );
      const amountInLamports = insuranceDetails.amount * 1_000_000_000; // Convert SOL to lamports

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: programId, isSigner: false, isWritable: true },
        ],
        programId,
        data: Buffer.from(
          Uint8Array.of(0, ...new BN(amountInLamports).toArray("le", 8))
        ),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      alert("Insurance bought successfully!");
    } catch (error) {
      console.error("Error buying insurance:", error);

      if (error.message.includes("disconnected port")) {
        alert(
          "It seems the wallet connection was lost. Please try reconnecting your wallet."
        );
      } else if (error.message.includes("insufficient funds")) {
        alert("Insufficient funds to buy the insurance.");
      } else {
        alert(`Failed to buy insurance: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-insurance">
      <h2>Buy Travel Insurance</h2>
      <input
        type="number"
        name="amount"
        placeholder="Enter Amount (SOL)"
        value={insuranceDetails.amount}
        onChange={handleChange}
        disabled={loading}
      />
      <button onClick={buyInsurance} disabled={loading}>
        {loading ? "Processing..." : "Buy Insurance"}
      </button>
    </div>
  );
}

export default BuyInsurance;
