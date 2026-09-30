"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export function ForecastChart({
  attended = 0,
  conducted = 0,
  points,
  minimum = 75,
  futureClasses = 15,
}: {
  attended?: number;
  conducted?: number;
  points?: Array<{ label: string; best: number; worst: number }>;
  minimum?: number;
  futureClasses?: number;
}) {
  const chartData = useMemo(() => {
    if (points && points.length > 0) {
      return points.map((p, idx) => ({
        label: p.label,
        bestCase: p.best,
        worstCase: p.worst,
      }));
    }

    const pts = [];
    const currentPct = conducted > 0 ? (attended / conducted) * 100 : 0;
    pts.push({
      label: "Current",
      bestCase: Number(currentPct.toFixed(1)),
      worstCase: Number(currentPct.toFixed(1)),
    });

    let bestAttended = attended;
    let worstAttended = attended;
    let totalConducted = conducted;

    for (let i = 1; i <= futureClasses; i++) {
      bestAttended += 1;
      totalConducted += 1;
      const best = (bestAttended / totalConducted) * 100;
      const worst = (worstAttended / totalConducted) * 100;

      pts.push({
        label: `+${i}`,
        bestCase: Number(best.toFixed(1)),
        worstCase: Number(worst.toFixed(1)),
      });
    }

    return pts;
  }, [attended, conducted, points, futureClasses]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
          <YAxis domain={[50, 100]} stroke="#888888" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(11, 19, 43, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <ReferenceLine
            y={minimum}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: `${minimum}% VTU Cutoff`, fill: "#ef4444", fontSize: 10, position: "top" }}
          />
          <Line
            type="monotone"
            dataKey="bestCase"
            name="100% Attendance"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="worstCase"
            name="0% Attendance"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
