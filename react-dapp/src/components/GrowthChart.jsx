// GrowthChart.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GrowthChart = ({ growthData }) => {
  const [data, setData] = useState(
    [{ quarter: "Q1", growth: 0 }, { quarter: "Q2", growth: 0 }, { quarter: "Q3", growth: 0 }, { quarter: "Q4", growth: 0 }]
  );

  useEffect(() => {
    if (!growthData) return;
    const formatted = growthData.map((val, idx) => ({ quarter: `Q${idx+1}`, growth: val }));
    setData(formatted);
  }, [growthData]);

  return (
    <div className="component">
      <h3>Economic Growth Rate (Annual %)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quarter" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="growth" fill="#F2A800" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
