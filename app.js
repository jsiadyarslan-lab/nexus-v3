// app.js — تحميل المكونات، إدارة اللغة، وتهيئة الشارت بأمان

// تحميل مكوّن HTML ووضعه في العنصر المحدد
async function loadComponent(id, file) {
  try {
    const res = await fetch(`components/${file}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
    const html = await res.text();
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  } catch (err) {
    console.error(err);
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="color:#ff6fe0">خطأ في تحميل ${file}</div>`;
  }
}

async function loadAllComponents() {
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

// إدارة اللغة مع فحص استجابة الخادم قبل تحويلها إلى JSON
let currentLang = localStorage.getItem("lang") || "ar";

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  try {
    const res = await fetch(`lang/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Language file not found: lang/${lang}.json (${res.status})`);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Expected JSON but got:", text.slice(0, 300));
      throw new Error("Language file returned non-JSON content");
    }

    const dict = await res.json();

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = dict[key] ?? el.textContent;
    });
  } catch (err) {
    console.error("setLanguage error:", err);
  }
}

// تهيئة الشارت مع فحوصات سلامة المكتبة والعنصر
function initChartSafe() {
  const chartContainer = document.getElementById("tv-chart");
  if (!chartContainer) {
    console.warn("tv-chart container not found yet.");
    return;
  }

  if (typeof LightweightCharts === "undefined" || typeof LightweightCharts.createChart !== "function") {
    console.error("LightweightCharts library not available or invalid.");
    return;
  }

  try {
    // تهيئة الرسم
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
      height: 360,
      rightPriceScale: { visible: true },
      timeScale: { timeVisible: true, secondsVisible: false }
    });

    if (typeof chart.addCandlestickSeries !== "function") {
      console.error("chart.addCandlestickSeries is not a function. Chart object:", chart);
      return;
    }

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00ff9f",
      downColor: "#ff4d9e",
      borderVisible: true,
      wickVisible: true
    });

    // بيانات تجريبية أولية لتأكيد العرض
    candleSeries.setData([
      { time: "2026-03-10", open: 1.08, high: 1.10, low: 1.07, close: 1.09 },
      { time: "2026-03-11", open: 1.09, high: 1.11, low: 1.08, close: 1.10 },
      { time: "2026-03-12", open: 1.10, high: 1.12, low: 1.09, close: 1.11 }
    ]);

    // إعادة ضبط حجم الشارت عند تغيير حجم النافذة
    window.addEventListener("resize", () => {
      try {
        chart.applyOptions({ width: chartContainer.clientWidth });
      } catch (e) {
        console.warn("Chart resize error:", e);
      }
    });
  } catch (err) {
    console.error("initChart error:", err);
  }
}

// دالة مساعدة للتحقق من تحميل مكتبة LightweightCharts قبل الاستخدام
function ensureLightweightChartsLoaded(timeout = 3000) {
  return new Promise(resolve => {
    if (typeof LightweightCharts !== "undefined" && typeof LightweightCharts.createChart === "function") {
      resolve(true);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof LightweightCharts !== "undefined" && typeof LightweightCharts.createChart === "function") {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        resolve(false);
      }
    }, 150);
  });
}

// نقطة الانطلاق: تحميل المكونات، ضبط اللغة، ثم تهيئة الشارت بأمان
(async function bootstrap() {
  await loadAllComponents();

  // ربط أزرار تبديل اللغة إن وُجدت
  document.addEventListener("click", (e) => {
    const btn = e.target;
    if (btn && btn.getAttribute && btn.getAttribute("data-set-lang")) {
      setLanguage(btn.getAttribute("data-set-lang"));
    }
  });

  await setLanguage(currentLang);

  // تأكد من تحميل مكتبة الشارت ثم حاول تهيئتها
  const loaded = await ensureLightweightChartsLoaded(4000);
  if (!loaded) {
    console.error("LightweightCharts failed to load within timeout. Check network or script order.");
  }

  initChartSafe();
  // محاولة ثانية بعد تأخير بسيط للتعامل مع أي تحميل متأخر
  setTimeout(initChartSafe, 700);
})();
