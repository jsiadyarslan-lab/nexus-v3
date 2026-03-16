function initChartSafe() {
  const container = document.getElementById("tv-chart");
  if (!container) { console.error("tv-chart not found"); return; }

  if (typeof LightweightCharts === "undefined" || typeof LightweightCharts.createChart !== "function") {
    console.error("LightweightCharts not available or wrong build");
    return;
  }

  // استخدم اسم محلي لتجنب أي تصادم مع متغيرات عالمية
  const chartInstance = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 360,
    layout: { background: { color: "#0a0014" }, textColor: "#e0d0ff" }
  });

  console.log("chartInstance:", chartInstance);

  if (typeof chartInstance.addCandlestickSeries !== "function") {
    console.error("addCandlestickSeries missing on chartInstance", chartInstance);
    return;
  }

  const series = chartInstance.addCandlestickSeries({
    upColor: "#00ff9f",
    downColor: "#ff4d9e",
    borderVisible: true,
    wickVisible: true
  });

  series.setData([
    { time: "2026-03-10", open: 1.08, high: 1.10, low: 1.07, close: 1.09 }
  ]);

  window.addEventListener("resize", () => {
    try { chartInstance.applyOptions({ width: container.clientWidth }); }
    catch (e) { console.warn("Chart resize error:", e); }
  });
}
