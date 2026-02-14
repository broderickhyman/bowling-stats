import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WelcomePage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Welcome to Bowling Stats</h1>
        <p className="text-xl text-muted-foreground">
          Visualize your bowling performance with powerful statistics
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What is this?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Bowling Stats is a web application that helps you analyze and visualize your bowling
            performance using data from the PinPal app. Track your progress, identify trends,
            and gain insights into your game.
          </p>
          <p>
            View detailed statistics including averages, strike percentages, spare percentages,
            pin leave analysis, and performance trends over time.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Privacy First</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Your data stays on your device. All processing happens locally in your browser
            using IndexedDB for storage. No data is sent to any server.
          </p>
          <p>
            Your bowling statistics are yours alone, ensuring complete privacy and control
            over your personal data.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Export from PinPal:</strong> In the PinPal app, create a backup file
              of your bowling data (.pinpal file)
            </li>
            <li>
              <strong>Upload:</strong> Click the button below to upload your PinPal backup file
            </li>
            <li>
              <strong>Explore:</strong> Once uploaded, you can view your leagues, games,
              ball statistics, and monthly trends
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <NavLink to="/upload">
          {({ isActive }) => (
            <Button
              size="lg"
              variant={isActive ? "default" : "default"}
              className="text-lg px-8 py-6"
            >
              Upload Your PinPal Backup
            </Button>
          )}
        </NavLink>
      </div>
    </div>
  );
}

export default WelcomePage;
