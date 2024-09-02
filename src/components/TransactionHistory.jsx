import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "../App.css";

function TransactionHistory() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (publicKey) {
        try {
          const transactionSignatures =
            await connection.getSignaturesForAddress(publicKey);
          const txs = await Promise.all(
            transactionSignatures.map(async (tx) => {
              const transaction = await connection.getTransaction(tx.signature);
              return {
                signature: tx.signature,
                date: new Date(transaction.blockTime * 1000).toLocaleString(),
                amount:
                  transaction.meta.preBalances[0] -
                  transaction.meta.postBalances[0],
              };
            })
          );
          setTransactions(txs);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    fetchTransactions();
  }, [publicKey, connection]);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>
            <p>Signature: {tx.signature}</p>
            <p>Date: {tx.date}</p>
            <p>Amount: {tx.amount / 1_000_000_000} SOL</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionHistory;
