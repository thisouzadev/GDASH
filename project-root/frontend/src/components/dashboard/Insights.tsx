// src/components/dashboard/Insights.tsx
import React, { useEffect, useState } from "react";
import { useWeatherInsights } from "@/hooks/useWeatherInsights";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Insights() {
  const { loading, getInsights, generateInsights } = useWeatherInsights();
  const [insight, setInsight] = useState<any | null>(null);

  useEffect(() => {
    getInsights().then(setInsight).catch(() => toast.error("Failed to get insights"));
  }, [getInsights]);

  const onGenerate = async () => {
    try {
      await generateInsights();
      toast.success("Insight generation triggered");
    } catch {
      toast.error("Failed to trigger insights");
    }
  };

  if (!insight) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>AI summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{insight.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation</CardTitle>
          <CardDescription>AI recommendation</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{insight.recommendation}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Trigger fresh insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onGenerate} disabled={loading}>Generate Insights</Button>
        </CardContent>
      </Card>
    </div>
  );
}
