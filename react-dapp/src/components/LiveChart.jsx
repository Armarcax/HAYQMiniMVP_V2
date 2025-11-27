import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function LiveChart({ data = [] }) {
  const { t } = useTranslation();

  // Normalize data (in case value arrives as string or undefined)
  const normalizedData = data
    .filter((d) => d && d.time && d.value !== undefined)
    .map((d) => ({
      time: d.time,
      value: Number(d.value)
    }));

  return (
    <div className="component">
      <h3>{t("liveChart")}</h3>

      {normalizedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={normalizedData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip
              formatter={(value) => [value, "APR"]}
              labelStyle={{ fontWeight: "bold" }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#7E5BFF"
              strokeWidth={3}
              dot={false}
              animationDuration={800}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>{t("noData") || "[No data available]"}</p>
      )}
    </div>
  );
}

export default LiveChart;
