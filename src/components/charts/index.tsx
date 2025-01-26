"use client";

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export function PieChart({ 
  data, 
  colors 
}: { 
  data: { [key: string]: number };
  colors?: { [key: string]: string };
}) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const labels = Object.keys(data);
        chartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: Object.values(data),
              backgroundColor: labels.map(label => 
                colors?.[label] || [
                  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
                  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4'
                ][labels.indexOf(label) % 10]
              )
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, colors]);

  return <canvas ref={chartRef} />;
}

export function BarChart({ data }: { data: { author: string; count: number }[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(item => item.author),
            datasets: [{
              label: 'Books Read',
              data: data.map(item => item.count),
              backgroundColor: '#3B82F6'
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
}

export function LineChart({ data }: { data: { month: string; pages: number }[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(item => item.month),
            datasets: [{
              label: 'Pages Read',
              data: data.map(item => item.pages),
              borderColor: '#3B82F6',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
} 