import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";

import WalletConnect from "./components/WalletConnect";
import Balance from "./components/Balance";
import Transfer from "./components/Transfer";
import Stake from "./components/Stake";
import Unstake from "./components/Unstake";
import Buyback from "./components/Buyback";
import Voting from "./components/Voting";
import LiveChart from "./components/LiveChart";
import DividendClaim from "./components/DividendClaim";
import EconomicGrowth from "./components/EconomicGrowth";
import Footer from "./components/Footer";

import "./style.css";

// 🔶 Inline SVG Logo (եռանկյուն + արևային խորհրդանիշ) — ավելի կրիպ, անսահման մասշտաբելի
const HAYQLogoSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="logo"
    role="img"
    aria-label="HAYQ Token Logo"
  >
    {/* Եռանկյուն (հիմնական ձև) */}
    <polygon
      points="50,10 90,85 10,85"
      fill="none"
      stroke="url(#triGradient)"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* Արևային խորհրդանիշ (կենտրոնում) */}
    <circle cx="50" cy="50" r="8" fill="none" stroke="#F2A800" strokeWidth="2" />
    <g stroke="#D90012" strokeWidth="1.2">
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 50 + 12 * Math.cos(angle);
        const y1 = 50 + 12 * Math.sin(angle);
        const x2 = 50 + 22 * Math.cos(angle);
        const y2 = 50 + 22 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
    {/* Gradient for triangle */}
    <defs>
      <linearGradient id="triGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0033A0" />
        <stop offset="50%" stopColor="#D90012" />
        <stop offset="100%" stopColor="#F2A800" />
      </linearGradient>
    </defs>
  </svg>
);

function App() {
  const { t, i18n } = useTranslation();

  // Contract & Wallet
  const [contractAddress, setContractAddress] = useState(
    "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"
  );
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");

  // LiveChart data
  const [aprHistory, setAprHistory] = useState([]);

  const [darkMode, setDarkMode] = useState(false);

  const changeLanguage = (lng) => i18n.changeLanguage(lng);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _account = accounts[0];

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);

      window.ethereum.on("accountsChanged", (newAccounts) => {
        setAccount(newAccounts[0] || "");
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload(); // Պարզ լուծում — կամ կարող ես վերաբեռնել միայն contract-ը
      });
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const updateAPRHistory = (aprValue) => {
    setAprHistory((prev) => [
      ...prev.slice(-20), // Պահպանել վերջին 20 կետը
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: Number(aprValue) },
    ]);
  };

  // Optional: սկզբնական darkMode կարգավորում՝ համակարգի նախընտրությամբ
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {/* Header with SVG logo & title */}
      <header className="app-header">
        <button
          className="logo-button"
          onClick={toggleDarkMode}
          title={t("toggleTheme")}
          aria-label={t("toggleTheme")}
        >
          <HAYQLogoSVG />
        </button>
        <h1>{t("welcome")}</h1>
      </header>

      {/* Language Switcher */}
      <div className="lang-switcher">
        {["en", "hy", "ru", "fr", "es", "de", "zh", "ja", "ar"].map((lng) => (
          <button
            key={lng}
            onClick={() => changeLanguage(lng)}
            aria-label={`Switch to ${lng}`}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Wallet Connect (փոխարինում ենք, եթե դեռ չի կապված) */}
      {!provider ? (
        <div className="component">
          <button className="primary" onClick={connectWallet}>
            {t("connectWallet")}
          </button>
        </div>
      ) : (
        <WalletConnect setAccount={setAccount} />
      )}

      {/* Contract Address Input (ավելացված input-group wrapper) */}
      <div className="component">
        <div className="input-group">
          <input
            id="contract-address"
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder=" "
            aria-label={t("contractAddress")}
          />
          <label htmlFor="contract-address">{t("contractAddress")}</label>
        </div>
      </div>

      {/* Modules — պահպանված նույն կարգով */}
      <Balance contractAddress={contractAddress} provider={provider} signer={signer} />
      <Transfer contractAddress={contractAddress} provider={provider} signer={signer} />
      <Stake contractAddress={contractAddress} provider={provider} signer={signer} />
      <Unstake contractAddress={contractAddress} provider={provider} signer={signer} />
      <Buyback contractAddress={contractAddress} provider={provider} signer={signer} account={account} />
      <Voting contractAddress={contractAddress} provider={provider} signer={signer} account={account} />
      <DividendClaim contractAddress={contractAddress} provider={provider} signer={signer} />
      <EconomicGrowth
        contractAddress={contractAddress}
        provider={provider}
        signer={signer}
        onAprUpdate={updateAPRHistory}
      />
      <LiveChart data={aprHistory} />

      <Footer />
    </div>
  );
}

export default App;