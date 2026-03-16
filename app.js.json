// ---------------------------
// Load Components
// ---------------------------
async function loadComponent(id, file) {
  const html = await fetch(`components/${file}`).then(r => r.text());
  document.getElementById(id).innerHTML = html;
}

// Load all components
loadComponent("header", "header.html");
loadComponent("ticker", "ticker.html");
loadComponent("markets", "markets.html");
loadComponent("chart", "chart.html");
loadComponent("orders", "orders.html");
loadComponent("signals", "signals.html");
loadComponent("news", "news.html");
loadComponent("footer", "footer.html");

// ---------------------------
// Language System (B3)
// ---------------------------
let currentLang = localStorage.getItem("lang") || "ar";

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  const dict = await fetch(`lang/${lang}.json`).then(r => r.json());

  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = dict[key] || key;
  });
}

// Apply language after components load
setTimeout(() => setLanguage(currentLang), 300);

// ---------------------------
// TradingView Chart
// ---------------------------
function initChart() {
  const chartContainer = document.getElementById("tv-chart");

  if (!chartContainer) return;

  const chart = LightweightCharts.createChart(chartContainer, {
    layout: {
      background: { color: "#0a0014" },
      textColor: "#e0d0ff"
    },
    grid: {
      vertLines: { color: "rgba(255,0,255,0.05)" },
      horzLines: { color: "rgba(255,0,255,0.05)" }
    },
    width: chartContainer.clientWidth,
    height: 320
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: "#ff4df0",
    downColor: "#7a00ff",
    borderUpColor: "#ff4df0",
    borderDownColor: "#7a00ff",
    wickUpColor: "#ff4df0",
    wickDownColor: "#7a00ff"
  });

  candleSeries.setData([
    { time: "2024-01-01", open: 1.08, high: 1.10, low: 1.07, close: 1.09 },
    { time: "2024-01-02", open: 1.09, high: 1.11, low: 1.08, close: 1.10 },
    { time: "2024-01-03", open: 1.10, high: 1.12, low: 1.09, close: 1.11 }
  ]);
}

setTimeout(initChart, 500);
