"use client";

import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatAssistant } from "@/components/chat-assistant";
import { YearCalendar } from "@/components/year-calendar";
import { buildMonthGrids, getDatesForYear } from "@/lib/calendar";
import { getHolidayContext } from "@/lib/holidays";
import {
  getAlmanacAuspiciousAnalysis,
  getTemperaturePreferenceSets,
  type RecommendationMode,
  type ZodiacPreference,
} from "@/lib/wedding-score";
import { fromZodiacShareKey, toZodiacShareKey, ZODIAC_OPTIONS } from "@/lib/zodiac";

const CURRENT_YEAR = new Date().getFullYear();
const ANY_ZODIAC_OPTION = "不介意/其他" as const;
type ZodiacInputValue = (typeof ZODIAC_OPTIONS)[number] | typeof ANY_ZODIAC_OPTION;
type TemperatureMode = "range" | "any";

export default function Home() {
  const calendarExportRef = useRef<HTMLDivElement>(null);
  const [city, setCity] = useState("北京");
  const [groomZodiac, setGroomZodiac] = useState<ZodiacInputValue>(ZODIAC_OPTIONS[0]);
  const [brideZodiac, setBrideZodiac] = useState<ZodiacInputValue>(ZODIAC_OPTIONS[1]);
  const [minTemp, setMinTemp] = useState("16");
  const [maxTemp, setMaxTemp] = useState("24");
  const [temperatureMode, setTemperatureMode] = useState<TemperatureMode>("range");
  const [recommendationMode, setRecommendationMode] = useState<RecommendationMode>("lenient");
  const [yearInput, setYearInput] = useState<string>(String(CURRENT_YEAR));
  const [isDownloadingCalendar, setIsDownloadingCalendar] = useState(false);
  const [shareCopyStatus, setShareCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const cityFromQuery = queryParams.get("city");
    const groomFromQuery = queryParams.get("groom");
    const brideFromQuery = queryParams.get("bride");
    const yearFromQuery = queryParams.get("year");
    const minTempFromQuery = queryParams.get("tempMin");
    const maxTempFromQuery = queryParams.get("tempMax");
    const tempModeFromQuery = queryParams.get("tempMode");
    const recommendationModeFromQuery = queryParams.get("mode");

    if (cityFromQuery) {
      setCity(cityFromQuery);
    }

    if (yearFromQuery) {
      setYearInput(yearFromQuery);
    }

    if (minTempFromQuery) {
      setMinTemp(minTempFromQuery);
    }

    if (maxTempFromQuery) {
      setMaxTemp(maxTempFromQuery);
    }

    if (tempModeFromQuery === "any") {
      setTemperatureMode("any");
    }

    if (recommendationModeFromQuery === "strict" || recommendationModeFromQuery === "lenient") {
      setRecommendationMode(recommendationModeFromQuery);
    }

    if (groomFromQuery) {
      if (groomFromQuery === "any") {
        setGroomZodiac(ANY_ZODIAC_OPTION);
      } else {
        const groomAnimal = fromZodiacShareKey(groomFromQuery);
        if (groomAnimal) {
          setGroomZodiac(groomAnimal);
        }
      }
    }

    if (brideFromQuery) {
      if (brideFromQuery === "any") {
        setBrideZodiac(ANY_ZODIAC_OPTION);
      } else {
        const brideAnimal = fromZodiacShareKey(brideFromQuery);
        if (brideAnimal) {
          setBrideZodiac(brideAnimal);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (shareCopyStatus === "idle") {
      return;
    }

    const timer = window.setTimeout(() => setShareCopyStatus("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [shareCopyStatus]);

  const selectedYear = useMemo(() => {
    const parsed = Number(yearInput);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return CURRENT_YEAR;
    }

    return parsed;
  }, [yearInput]);

  const [normalizedMinTemp, normalizedMaxTemp] = useMemo(() => {
    const parsedMin = Number(minTemp);
    const parsedMax = Number(maxTemp);
    const safeMin = Number.isFinite(parsedMin) ? parsedMin : 0;
    const safeMax = Number.isFinite(parsedMax) ? parsedMax : 50;

    return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];
  }, [maxTemp, minTemp]);
  const ignoreTemperature = temperatureMode === "any";
  const groomPreference: ZodiacPreference = groomZodiac === ANY_ZODIAC_OPTION ? "ANY" : groomZodiac;
  const bridePreference: ZodiacPreference = brideZodiac === ANY_ZODIAC_OPTION ? "ANY" : brideZodiac;

  const holidayContext = useMemo(() => getHolidayContext(selectedYear), [selectedYear]);
  const holidayMap = holidayContext.holidayByDateISO;
  const blockedWeddingDateSet = holidayContext.blockedWeddingDateSet;
  const adjustedWorkdaySet = holidayContext.adjustedWorkdaySet;
  const { preferredTemperatureDateSet, outOfPreferredTemperatureDateSet } = useMemo(
    () =>
      getTemperaturePreferenceSets({
        year: selectedYear,
        minTemp: normalizedMinTemp,
        maxTemp: normalizedMaxTemp,
        ignoreTemperature,
      }),
    [ignoreTemperature, normalizedMaxTemp, normalizedMinTemp, selectedYear],
  );
  const {
    zodiacConflictDateSet,
    zodiacCompatibleDateSet,
    recommendedDateSet,
    rankedAuspiciousDates,
    dateScoreByISO,
    dateScoreDetailByISO,
    dateScoreReasonByISO,
    dateNoticeByISO,
    marriageTabooByISO,
    lunarDayTextByISO,
    leapMonth,
  } = useMemo(
    () =>
      getAlmanacAuspiciousAnalysis({
        year: selectedYear,
        groomZodiac: groomPreference,
        brideZodiac: bridePreference,
        holidayByDateISO: holidayMap,
        blockedWeddingDateSet,
        adjustedWorkdaySet,
        preferredTemperatureDateSet,
        ignoreTemperature,
        recommendationMode,
      }),
    [
      adjustedWorkdaySet,
      blockedWeddingDateSet,
      bridePreference,
      groomPreference,
      holidayMap,
      ignoreTemperature,
      preferredTemperatureDateSet,
      recommendationMode,
      selectedYear,
    ],
  );
  const relaxedZodiacAnalysis = useMemo(
    () =>
      getAlmanacAuspiciousAnalysis({
        year: selectedYear,
        groomZodiac: "ANY",
        brideZodiac: "ANY",
        holidayByDateISO: holidayMap,
        blockedWeddingDateSet,
        adjustedWorkdaySet,
        preferredTemperatureDateSet,
        ignoreTemperature,
        recommendationMode,
      }),
    [
      adjustedWorkdaySet,
      blockedWeddingDateSet,
      holidayMap,
      ignoreTemperature,
      preferredTemperatureDateSet,
      recommendationMode,
      selectedYear,
    ],
  );
  const strictModeAnalysis = useMemo(
    () =>
      getAlmanacAuspiciousAnalysis({
        year: selectedYear,
        groomZodiac: groomPreference,
        brideZodiac: bridePreference,
        holidayByDateISO: holidayMap,
        blockedWeddingDateSet,
        adjustedWorkdaySet,
        preferredTemperatureDateSet,
        ignoreTemperature,
        recommendationMode: "strict",
      }),
    [
      adjustedWorkdaySet,
      blockedWeddingDateSet,
      bridePreference,
      groomPreference,
      holidayMap,
      ignoreTemperature,
      preferredTemperatureDateSet,
      selectedYear,
    ],
  );
  const lenientModeAnalysis = useMemo(
    () =>
      getAlmanacAuspiciousAnalysis({
        year: selectedYear,
        groomZodiac: groomPreference,
        brideZodiac: bridePreference,
        holidayByDateISO: holidayMap,
        blockedWeddingDateSet,
        adjustedWorkdaySet,
        preferredTemperatureDateSet,
        ignoreTemperature,
        recommendationMode: "lenient",
      }),
    [
      adjustedWorkdaySet,
      blockedWeddingDateSet,
      bridePreference,
      groomPreference,
      holidayMap,
      ignoreTemperature,
      preferredTemperatureDateSet,
      selectedYear,
    ],
  );

  const months = useMemo(
    () =>
      buildMonthGrids(selectedYear, {
        holidayByDateISO: holidayMap,
        adjustedWorkdaySet,
        zodiacConflictDateSet,
        zodiacCompatibleDateSet,
        outOfPreferredTemperatureDateSet,
        recommendedDateSet,
        dateScoreByISO,
        dateScoreDetailByISO,
        dateScoreReasonByISO,
        dateNoticeByISO,
        marriageTabooByISO,
        lunarDayTextByISO,
      }),
    [
      dateScoreByISO,
      dateScoreDetailByISO,
      dateScoreReasonByISO,
      dateNoticeByISO,
      marriageTabooByISO,
      holidayMap,
      lunarDayTextByISO,
      outOfPreferredTemperatureDateSet,
      recommendedDateSet,
      selectedYear,
      adjustedWorkdaySet,
      zodiacCompatibleDateSet,
      zodiacConflictDateSet,
    ],
  );
  const totalDates = useMemo(() => getDatesForYear(selectedYear).length, [selectedYear]);

  const handleDownloadCalendar = async () => {
    if (!calendarExportRef.current || isDownloadingCalendar) {
      return;
    }

    try {
      setIsDownloadingCalendar(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const canvas = await html2canvas(calendarExportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        ignoreElements: (element) => {
          if (element instanceof HTMLElement) {
            return element.dataset.exportIgnore === "true";
          }
          return false;
        },
      });
      const imageUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");

      downloadLink.href = imageUrl;
      downloadLink.download = `婚礼吉日-${selectedYear}.png`;
      downloadLink.click();
    } finally {
      setIsDownloadingCalendar(false);
    }
  };

  const getShareUrl = () => {
    const queryParams = new URLSearchParams();
    const normalizedCity = city.trim().toLowerCase();

    if (normalizedCity) {
      queryParams.set("city", normalizedCity);
    }

    queryParams.set("groom", groomZodiac === ANY_ZODIAC_OPTION ? "any" : toZodiacShareKey(groomZodiac));
    queryParams.set("bride", brideZodiac === ANY_ZODIAC_OPTION ? "any" : toZodiacShareKey(brideZodiac));
    queryParams.set("year", String(selectedYear));
    queryParams.set("tempMode", temperatureMode);
    queryParams.set("mode", recommendationMode);

    if (!ignoreTemperature) {
      queryParams.set("tempMin", String(normalizedMinTemp));
      queryParams.set("tempMax", String(normalizedMaxTemp));
    }

    return `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;
  };

  const handleCopyShareLink = async () => {
    const shareUrl = getShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopyStatus("copied");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();

      const isCopied = document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareCopyStatus(isCopied ? "copied" : "failed");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-7 md:py-6 xl:px-9 xl:py-8">
        <header className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">婚礼择日助手</h1>
          <p className="mt-2 text-sm text-slate-600">
            左侧填写偏好条件，右侧会实时展示全年日历与推荐日期。
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[340px,minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:sticky md:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">择日偏好</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                自动刷新
              </span>
            </div>
            <form className="mt-4 space-y-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">城市</span>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="例如：北京"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">新郎生肖</span>
                <select
                  value={groomZodiac}
                  onChange={(event) => setGroomZodiac(event.target.value as ZodiacInputValue)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                >
                  <option value={ANY_ZODIAC_OPTION}>{ANY_ZODIAC_OPTION}</option>
                  {ZODIAC_OPTIONS.map((zodiac) => (
                    <option key={`groom-${zodiac}`} value={zodiac}>
                      {zodiac}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">新娘生肖</span>
                <select
                  value={brideZodiac}
                  onChange={(event) => setBrideZodiac(event.target.value as ZodiacInputValue)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                >
                  <option value={ANY_ZODIAC_OPTION}>{ANY_ZODIAC_OPTION}</option>
                  {ZODIAC_OPTIONS.map((zodiac) => (
                    <option key={`bride-${zodiac}`} value={zodiac}>
                      {zodiac}
                    </option>
                  ))}
                </select>
              </label>

              <div className="text-sm">
                <span className="font-medium text-slate-700">偏好温度范围（°C）</span>
                <label className="mt-1.5 flex flex-col gap-1">
                  <span className="text-xs text-slate-500">温度偏好模式</span>
                  <select
                    value={temperatureMode}
                    onChange={(event) => setTemperatureMode(event.target.value as TemperatureMode)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                  >
                    <option value="range">按范围筛选</option>
                    <option value="any">不介意/其他</option>
                  </select>
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">最低</span>
                    <input
                      type="number"
                      value={minTemp}
                      onChange={(event) => setMinTemp(event.target.value)}
                      placeholder="最低"
                      disabled={ignoreTemperature}
                      className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">最高</span>
                    <input
                      type="number"
                      value={maxTemp}
                      onChange={(event) => setMaxTemp(event.target.value)}
                      placeholder="最高"
                      disabled={ignoreTemperature}
                      className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </label>
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">婚礼年份</span>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={yearInput}
                  onChange={(event) => setYearInput(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">择日模式</span>
                <select
                  value={recommendationMode}
                  onChange={(event) => setRecommendationMode(event.target.value as RecommendationMode)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-200 transition focus:ring-2"
                >
                  <option value="lenient">宽松模式（可化解项可入选）</option>
                  <option value="strict">严格模式（传统硬规则）</option>
                </select>
              </label>
            </form>

            <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">摘要：</span> {city || "未填写城市"} •{" "}
                {groomZodiac} &amp; {brideZodiac}
              </p>
              <p className="mt-1">
                {selectedYear} 年共 {totalDates} 天 •{" "}
                {ignoreTemperature ? "温度：不介意/其他" : `偏好 ${normalizedMinTemp}°C ~ ${normalizedMaxTemp}°C`}
              </p>
              <p className="mt-1">
                当前模式：
                <span className="font-semibold text-slate-700">
                  {recommendationMode === "strict" ? " 严格模式" : " 宽松模式"}
                </span>
              </p>
              <p className="mt-1">
                生肖冲突日期：<span className="font-semibold text-slate-700">{zodiacConflictDateSet.size}</span>
              </p>
              <p className="mt-1">
                温度不匹配日期：
                <span className="font-semibold text-slate-700">{outOfPreferredTemperatureDateSet.size}</span>
              </p>
              <p className="mt-1">
                推荐日期：<span className="font-semibold text-pink-700">{recommendedDateSet.size}</span>
              </p>
              <p className="mt-1">
                黄历吉日候选：<span className="font-semibold text-emerald-700">{rankedAuspiciousDates.length}</span>
              </p>
              <p className="mt-1">
                节假日/传统节日（禁选）：<span className="font-semibold text-amber-700">{blockedWeddingDateSet.size}</span>
              </p>
              <p className="mt-1">
                调休工作日：<span className="font-semibold text-orange-700">{adjustedWorkdaySet.size}</span>
              </p>
              {selectedYear === 2026 && (
                <p className="mt-1 text-slate-500">
                  农历年校验：按丙午年计算{leapMonth > 0 ? `（含闰${Math.abs(leapMonth)}月规则）` : "（2026 无闰月）"}
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
              <h3 className="text-sm font-semibold text-slate-800">黄历优选日期（按吉利度排序）</h3>
              <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1 text-xs text-slate-700">
                {rankedAuspiciousDates.slice(0, 10).map((item, index) => (
                  <li key={item.dateISO} className="rounded-lg bg-slate-50 p-2">
                    <p className="font-semibold text-slate-900">
                      #{index + 1} {item.dateISO}（{item.lunarText}） · {item.score}分
                    </p>
                    <p className="mt-1 text-slate-600">{item.reason}</p>
                    <p className="mt-1 text-slate-500">{dateScoreDetailByISO[item.dateISO]}</p>
                  </li>
                ))}
                {rankedAuspiciousDates.length === 0 && (
                  <li className="rounded-lg bg-slate-50 p-2 text-slate-500">
                    当前条件下暂无满足黄历规则的吉日，请调整年份或温度范围后重试。
                  </li>
                )}
              </ul>
            </div>

          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">日历视图</h3>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500">
                  城市、生肖、年份或温度范围变更后会自动刷新。
                </p>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Copy Share Link
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  disabled={isDownloadingCalendar}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloadingCalendar ? "正在生成 PNG..." : "下载婚礼日历"}
                </button>
              </div>
            </div>
            {shareCopyStatus === "copied" && (
              <p className="mb-3 text-xs text-emerald-700">分享链接已复制到剪贴板。</p>
            )}
            {shareCopyStatus === "failed" && (
              <p className="mb-3 text-xs text-rose-600">复制失败，请手动复制浏览器地址栏链接。</p>
            )}
            <div ref={calendarExportRef} className="rounded-xl bg-white p-4">
              <h2 className="text-center text-2xl font-bold text-slate-900">婚礼吉日</h2>
              <p className="mt-1 text-center text-sm text-slate-600">{selectedYear} 年日历</p>
              <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                <p>
                  <span className="font-semibold">城市：</span>
                  {city || "未填写"}
                </p>
                <p>
                  <span className="font-semibold">新人生肖：</span>
                  {groomZodiac} / {brideZodiac}
                </p>
                <p>
                  <span className="font-semibold">择日模式：</span>
                  {recommendationMode === "strict" ? "严格模式" : "宽松模式"}
                </p>
                <p>
                  <span className="font-semibold">温度偏好：</span>
                  {ignoreTemperature ? "不介意/其他" : `${normalizedMinTemp}°C ~ ${normalizedMaxTemp}°C`}
                </p>
                <p>
                  <span className="font-semibold">推荐日期数：</span>
                  {recommendedDateSet.size}
                </p>
                <p>
                  <span className="font-semibold">节假日禁选：</span>
                  {blockedWeddingDateSet.size}
                </p>
              </div>
              <div className="mt-4">
                <YearCalendar year={selectedYear} months={months} recommendationMode={recommendationMode} />
              </div>
            </div>
          </section>
        </div>
      </div>
      <ChatAssistant
        hidden={isDownloadingCalendar}
        city={city}
        year={selectedYear}
        recommendationMode={recommendationMode}
        temperatureDescription={ignoreTemperature ? "不介意/其他" : `${normalizedMinTemp}°C ~ ${normalizedMaxTemp}°C`}
        rankedAuspiciousDates={rankedAuspiciousDates}
        dateScoreDetailByISO={dateScoreDetailByISO}
        dateNoticeByISO={dateNoticeByISO}
        relaxedZodiacTopDates={relaxedZodiacAnalysis.rankedAuspiciousDates}
        relaxedZodiacCount={relaxedZodiacAnalysis.rankedAuspiciousDates.length}
        strictModeCount={strictModeAnalysis.rankedAuspiciousDates.length}
        lenientModeCount={lenientModeAnalysis.rankedAuspiciousDates.length}
      />
    </main>
  );
}
