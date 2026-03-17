"use client";

import { useMemo, useState } from "react";
import type { RankedAuspiciousDate, RecommendationMode } from "@/lib/wedding-score";

type ChatAssistantProps = {
  hidden?: boolean;
  city: string;
  year: number;
  recommendationMode: RecommendationMode;
  temperatureDescription: string;
  rankedAuspiciousDates: RankedAuspiciousDate[];
  dateScoreDetailByISO: Record<string, string>;
  dateNoticeByISO: Record<string, string>;
  relaxedZodiacTopDates: RankedAuspiciousDate[];
  relaxedZodiacCount: number;
  strictModeCount: number;
  lenientModeCount: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "为什么 2026-09-05 扣分？",
  "9月有哪些推荐日期？",
  "如果不在意冲生肖，推荐会怎么变？",
  "严格模式和宽松模式差异是什么？",
] as const;

function isValidMonthDay(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function extractDateFromQuestion(question: string, defaultYear: number): string | null {
  const fullDateMatch = question.match(/(\d{4})[-年/.](\d{1,2})[-月/.](\d{1,2})/);
  if (fullDateMatch) {
    const parsedYear = Number(fullDateMatch[1]);
    const parsedMonth = Number(fullDateMatch[2]);
    const parsedDay = Number(fullDateMatch[3]);

    if (isValidMonthDay(parsedYear, parsedMonth, parsedDay)) {
      return `${parsedYear}-${String(parsedMonth).padStart(2, "0")}-${String(parsedDay).padStart(2, "0")}`;
    }
  }

  const monthDayMatch = question.match(/(\d{1,2})\s*[月/-]\s*(\d{1,2})\s*[日号]?/);
  if (monthDayMatch) {
    const parsedMonth = Number(monthDayMatch[1]);
    const parsedDay = Number(monthDayMatch[2]);
    if (isValidMonthDay(defaultYear, parsedMonth, parsedDay)) {
      return `${defaultYear}-${String(parsedMonth).padStart(2, "0")}-${String(parsedDay).padStart(2, "0")}`;
    }
  }

  return null;
}

function parseRequestedCount(question: string, fallback = 3): number {
  const countWithUnitMatch = question.match(/(\d{1,2})\s*(个|条|天|日)/);
  if (countWithUnitMatch) {
    const parsed = Number(countWithUnitMatch[1]);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(parsed, 10));
    }
  }

  const topMatch = question.match(/(?:top|前|给我|推荐)\s*(\d{1,2})/i);
  if (topMatch) {
    const parsed = Number(topMatch[1]);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(parsed, 10));
    }
  }

  return fallback;
}

function parseMonth(question: string): number | null {
  const monthMatch = question.match(/(\d{1,2})\s*月/);
  if (!monthMatch) {
    return null;
  }
  const parsed = Number(monthMatch[1]);
  if (parsed < 1 || parsed > 12) {
    return null;
  }
  return parsed;
}

function formatTopDates(dates: RankedAuspiciousDate[], maxCount = 3): string {
  const topDates = dates.slice(0, maxCount);
  if (topDates.length === 0) {
    return "当前没有可推荐日期。";
  }

  return topDates
    .map((item, index) => `#${index + 1} ${item.dateISO}（${item.lunarText}，${item.score}分）`)
    .join("\n");
}

export function ChatAssistant({
  hidden = false,
  city,
  year,
  recommendationMode,
  temperatureDescription,
  rankedAuspiciousDates,
  dateScoreDetailByISO,
  dateNoticeByISO,
  relaxedZodiacTopDates,
  relaxedZodiacCount,
  strictModeCount,
  lenientModeCount,
}: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "你好，我是择日助手（Beta）。你可以问我某天为什么扣分、怎么化解，或让系统解释不同筛选条件下的变化。",
    },
  ]);

  const currentCount = rankedAuspiciousDates.length;
  const rankedDateSet = useMemo(
    () => new Set(rankedAuspiciousDates.map((item) => item.dateISO)),
    [rankedAuspiciousDates],
  );
  const topThreeText = useMemo(() => formatTopDates(rankedAuspiciousDates, 3), [rankedAuspiciousDates]);

  const buildReply = (question: string) => {
    const normalizedQuestion = question.trim();
    const dateFromQuestion = extractDateFromQuestion(normalizedQuestion, year);
    const askedCount = parseRequestedCount(normalizedQuestion, 3);
    const month = parseMonth(normalizedQuestion);

    if (dateFromQuestion && dateScoreDetailByISO[dateFromQuestion]) {
      const isRecommended = rankedDateSet.has(dateFromQuestion);
      return [
        `${dateFromQuestion} 的判定说明：`,
        `是否进入推荐：${isRecommended ? "是（已在候选列表）" : "否（当前未入选）"}`,
        `得分理由：${dateScoreDetailByISO[dateFromQuestion]}`,
        `注意事项：${dateNoticeByISO[dateFromQuestion] ?? "暂无额外注意事项"}`,
      ].join("\n");
    }

    if (
      normalizedQuestion.includes("严格") &&
      normalizedQuestion.includes("宽松") &&
      (normalizedQuestion.includes("区别") || normalizedQuestion.includes("差异") || normalizedQuestion.includes("对比"))
    ) {
      const delta = lenientModeCount - strictModeCount;
      return [
        `同一筛选条件下：严格模式 ${strictModeCount} 个推荐，宽松模式 ${lenientModeCount} 个推荐。`,
        `两者相差 ${delta >= 0 ? "+" : ""}${delta} 个日期。`,
        "建议：先用宽松模式找范围，再切严格模式做最终定档。",
      ].join("\n");
    }

    if (month && (normalizedQuestion.includes("推荐") || normalizedQuestion.includes("吉日") || normalizedQuestion.includes("候选"))) {
      const monthDates = rankedAuspiciousDates
        .filter((item) => Number(item.dateISO.slice(5, 7)) === month)
        .slice(0, askedCount);
      if (monthDates.length === 0) {
        return `${year} 年 ${month} 月在当前条件下暂无推荐日期，可尝试切换宽松模式或放宽温度范围。`;
      }

      return [`${year} 年 ${month} 月推荐（Top${monthDates.length}）：`, formatTopDates(monthDates, monthDates.length)].join(
        "\n",
      );
    }

    if (
      normalizedQuestion.includes("不在意") &&
      (normalizedQuestion.includes("生肖") || normalizedQuestion.includes("冲"))
    ) {
      const delta = relaxedZodiacCount - currentCount;
      return [
        `当前模式（${recommendationMode === "strict" ? "严格" : "宽松"}）下共 ${currentCount} 个推荐日期。`,
        `如果新郎/新娘生肖都设为“不介意/其他”，推荐日期约为 ${relaxedZodiacCount} 个（变化 ${delta >= 0 ? "+" : ""}${delta}）。`,
        "不介意生肖后的 Top3：",
        formatTopDates(relaxedZodiacTopDates, 3),
      ].join("\n");
    }

    if (normalizedQuestion.includes("规则") || normalizedQuestion.includes("依据") || normalizedQuestion.includes("怎么算")) {
      return [
        "当前评分会综合这些因素：",
        "1) 黄历：黄道日/建除十二神、宜忌（嫁娶）、杨公忌、四离四绝等；",
        "2) 现实约束：节假日禁选、周末/调休影响；",
        "3) 个性偏好：生肖冲克、温度范围、严格/宽松模式。",
        "你也可以继续追问某一个日期，我会给出明细。",
      ].join("\n");
    }

    if (normalizedQuestion.includes("温度")) {
      return `当前温度筛选：${temperatureDescription}。如果你希望优先“日期吉利”而非气温，可改为“不介意/其他”。`;
    }

    if (normalizedQuestion.includes("化解") || normalizedQuestion.includes("规避")) {
      return [
        "可优先考虑以下化解方式：",
        "1) 避开相冲时辰，核心仪式放在当日吉时（如巳时/午时）。",
        "2) 若是工作日或调休日，提前一晚完成迎亲关键流程，降低赶场风险。",
        "3) 对有冲项但整体高分的日期，可保留日子不变，优化流程顺序与宾客动线。",
      ].join("\n");
    }

    if (
      normalizedQuestion.includes("推荐") ||
      normalizedQuestion.includes("吉日") ||
      normalizedQuestion.includes("top") ||
      normalizedQuestion.includes("前")
    ) {
      return [
        `当前城市：${city || "未填写"}，年份：${year}，模式：${recommendationMode === "strict" ? "严格" : "宽松"}。`,
        `当前 Top${askedCount} 推荐：`,
        formatTopDates(rankedAuspiciousDates, askedCount),
      ].join("\n");
    }

    return [
      "我可以支持模板外问题，但目前是规则引擎，不是大模型自由对话。",
      "你可以试试这些问法：",
      "• 9月有哪些推荐日期？",
      "• 为什么 9月21日 不推荐？",
      "• 给我前5个高分日期",
      "• 严格模式和宽松模式差异是什么？",
      "当前 Top3：",
      topThreeText,
    ].join("\n");
  };

  const sendQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    const reply = buildReply(trimmed);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: reply }]);
    setInput("");
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50" data-export-ignore="true">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700"
        >
          智能问问（Beta）
        </button>
      )}

      {isOpen && (
        <div className="w-[min(92vw,390px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">智能问问（Beta）</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
            >
              关闭
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendQuestion(question)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {question}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  message.role === "assistant"
                    ? "bg-white text-slate-700"
                    : "ml-6 bg-slate-900 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如：9月有哪些推荐？为什么9月21日不推荐？"
              rows={2}
              className="min-h-[56px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              onClick={() => sendQuestion(input)}
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
