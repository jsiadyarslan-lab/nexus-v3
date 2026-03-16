// app.js — إصلاح تحميل المكونات واللغة والـ chart

async function loadComponent(id, file) {
  try {
    const res = await fetch(`components/${file}`);
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (err) {
    console.error(err);
    document.getElementById(id).innerHTML = `<div style="color:#ff6fe0">Error loading ${file}</div>`;
  }
}

async function loadAllComponents() {
  // نحمّل المكونات بالتوازي ثم ننتظر اكتمالها
  await Promise.all([
    loadComponent("header", "header.html"),
    loadComponent("ticker", "ticker.html"),
    loadComponent("markets", "markets.html"),
    loadComponent("chart", "chart.html"),
    loadComponent("orders", "orders.html"),
    loadComponent("signals", "signals.html"),
    loadComponent("news", "news.html"),
    loadComponent("footer", "footer.html")
  ]);
}

let currentLang = localStorage.getItem("lang") || "ar";

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  try {
    const res = await fetch(`lang/${lang}.json`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Language file not found: lang/${lang}.json (${res.status})`);
    }

    // تأكد أن المحتوى JSON فعلاً
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Expected JSON but got:", text.slice(0, 200));
      throw new Error("Language file returned non-JSON content");
    }

    const dict = await res.json();

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = dict[key] || key;
    });
  } catch (err) {
    console.error("setLanguage error:", err);
  }
}

function initChartSafe() {
  const chartContainer = document.getElementById("tv-chart");
  if (!chartContainer) {
    console.warn("tv-chart container not found yet.");
    return;
  }

  if (typeof LightweightCharts === "undefined" || typeof LightweightCharts.createChart !== "function") {
    console.error("LightweightCharts library not available.");
    return;
  }

  try {
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

    // تحقق أن addCandlestickSeries موجودة
    if (typeof chart.addCandlestickSeries !== "function") {
      console.error("chart.addCandlestickSeries is not a function. Chart object:", chart);
      return;
    }

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
  } catch (err) {
    console.error("initChart error:", err);
  }
}

(async function bootstrap() {
  await loadAllComponents();

  // بعد تحميل المكونات، نضبط اللغة ثم نهيئ الشارت
  await setLanguage(currentLang);

  // جرّب تهيئة الشارت الآن؛ إن لم تنجح نعيد المحاولة بعد قليل
  initChartSafe();
  // إعادة محاولة خفيفة بعد 700ms للتأكد من أي تحميل متأخر
  setTimeout(initChartSafe, 700);
})();
