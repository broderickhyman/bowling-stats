import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeagueOverview } from '@/services/pinpal.model';

interface LeagueOverviewCardProps {
  league: LeagueOverview;
}

export function LeagueOverviewCard({ league }: LeagueOverviewCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{league.name}</CardTitle>
          <Badge variant={league.type === 'tournament' ? 'default' : 'secondary'}>
            {league.type === 'tournament' ? 'Tournament' : 'Regular'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Average:</span> {league.average.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </p>
          <p>
            <span className="font-medium">Games:</span> {league.count}
          </p>
          <p>
            <span className="font-medium">Start:</span> {league.start.toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">End:</span> {league.end.toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/league/${league.pk}`)}
          className="w-full"
          variant="outline"
        >
          View League
        </Button>
      </CardContent>
    </Card>
  );
}
