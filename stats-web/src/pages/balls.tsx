import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePinpalService } from '@/contexts/pinpal-service-context';
import type { BallStats } from '@/services/pinpal.model';
import { BallCard } from '@/components/ball-card';

export function BallsPage() {
  const [balls, setBalls] = useState<BallStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pinpalService = usePinpalService();

  useEffect(() => {
    const loadData = async () => {
      const ballStats = await pinpalService.loadBallStats();
      if (ballStats.length === 0) {
        navigate('/upload');
        return;
      }
      setBalls(ballStats);
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-xl font-semibold">Loading balls data...</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-semibold">Bowling Balls</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {balls.map((ball) => (
          <BallCard key={ball.pk} ball={ball} />
        ))}
      </div>
    </div>
  );
}

export default BallsPage
