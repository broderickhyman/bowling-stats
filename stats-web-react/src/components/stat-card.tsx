import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  displayText: string;
  value: number;
}

export function StatCard({ displayText, value }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="border-b">
        <CardTitle>{displayText}</CardTitle>
      </CardHeader>
      <CardContent className="text-primary text-right text-lg font-semibold">
        {value.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
      </CardContent>
    </Card>
  );
}
