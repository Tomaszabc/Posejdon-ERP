import React from 'react';
import { Pie, Line, Bar, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend
);

export default function Home() {
  const pieData = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: ['#2563eb', '#10b981', '#f59e42'],
      },
    ],
  };

  const lineData = {
    labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj'],
    datasets: [
      {
        label: 'Produkcja',
        data: [12, 19, 3, 5, 2],
        fill: false,
        borderColor: '#2563eb',
        tension: 0.1,
      },
    ],
  };

  const barData = {
    labels: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt'],
    datasets: [
      {
        label: 'Zamówienia',
        data: [5, 9, 7, 8, 6],
        backgroundColor: '#10b981',
      },
    ],
  };

  const radarData = {
    labels: ['Jakość', 'Szybkość', 'Koszt', 'Satysfakcja', 'Innowacja'],
    datasets: [
      {
        label: 'Ocena',
        data: [4, 3, 5, 4, 2],
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  const polarData = {
    labels: ['Magazyn', 'Produkcja', 'Sprzedaż', 'Logistyka'],
    datasets: [
      {
        label: 'Udział',
        data: [11, 16, 7, 14],
        backgroundColor: ['#2563eb', '#10b981', '#f59e42', '#f43f5e'],
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <h1 className="text-3xl font-bold mb-6">Witamy w E-Posejdon. Moduł produkcji</h1>
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
      <div className="flex flex-col md:flex-row gap-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wykres słupkowy</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wykres radarowy</h2>
          <Radar data={radarData} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wykres polar area</h2>
          <PolarArea data={polarData} />
        </div>
      </div>
    </div>
  );
}
