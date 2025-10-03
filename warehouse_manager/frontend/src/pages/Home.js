import React, { useState, useEffect } from 'react';
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
import { API_URL } from '../config';

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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`${API_URL}/api/dashboard-statistics/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Błąd pobierania danych dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl">Ładowanie danych...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-red-600">Błąd ładowania danych</div>
      </div>
    );
  }

  // Dane dla wykresu słupkowego (ostatnie 7 dni)
  const barData = {
    labels: dashboardData.daily_orders.map((item) => `${item.day} ${item.date}`),
    datasets: [
      {
        label: 'Zamówienia dziennie',
        data: dashboardData.daily_orders.map((item) => item.count),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  // Dane dla wykresu liniowego (ostatnie 6 miesięcy)
  const lineData = {
    labels: dashboardData.monthly_orders.map((item) => item.short_month),
    datasets: [
      {
        label: 'Zamówienia miesięcznie',
        data: dashboardData.monthly_orders.map((item) => item.count),
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.1,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#1d4ed8',
      },
    ],
  };

  // Dane dla wykresu kołowego (statystyki produkcji)
  const pieData = {
    labels: ['Wyprodukowane', 'Oczekujące'],
    datasets: [
      {
        data: [dashboardData.statistics.produced_orders, dashboardData.statistics.pending_orders],
        backgroundColor: ['#10b981', '#f59e42'],
        borderColor: ['#059669', '#ea580c'],
        borderWidth: 2,
      },
    ],
  };

  // Opcje dla wykresów z maintainAspectRatio
  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Zamówienia w ostatnich 7 dniach',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Trend zamówień w ostatnich miesiącach',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Dashboard E-Posejdon - Moduł Produkcji
        </h1>

        {/* Statystyki liczbowe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">Zamówienia produkcyjne</h3>
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData.statistics.total_orders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">Wyprodukowane</h3>
            <p className="text-3xl font-bold text-green-600">
              {dashboardData.statistics.produced_orders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">Oczekujące</h3>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardData.statistics.pending_orders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">Wskaźnik produkcji</h3>
            <p className="text-3xl font-bold text-purple-600">
              {dashboardData.statistics.production_rate}%
            </p>
          </div>
        </div>

        {/* Wykresy główne - zgodne z oryginalnym układem */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
            <h2 className="text-xl font-semibold mb-4">Zamówienia w ostatnich dniach</h2>
            <div className="w-full h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
            <h2 className="text-xl font-semibold mb-4">Trend miesięczny</h2>
            <div className="w-full h-80">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* Wykres kołowy - wyśrodkowany jak w oryginale */}
        <div className="flex justify-center w-full">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Status zamówień</h2>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}
