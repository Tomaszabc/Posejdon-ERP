import React from "react";
import { Pie, Line } from "react-chartjs-2";
import { Chart, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Home() {
  const pieData = {
    labels: ["A", "B", "C"],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: ["#2563eb", "#10b981", "#f59e42"],
      },
    ],
  };

  const lineData = {
    labels: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj"],
    datasets: [
      {
        label: "Produkcja",
        data: [12, 19, 3, 5, 2],
        fill: false,
        borderColor: "#2563eb",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <h1 className="text-3xl font-bold mb-6">Witamy w E-Posejdon ERP!</h1>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wykres kołowy</h2>
          <Pie data={pieData} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wykres liniowy</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}