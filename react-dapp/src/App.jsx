// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";

import WalletConnect from "./components/WalletConnect";
import Balance from "./components/Balance";
import Transfer from "./components/Transfer";
import Stake from "./components/Stake";
import Unstake from "./components/Unstake";
import Buyback from "./components/Buyback";
import Voting from "./components/Voting";
import DividendClaim from "./components/DividendClaim";
import EconomicGrowth from "./components/EconomicGrowth";
import Footer from "./components/Footer";
import { LiveChart, DividendChart, GrowthChart } from "./components/Charts";

import "./style.css";

const App = () => {
  const { t, i18n } = useTranslation();

  // ===== State =====
  const [contractAddress, setContractAddress] = useState("0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [aprHistory, setAprHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // ===== Language =====
  const changeLanguage = useCallback((lng) => i18n.changeLanguage(lng), [i18n]);

  // ===== Wallet Connect =====
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return alert("Install MetaMask!");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);

      // Listen to account/network changes
      window.ethereum.on("accountsChanged", (accounts) => setAccount(accounts[0] || ""));
      window.ethereum.on("chainChanged", async () => console.log("Network changed:", await _provider.getNetwork()));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ===== APR History Update =====
  const updateAPRHistory = useCallback((aprValue) => {
    setAprHistory((prev) => [...prev, { time: new Date().toLocaleTimeString(), value: aprValue }]);
  }, []);

  // ===== Dark Mode Toggle =====
  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  // ===== Common contract props =====
  const contractProps = { contractAddress, provider, signer, account };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <header className="app-header">
        <img
          src="/public-assets/HAYQ_logo.png"
          alt="HAYQLogo"
          className="logo"
          onClick={toggleDarkMode}
          title="Toggle dark/light mode"
        />
        <h1>{t("welcome")}</h1>
      </header>

      {/* Language Switcher */}
      <div className="lang-switcher">
        {["en","hy","ru","fr","es","de","zh","ja","ar"].map((lng) => (
          <button key={lng} onClick={() => changeLanguage(lng)}>
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Wallet Connect */}
      <WalletConnect setAccount={setAccount} />

      {/* Contract Address Input */}
      <div className="component">
        <input
          placeholder={t("contractAddress")}
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>

      {/* Contract Components */}
      <Balance {...contractProps} />
      <Transfer {...contractProps} />
      <Stake {...contractProps} />
      <Unstake {...contractProps} />
      <Buyback {...contractProps} />
      <Voting {...contractProps} />
      <DividendClaim {...contractProps} />
      <EconomicGrowth {...contractProps} onAprUpdate={updateAPRHistory} />

      {/* Charts */}
      <LiveChart data={aprHistory} />
      <DividendChart />
      <GrowthChart />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
