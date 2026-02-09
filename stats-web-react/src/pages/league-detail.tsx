import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { usePinpalService } from '@/contexts/pinpal-service-context';
import type { Game, LeagueOverview } from '@/services/pinpal.model';
import { GamesOverview } from '@/components/games-overview';

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [league, setLeague] = useState<LeagueOverview | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pinpalService = usePinpalService();

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/leagues');
        return;
      }

      const leagueId = parseInt(id, 10);
      if (isNaN(leagueId)) {
        navigate('/leagues');
        return;
      }

      try {
        const overviews = await pinpalService.loadLeagueOverviews({ leagueId });
        if (!overviews || overviews.length === 0) {
          navigate('/leagues');
          return;
        }

        setLeague(overviews[0]);

        const loadedGames = await pinpalService.loadGames({ leagueId });
        if (loadedGames.length === 0) {
          navigate('/leagues');
          return;
        }

        setGames(loadedGames);
        setLoading(false);
      } catch (error) {
        console.error('Error loading league:', error);
        navigate('/leagues');
      }
    };

    loadData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-xl font-semibold">Loading league...</h1>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-xl font-semibold">League not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{league.name}</h1>
          <Badge variant={league.type === 'tournament' ? 'default' : 'secondary'}>
            {league.type === 'tournament' ? 'Tournament' : 'Regular'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium">{league.start.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium">{league.end.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-medium">
              {league.average.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Games</p>
            <p className="font-medium">{league.count}</p>
          </div>
        </div>
      </div>

      <GamesOverview games={games} />
    </div>
  );
}

export default LeagueDetailPage
