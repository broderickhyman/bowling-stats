import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { PinpalService } from '@/services/pinpal.service';
import type { LeagueOverview } from '@/services/pinpal.model';
import { LeagueOverviewCard } from '@/components/league-overview-card';

export function LeaguesPage() {
  const [allLeagues, setAllLeagues] = useState<LeagueOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'regular' | 'tournament'>('regular');
  const navigate = useNavigate();
  const pinpalService = useRef(new PinpalService()).current;

  useEffect(() => {
    const loadData = async () => {
      const leagues = await pinpalService.loadLeagueOverviews({});
      if (leagues.length === 0) {
        navigate('/upload');
        return;
      }
      setAllLeagues(leagues);
      setLoading(false);
    };
    loadData();
  }, [pinpalService, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-xl font-semibold">Loading leagues...</h1>
      </div>
    );
  }

  const regularLeagues = allLeagues.filter((l) => l.type === 'regular');
  const tournaments = allLeagues.filter((l) => l.type === 'tournament');
  const displayLeagues = activeTab === 'regular' ? regularLeagues : tournaments;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-semibold">Leagues</h1>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2">
        <Button
          variant={activeTab === 'regular' ? 'default' : 'outline'}
          onClick={() => setActiveTab('regular')}
          disabled={regularLeagues.length === 0}
        >
          Regular Leagues ({regularLeagues.length})
        </Button>
        <Button
          variant={activeTab === 'tournament' ? 'default' : 'outline'}
          onClick={() => setActiveTab('tournament')}
          disabled={tournaments.length === 0}
        >
          Tournaments ({tournaments.length})
        </Button>
      </div>

      {/* Grid of League Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayLeagues.map((league) => (
          <LeagueOverviewCard key={league.pk} league={league} />
        ))}
      </div>

      {displayLeagues.length === 0 && (
        <p className="text-center text-muted-foreground">No {activeTab} leagues found</p>
      )}
    </div>
  );
}

export default LeaguesPage
