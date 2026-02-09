import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePinpalService } from '@/contexts/pinpal-service-context';
import type { Game } from '@/services/pinpal.model';
import { GamesOverview } from '@/components/games-overview';

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLimit, setGamesLimit] = useState<number>(() => {
    const saved = localStorage.getItem('homePageGamesLimit');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 30;
  });
  const pinpalService = usePinpalService();

  const loadData = async (limit: number) => {
    const loadedGames = await pinpalService.loadGames({ limit });
    if (loadedGames.length > 0) {
      setExistingData(true);
      setGames(loadedGames);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadData(gamesLimit);
      setLoading(false);
    };
    initialize();
  }, []);

  const handleGamesLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      value = 1;
      e.target.value = '1';
    }

    setGamesLimit(value);
    localStorage.setItem('homePageGamesLimit', value.toString());
    loadData(value);
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      {loading ? (
        <h1 className="text-xl font-semibold">Checking for existing data</h1>
      ) : existingData ? (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="games-limit" className="mb-2 block">
                Number of Recent Games
              </Label>
              <Input
                id="games-limit"
                type="number"
                value={gamesLimit}
                onChange={handleGamesLimitChange}
                min="1"
                className="w-full max-w-xs"
              />
            </div>
          </div>
          <GamesOverview games={games} />
        </>
      ) : (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">No Data Found</h1>
          <NavLink to="/upload">
            {({ isActive }) => (
              <Button variant={isActive ? 'default' : 'outline'}>Upload Page</Button>
            )}
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default HomePage
