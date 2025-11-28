import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card } from '@/components/ui';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
  },
};

// Attendance Chart
export const AttendanceChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        data: data?.present || [85, 88, 82, 90, 87, 75],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Absent',
        data: data?.absent || [15, 12, 18, 10, 13, 25],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Weekly Attendance</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
          <Line data={chartData} options={commonOptions} />
        </div>
      </Card.Content>
    </Card>
  );
};

// Fee Collection Chart
export const FeeCollectionChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Collected',
        data: data?.collected || [65000, 78000, 72000, 85000, 90000, 88000],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'Pending',
        data: data?.pending || [15000, 12000, 18000, 10000, 8000, 12000],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString(),
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Fee Collection</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </Card.Content>
    </Card>
  );
};

// Student Distribution Chart
export const StudentDistributionChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    datasets: [
      {
        data: data?.values || [120, 150, 180, 140, 160],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    ...commonOptions,
    cutout: '60%',
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Students by Grade</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      </Card.Content>
    </Card>
  );
};

// Performance Chart
export const PerformanceChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Math', 'Science', 'English', 'History', 'Geography'],
    datasets: [
      {
        label: 'Average Score',
        data: data?.scores || [78, 82, 75, 88, 80],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    ...commonOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Subject Performance</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </Card.Content>
    </Card>
  );
};

// Enrollment Trend Chart
export const EnrollmentTrendChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Students',
        data: data?.students || [450, 520, 580, 650, 720, 800],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Teachers',
        data: data?.teachers || [25, 30, 35, 40, 45, 50],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Enrollment Trend</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="h-64">
          <Line data={chartData} options={commonOptions} />
        </div>
      </Card.Content>
    </Card>
  );
};
