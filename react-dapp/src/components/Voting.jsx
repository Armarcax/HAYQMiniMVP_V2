import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import HAYQData from '../abis/HAYQMiniMVP.json';

export default function Voting({ contractAddress, account }) {
  const { t } = useTranslation();

  // Proper ABI extraction
  const ABI = HAYQData.abi;  

  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!contractAddress || !account) return;

    (async () => {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, ABI, provider);

        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (err) {
        console.error("Voting init error:", err);
      }
    })();
  }, [contractAddress, account]);

  const takeSnapshot = async () => {
    if (!window.ethereum || !contractAddress) return;

    if (!isOwner) {
      setStatus(t("ownerOnly"));
      return;
    }

    setLoading(true);
    setStatus(t("vote_pending"));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const tx = await contract.snapshot();
      setStatus(`${t("txSent")}: ${tx.hash}`);

      await tx.wait();
      setStatus(t("vote_success"));
    } catch (err) {
      console.error("Snapshot error:", err);

      if (err?.code === 4001) {
        setStatus(t("txRejected"));
      } else {
        const msg = err?.error?.message || err?.message || String(err);
        setStatus(`${t("vote_failed")}: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h3>{t("votingSnapshot")}</h3>

      {!isOwner ? (
        <p style={{ color: "orange" }}>
          {t("ownerOnlyNotice") || "Only owner can create snapshots."}
        </p>
      ) : (
        <div>
          <button className="primary" onClick={takeSnapshot} disabled={loading}>
            {loading ? t("processing") : t("createSnapshot")}
          </button>
        </div>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}
