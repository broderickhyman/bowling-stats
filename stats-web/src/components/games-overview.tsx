import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePinpalService } from '@/contexts/pinpal-service-context';
import type { Stats } from '@/services/pinpal.service';
import type { Game } from '@/services/pinpal.model';
import { StatCard } from './stat-card';

interface GamesOverviewProps {
  games: Game[];
}

export function GamesOverview({ games }: GamesOverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const pinpalService = usePinpalService();

  useEffect(() => {
    const loadStats = async () => {
      const gameStats = await pinpalService.loadGameStats(games);
      setStats(gameStats);
    };
    loadStats();
  }, [games]);

  const chartData = games.map((game) => ({
    date: game.week!.date.toLocaleDateString(),
    score: game.score,
  }));

  return (
    <div className="space-y-8">
      {stats && (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-4">Game Stats</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard displayText="Average" value={stats.average} />
              <StatCard displayText="High Score" value={stats.high} />
              <StatCard displayText="Count" value={stats.count} />
              <StatCard displayText="Clean Games" value={stats.cleanCount} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard displayText="Strikes %" value={stats.strikesPercent} />
              <StatCard displayText="Pocket Hits %" value={stats.pocketHitsPercent} />
              <StatCard displayText="Opens %" value={stats.opensPercent} />
              <StatCard displayText="Spares %" value={stats.sparesPercent} />
              <StatCard displayText="Single Pin %" value={stats.singlePinPickupPercent} />
              <StatCard displayText="Gutters" value={stats.gutters} />
            </div>
          </div>
        </>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Score</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#22c55e" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
