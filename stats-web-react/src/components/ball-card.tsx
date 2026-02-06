import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BallStats } from '@/services/pinpal.model';

interface BallCardProps {
  ball: BallStats;
}

export function BallCard({ ball }: BallCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ball.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Average:</span>{' '}
          {ball.average.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
        </p>
        <p>
          <span className="font-medium">Games:</span> {Math.round(ball.games)}
        </p>
        <p>
          <span className="font-medium">First Used:</span> {ball.firstUsed.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
