import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import WalletContextProvider from "./contexts/WalletContextProvider";
import BuyInsurance from "./components/BuyInsurance";
import ClaimInsurance from "./components/ClaimInsurance";
import TransactionHistory from "./components/TransactionHistory";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("buy");

  return (
    <WalletContextProvider>
      <div className="App">
        <header className="App-header">
          <h1>inSURE</h1>
          <WalletMultiButton />
        </header>
        <div className="App-content">
          <nav>
            <button onClick={() => setActiveSection("buy")}>
              Buy Insurance
            </button>
            <button onClick={() => setActiveSection("claim")}>
              Claim Insurance
            </button>
            <button onClick={() => setActiveSection("history")}>
              Transaction History
            </button>
          </nav>
          <div className="dashboard">
            {activeSection === "buy" && (
              <div className="section">
                <BuyInsurance />
              </div>
            )}
            {activeSection === "claim" && (
              <div className="section">
                <ClaimInsurance />
              </div>
            )}
            {activeSection === "history" && (
              <div className="section">
                <TransactionHistory />
              </div>
            )}
          </div>
        </div>
      </div>
    </WalletContextProvider>
  );
}

export default App;
