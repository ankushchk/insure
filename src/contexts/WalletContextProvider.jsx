import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "../App.css";

const WalletContextProvider = ({ children }) => {
  const network = clusterApiUrl("devnet");

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  try {
    return (
      <ConnectionProvider endpoint={network}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  } catch (error) {
    console.error("Error initializing wallet adapter:", error);
    alert(
      "There was an issue initializing the wallet adapter. Please try again later."
    );
    return null;
  }
};

export default WalletContextProvider;
