import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PinpalService } from '@/services/pinpal.service';
import type { MonthlyStats } from '@/services/pinpal.model';

type MetricKey = 'averageScore' | 'strikesPercent' | 'pocketHitsPercent' | 'opensPercent' | 'sparesPercent' | 'singlePinPickupPercent';

interface MetricOption {
  value: MetricKey;
  label: string;
  color: string;
}

interface SortConfig {
  key: keyof MonthlyStats;
  direction: 'asc' | 'desc';
}

const metricOptions: MetricOption[] = [
  { value: 'averageScore', label: 'Average Score', color: '#3b82f6' },
  { value: 'strikesPercent', label: 'Strikes %', color: '#10b981' },
  { value: 'pocketHitsPercent', label: 'Pocket Hits %', color: '#f59e0b' },
  { value: 'opensPercent', label: 'Opens %', color: '#ef4444' },
  { value: 'sparesPercent', label: 'Spares %', color: '#8b5cf6' },
  { value: 'singlePinPickupPercent', label: 'Single Pin %', color: '#ec4899' },
];

export function MonthlyPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [filteredStats, setFilteredStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthsToDisplay, setMonthsToDisplay] = useState(12);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['averageScore', 'strikesPercent', 'pocketHitsPercent']);
  const navigate = useNavigate();
  const pinpalService = useRef(new PinpalService()).current;

  useEffect(() => {
    const loadData = async () => {
      const stats = await pinpalService.loadMonthlyStats();
      if (stats.length === 0) {
        navigate('/upload');
        return;
      }
      setMonthlyStats(stats);
      updateFilteredStats(stats, monthsToDisplay, sortConfig);
      setLoading(false);
    };
    loadData();
  }, [pinpalService, navigate]);

  const updateFilteredStats = (stats: MonthlyStats[], months: number, sort: SortConfig) => {
    let filtered = stats.slice(0, months);

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredStats(filtered);
  };

  const handleSort = (key: keyof MonthlyStats) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key, direction: newDirection as 'asc' | 'desc' };
    setSortConfig(newSortConfig);
    updateFilteredStats(monthlyStats, monthsToDisplay, newSortConfig);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > monthlyStats.length) {
      value = monthlyStats.length;
    }
    setMonthsToDisplay(value);
    updateFilteredStats(monthlyStats, value, sortConfig);
  };

  const toggleMetric = (metric: MetricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const calculateTrailing4MonthAverage = (stats: MonthlyStats[], metric: MetricKey): number[] => {
    const trailing: number[] = [];
    for (let i = 0; i < stats.length; i++) {
      const startIndex = Math.max(0, i - 3);
      const slice = stats.slice(startIndex, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr[metric], 0);
      const avg = sum / slice.length;
      trailing.push(Math.round(avg));
    }
    return trailing;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-xl font-semibold">Loading monthly stats...</h1>
      </div>
    );
  }

  // Prepare chart data
  const reversedStats = [...monthlyStats].slice(0, monthsToDisplay).reverse();
  const chartData = reversedStats.map((stat, index) => {
    const data: Record<string, any> = { month: stat.date };
    selectedMetrics.forEach((metric) => {
      data[metric] = stat[metric];
    });
    // Add trailing average for first metric
    if (selectedMetrics.length > 0) {
      const trailing = calculateTrailing4MonthAverage(
        monthlyStats.slice(0, monthsToDisplay),
        selectedMetrics[0]
      );
      data[`${selectedMetrics[0]}_trailing`] = trailing[index];
    }
    return data;
  });

  const displayColumns: Array<keyof MonthlyStats> = [
    'date',
    'averageScore',
    'strikesPercent',
    'pocketHitsPercent',
    'opensPercent',
    'sparesPercent',
    'singlePinPickupPercent',
    'gutters',
  ];

  const SortIndicator = ({ column }: { column: keyof MonthlyStats }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-semibold">Monthly Bowling Statistics</h1>

      {/* Controls */}
      <div className="mb-8 space-y-4 rounded-lg bg-muted p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="months" className="mb-2 block">
              Number of Months
            </Label>
            <Input
              id="months"
              type="number"
              value={monthsToDisplay}
              onChange={handleMonthsChange}
              min="1"
              max={monthlyStats.length}
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Metrics to Display</Label>
          <div className="flex flex-wrap gap-2">
            {metricOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedMetrics.includes(option.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleMetric(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {selectedMetrics.length > 0 && (
        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Trend Chart</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 'auto']} />
              <Tooltip />
              <Legend />
              {selectedMetrics.map((metric) => {
                const option = metricOptions.find((o) => o.value === metric);
                return option ? (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={option.color}
                    dot={false}
                    name={option.label}
                    isAnimationActive={false}
                  />
                ) : null;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {displayColumns.map((column) => (
                <th key={column} className="border-b px-4 py-3 text-left font-medium">
                  <button
                    onClick={() => handleSort(column)}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                    <SortIndicator column={column} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStats.map((stat, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/50">
                {displayColumns.map((column) => (
                  <td key={column} className="px-4 py-3">
                    {column === 'date'
                      ? stat[column]
                      : `${typeof stat[column] === 'number' ? (stat[column] as number).toFixed(0) : stat[column]}`}
                    {column !== 'date' && column !== 'gutters' && '%'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyPage
