import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePinpalService } from '@/contexts/pinpal-service-context';
import type { Week } from '@/services/pinpal.model';

export function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('Loading...');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const pinpalService = usePinpalService();

  const gameScores = (week: Week): string => {
    return week.games.map((g) => g.score).join(', ');
  };

  const loadData = async () => {
    const weeksMap = await pinpalService.loadWeeks(4);
    setWeeks([...weeksMap.values()]);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadData();
      setStatus(pinpalService.status);
    };
    initialize();
  }, []);

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    try {
      await pinpalService.importDatabase(file);
      setStatus('Imported database');
      await loadData();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import PinPal database');
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-semibold mb-8">Upload your PinPal backup</h1>

      <div className="mb-6">
        <Button onClick={onUploadClick} size="lg">
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pinpal"
          onChange={onFileSelected}
          className="hidden"
        />
      </div>

      <div className="text-lg font-medium mb-6">Status: {status}</div>

      {weeks.length > 0 && (
        <>
          <div className="mb-6">
            <NavLink to="/">
              {({ isActive }) => (
                <Button variant={isActive ? 'default' : 'outline'}>Home</Button>
              )}
            </NavLink>
          </div>

          <div className="mb-4 text-xl font-medium">Most recent days:</div>
          <div className="space-y-2">
            {weeks.map((week) => (
              <Card key={week.date.toISOString()}>
                <CardContent className="pt-4">
                  <div className="font-medium">{week.date.toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {gameScores(week)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UploadPage
