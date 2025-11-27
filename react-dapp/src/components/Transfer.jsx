// src/components/Transfer.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import HAYQAbi from '../abis/HAYQ.json';

function Transfer({ contractAddress }) {
  const { t } = useTranslation();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTokens = async () => {
    if (!window.ethereum || !contractAddress) return;

    if (!ethers.isAddress(to)) {
      alert(t("enterValidAddress"));
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert(t("enterValidAmount"));
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, HAYQAbi, signer);

      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await contract.transfer(to, parsedAmount);
      await tx.wait();

      alert(t("transferSuccess"));
      setTo('');
      setAmount('');
    } catch (err) {
      console.error(err);
      alert(t("transferFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h3>{t("transferHAYQ")}</h3>
      <input
        placeholder={t("recipientAddress")}
        value={to}
        onChange={e => setTo(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder={t("amount")}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={loading}
      />
      <button className="primary" onClick={sendTokens} disabled={loading}>
        {loading ? t("processing") : t("send")}
      </button>
    </div>
  );
}

export default Transfer;
