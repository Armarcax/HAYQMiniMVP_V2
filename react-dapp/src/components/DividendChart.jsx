// src/components/DividendChart.jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ethers } from 'ethers';
import HAYQAbi from '../abis/HAYQMiniMVP.json';
import { useTranslation } from 'react-i18next';

const DividendChart = ({ contractAddress, provider, signer, account }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);

  const fetchDividends = async () => {
    if (!contractAddress || !account || !window.ethereum) return;

    try {
      const contract = new ethers.Contract(contractAddress, HAYQAbi, provider || signer);

      if (typeof contract.claimableDividend !== 'function') return;

      const dividendRaw = await contract.claimableDividend(account);
      const dividendValue = Number(ethers.formatUnits(dividendRaw, 18));

      const point = { time: new Date().toLocaleTimeString(), value: dividendValue };
      setData((prev) => [...prev.slice(-29), point]); // keep last 30 points
    } catch (err) {
      console.error("Failed to fetch dividends:", err);
    }
  };

  useEffect(() => {
    fetchDividends();
    const interval = setInterval(fetchDividends, 30000); // every 30s
    return () => clearInterval(interval);
  }, [contractAddress, account]);

  return (
    <div className="component">
      <h3>{t("dividend")}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toFixed(4), "HAYQ"]} />
            <Line type="monotone" dataKey="value" stroke="#FFAA33" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>{t("noData") || "[No dividend data]"}</p>
      )}
    </div>
  );
};

export default DividendChart;
