import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function WalletConnect({ setAccount }) {
  const { t } = useTranslation();
  const [accountLocal, setAccountLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert(t("noMetamask"));
      return;
    }
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccountLocal(accounts[0]);
      setAccount(accounts[0]);         // ← ԱՅՍ ԱՎԵԼԱՑՐԵՑԻ
    } catch (err) {
      console.error(err);
      alert(t("walletError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <button onClick={connectWallet} disabled={loading}>
        {loading
          ? t("connecting")
          : accountLocal
            ? `${t("connected")}: ${accountLocal}`
            : t("connectWallet")}
      </button>
    </div>
  );
}

export default WalletConnect;
