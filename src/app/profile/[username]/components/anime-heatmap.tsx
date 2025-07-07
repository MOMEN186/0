import React, { useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import styles from "../heatmap.module.css";
import { Tooltip } from "react-tooltip";
import { useWatchHistory } from "@/hooks/use-get-watch-history"; // Firebase hook

// Type to describe heatmap entries
export type HeatmapValue = {
  date: string;
  count: number;
};

function AnimeHeatmap() {
  const { watchHistory, isLoading } = useWatchHistory();

  const startDate = new Date(new Date().setMonth(0, 1));
  const endDate = new Date(new Date().setMonth(11, 31));

  const { heatmapData, totalContributionCount } = useMemo(() => {
    const dailyCounts: { [date: string]: number } = {};
    let total = 0;

    watchHistory?.forEach((entry) => {
      const createdDate =
        typeof entry.created === "string"
          ? new Date(entry.created)
          : entry.created.toDate();
      const dateStr = createdDate.toISOString().substring(0, 10);

      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      total++;
    });

    const heatmapData: HeatmapValue[] = Object.entries(dailyCounts).map(
      ([date, count]) => ({ date, count })
    );

    return { heatmapData, totalContributionCount: total };
  }, [watchHistory]);

  const getClassForValue = (value: HeatmapValue | null): string => {
    if (!value || value.count === 0) return styles.colorEmpty;
    if (value.count >= 10) return styles.colorScale4;
    if (value.count >= 5) return styles.colorScale3;
    if (value.count >= 2) return styles.colorScale2;
    if (value.count >= 1) return styles.colorScale1;
    return styles.colorEmpty;
  };

  const getTooltipContent = (
    value: HeatmapValue | null
  ): Record<string, string> => {
    const val = value as HeatmapValue;
    if (!val?.date) {
      return {
        "data-tooltip-id": "heatmap-tooltip",
        "data-tooltip-content": "No episodes watched",
      };
    }
    const formattedDate = new Date(val.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return {
      "data-tooltip-id": "heatmap-tooltip",
      "data-tooltip-content": `Watched ${val.count} episodes on ${formattedDate}`,
    };
  };

  if (isLoading) {
    return <p className="text-center">Loading heatmap...</p>;
  }

  return (
    <>
      <p className="text-lg font-bold mb-4">
        Watched {totalContributionCount} episodes in the last year
      </p>
      <CalendarHeatmap
        weekdayLabels={["", "M", "", "W", "", "F", ""]}
        showWeekdayLabels={true}
        showOutOfRangeDays={true}
        startDate={startDate}
        endDate={endDate}
        classForValue={(value) =>
          getClassForValue(value as unknown as HeatmapValue)
        }
        values={heatmapData}
        gutterSize={2}
        tooltipDataAttrs={(value) => getTooltipContent(value as HeatmapValue)}
      />
      <Tooltip id="heatmap-tooltip" />
    </>
  );
}

export default AnimeHeatmap;
