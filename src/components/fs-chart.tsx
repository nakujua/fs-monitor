// src/components/DataCharts.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = [
  { name: 'January', value: 400 },
  { name: 'February', value: 300 },
  { name: 'March', value: 200 },
  { name: 'April', value: 278 },
  { name: 'May', value: 189 },
];

const DataCharts: React.FC = () => {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
};

export default DataCharts;
