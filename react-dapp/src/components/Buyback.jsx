// Buyback.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";
import HAYQAbi from "../abis/HAYQMiniMVP.json"; // համոզվի՛ր, որ սա array `abi` է

export default function Buyback({ contractAddress, account }) {
  const { t } = useTranslation();
  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState("0");
  const [amount, setAmount] = useState("100");
  const [minOut, setMinOut] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Init
  useEffect(() => {
    if (!contractAddress || !account) return;

    const init = async () => {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, HAYQAbi.abi, provider);

        // Owner
        let ownerAddress = null;
        try { ownerAddress = await contract.owner(); } catch {}
        setIsOwner(ownerAddress?.toLowerCase() === account.toLowerCase());

        // Balance
        const bal = await contract.balanceOf(contractAddress);
        setContractBalance(ethers.formatUnits(bal, 18));
      } catch (err) {
        console.error("Buyback init error:", err);
      }
    };
    init();
  }, [contractAddress, account]);

  const triggerBuyback = async () => {
    if (!window.ethereum || !contractAddress) return;
    if (!isOwner) {
      setStatus(t("ownerOnly"));
      return;
    }

    setLoading(true);
    setStatus(t("buyback_pending"));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, HAYQAbi.abi, signer);

      const tokenAmount = ethers.parseUnits(amount || "0", 18); // bigint
      const minOutUnits = ethers.parseUnits(minOut || "0", 18); // bigint

      const contractBal = await contract.balanceOf(contractAddress); // bigint
      if (contractBal < tokenAmount) { // ❌ lt() հանված
        setStatus(t("buyback_insufficient_contract_balance") || "Insufficient contract balance");
        setLoading(false);
        return;
      }

      const tx = await contract.buyback(tokenAmount, minOutUnits, { gasLimit: 500000 });
      setStatus(`${t("txSent")}: ${tx.hash}`);
      await tx.wait();
      setStatus(t("buyback_success"));

      const newBal = await contract.balanceOf(contractAddress);
      setContractBalance(ethers.formatUnits(newBal, 18));
    } catch (err) {
      console.error("Buyback error:", err);
      const message = err?.error?.message || err?.message || String(err);
      setStatus(`${t("buyback_failed")}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>{t("buyback")}</h2>

      <p>{t("contractBalance")}: {contractBalance} HAYQ</p>

      {!isOwner && (
        <p style={{ color: "orange" }}>
          {t("ownerOnlyNotice") || "Only owner can execute buyback."}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t("tokenAmount")}
        />
        <input
          type="text"
          value={minOut}
          onChange={(e) => setMinOut(e.target.value)}
          placeholder={t("minOut")}
        />
        <button className="primary" disabled={!isOwner || loading} onClick={triggerBuyback}>
          {loading ? t("processing") : t("buyback_trigger")}
        </button>
      </div>

      {status && <p>{status}</p>}
    </div>
  );
}
