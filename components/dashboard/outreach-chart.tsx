"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { DailyPoint, PacePoint } from "@/lib/data";

const activityConfig = {
  called: {
    label: "Called",
    theme: { light: "#2a78d6", dark: "#3987e5" },
  },
  messaged: {
    label: "Messaged",
    theme: { light: "#1baf7a", dark: "#199e70" },
  },
} satisfies ChartConfig;

const paceConfig = {
  actual: {
    label: "Reached (actual)",
    theme: { light: "#2a78d6", dark: "#3987e5" },
  },
  target: {
    label: "Plan target",
    theme: { light: "#8d8d86", dark: "#8d8d86" },
  },
} satisfies ChartConfig;

interface Props {
  daily: DailyPoint[];
  pace: PacePoint[];
  planWeeks: number;
}

export function OutreachChart({ daily, pace, planWeeks }: Props) {
  const [view, setView] = useState("daily");

  const weekly = Array.from({ length: planWeeks }, (_, i) => {
    const days = daily.filter((d) => d.week === i + 1);
    return {
      label: `Week ${i + 1}`,
      called: days.reduce((n, d) => n + d.called, 0),
      messaged: days.reduce((n, d) => n + d.messaged, 0),
    };
  }).filter((w) => w.called + w.messaged > 0 || daily.some((d) => `Week ${d.week}` === w.label));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Outreach over the 7-week plan</CardTitle>
          <CardDescription>
            {view === "pace"
              ? "Cumulative people reached vs. the plan target"
              : "People contacted per day, by channel"}
          </CardDescription>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="pace">Plan pace</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {view === "pace" ? (
          <ChartContainer config={paceConfig} className="h-[300px] w-full">
            <LineChart data={pace} margin={{ left: 4, right: 12 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.35} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={6}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="target"
                type="monotone"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              <Line
                dataKey="actual"
                type="monotone"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <ChartContainer
            config={activityConfig}
            className="h-[300px] w-full"
          >
            <BarChart
              data={view === "daily" ? daily : weekly}
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid vertical={false} strokeOpacity={0.35} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={view === "daily" ? 3 : 0}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="called"
                stackId="a"
                fill="var(--color-called)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="messaged"
                stackId="a"
                fill="var(--color-messaged)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
