import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

// Register only once
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const ChartVisualization = ({ data = { labels: [], datasets: [] } }) => {
    const [chartType, setChartType] = useState('bar');

    // Defensive normalization of input data
    const normalized = useMemo(() => {
        const labels = Array.isArray(data.labels) ? data.labels : [];
        const datasets = Array.isArray(data.datasets) ? data.datasets.map((ds) => {
            // normalize numeric values in dataset.data
            const normalizedData = Array.isArray(ds.data)
                ? ds.data.map((v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? n : 0;
                })
                : [];

            return {
                ...ds,
                data: normalizedData,
                // keep borderColor & backgroundColor if present
                borderColor: ds.borderColor ?? 'rgba(59, 130, 246, 1)',
                backgroundColor: ds.backgroundColor ?? 'rgba(59, 130, 246, 0.6)',
            };
        }) : [];

        return { labels, datasets };
    }, [data]);

    // Safe computed stats
    const stats = useMemo(() => {
        const first = normalized.datasets[0] ?? { data: [] };
        const values = Array.isArray(first.data) ? first.data : [];
        const total = values.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        const avg = values.length > 0 ? Math.round((total / values.length) * 100) / 100 : 0;
        return {
            dataPoints: normalized.labels.length,
            totalValues: total,
            average: avg,
        };
    }, [normalized]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: 'Inter, sans-serif' } },
            },
            title: {
                display: true,
                text: 'Data Distribution',
                font: { family: 'Inter, sans-serif', size: 16, weight: '600' },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { family: 'Inter, sans-serif' },
                bodyFont: { family: 'Inter, sans-serif' },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { family: 'Inter, sans-serif' } },
            },
            x: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { family: 'Inter, sans-serif' }, maxRotation: 45 },
            },
        },
    }), []);

    // Derived datasets for different types
    const lineChartData = useMemo(() => {
        return {
            labels: normalized.labels,
            datasets: normalized.datasets.map((ds) => ({
                ...ds,
                type: 'line',
                borderColor: ds.borderColor,
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointBackgroundColor: ds.borderColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.4,
            })),
        };
    }, [normalized]);

    const histogramData = useMemo(() => {
        return {
            labels: normalized.labels,
            datasets: normalized.datasets.map((ds) => ({
                ...ds,
                backgroundColor: Array.isArray(ds.backgroundColor) ? ds.backgroundColor : ds.backgroundColor,
                borderColor: Array.isArray(ds.borderColor) ? ds.borderColor : ds.borderColor,
                borderWidth: 1,
            })),
        };
    }, [normalized]);

    const renderChart = () => {
        if (!normalized.labels.length || !normalized.datasets.length) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No data available for visualization</p>
                </div>
            );
        }

        switch (chartType) {
            case 'line':
                return <Line data={lineChartData} options={chartOptions} />;
            case 'histogram':
                return <Bar data={histogramData} options={chartOptions} />;
            default:
                return <Bar data={normalized} options={chartOptions} />;
        }
    };

    const chartTypes = [
        { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
        { id: 'histogram', name: 'Histogram', icon: Activity, description: 'Show frequency distribution' },
        { id: 'line', name: 'Time-Series', icon: TrendingUp, description: 'Track changes over time' },
    ];

    return (
        <div className="space-y-6">
            {/* Chart Type Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {chartTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <Button
                            key={type.id}
                            variant={chartType === type.id ? 'default' : 'outline'}
                            onClick={() => setChartType(type.id)}
                            className="flex items-center space-x-2 h-auto p-4 flex-col text-center"
                        >
                            <Icon className="w-5 h-5" />
                            <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs opacity-70">{type.description}</div>
                            </div>
                        </Button>
                    );
                })}
            </div>

            {/* Chart Container */}
            <Card className="p-6">
                <div className="chart-container" style={{ minHeight: 240 }}>
                    {renderChart()}
                </div>
            </Card>

            {/* Chart Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="font-medium text-blue-800">Data Points</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.dataPoints}</div>
                    <div className="text-blue-600">Categories shown</div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="font-medium text-green-800">Total Values</div>
                    <div className="text-2xl font-bold text-green-900">{stats.totalValues}</div>
                    <div className="text-green-600">Sum of all values</div>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="font-medium text-purple-800">Average</div>
                    <div className="text-2xl font-bold text-purple-900">{stats.average}</div>
                    <div className="text-purple-600">Mean value</div>
                </Card>
            </div>
        </div>
    );
};

export default ChartVisualization;
