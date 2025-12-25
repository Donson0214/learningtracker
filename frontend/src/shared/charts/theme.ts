type ChartTheme = {
  text: string;
  grid: string;
};

const fallbackTheme: ChartTheme = {
  text: "#6B7280",
  grid: "#E5E7EB",
};

export const getChartTheme = (): ChartTheme => {
  if (typeof window === "undefined") {
    return fallbackTheme;
  }
  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue("--chart-text").trim();
  const grid = styles.getPropertyValue("--chart-grid").trim();

  return {
    text: text || fallbackTheme.text,
    grid: grid || fallbackTheme.grid,
  };
};
