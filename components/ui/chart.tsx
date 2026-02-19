"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-layer]:outline-none [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-tooltip-wrapper]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, value]) => value.color);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {${colorConfig
          .map(([key, item]) => `  --color-${key}: ${item.color};`)
          .join("\n")}\n}`,
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "line",
  labelFormatter,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    indicator?: "line" | "dot";
    labelFormatter?: (value: string | number) => React.ReactNode;
  }) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className={cn("rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
      <div className="grid gap-1.5">
        {label !== undefined ? (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(label) : String(label)}
          </div>
        ) : null}
        {payload.map((item) => {
          const key = String(item.dataKey || "");
          const label = config[key]?.label ?? key;
          const color = item.color;

          return (
            <div key={key} className="flex items-center gap-2">
              {indicator === "dot" ? (
                <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              ) : (
                <span className="h-0.5 w-3 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              )}
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{item.value ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartLegendContent({
  payload,
  className,
}: React.ComponentProps<"div"> & {
  payload?: RechartsPrimitive.LegendProps["payload"];
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex items-center justify-center gap-4 pt-3 text-xs", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey || item.value || "");
        const label = config[key]?.label ?? item.value;
        const color = item.color || "currentColor";

        return (
          <div key={key} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent };
export type { ChartConfig };
