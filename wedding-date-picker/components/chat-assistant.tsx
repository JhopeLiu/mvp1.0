"use client";

import { useMemo, useState } from "react";
import type { RankedAuspiciousDate, RecommendationMode } from "@/lib/wedding-score";

type ChatAssistantProps = {
  city: string;
  year: number;
  recommendationMode: RecommendationMode;
  rankedAuspiciousDates: RankedAuspiciousDate[];
  dateScoreDetailByISO: Record<string, string>;
  dateNoticeByISO: Record<string, string>;
  relaxedZodiacTopDates: RankedAuspiciousDate[];
  relaxedZodiacCount: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "为什么 2026-09-05 扣分？",
  "如果不在意冲生肖，推荐会怎么变？",
  "给我 3 条化解建议",
] as const;

function extractDateFromQuestion(question: string): string | null {
  const match = question.match(/(\d{4})[-年/.](\d{1,2})[-月/.](\d{1,2})/);
  if (!match) {
    return null;
  }

  const year = match[1];
  const month = match[2].padStart(2, "0");
  const day = match[3].padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  city,
  year,
  recommendationMode,
  rankedAuspiciousDates,
  dateScoreDetailByISO,
  dateNoticeByISO,
  relaxedZodiacTopDates,
  relaxedZodiacCount,
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
  const topThreeText = useMemo(() => formatTopDates(rankedAuspiciousDates, 3), [rankedAuspiciousDates]);

  const buildReply = (question: string) => {
    const normalizedQuestion = question.trim();
    const dateFromQuestion = extractDateFromQuestion(normalizedQuestion);

    if (dateFromQuestion && dateScoreDetailByISO[dateFromQuestion]) {
      return [
        `${dateFromQuestion} 的判定说明：`,
        `得分理由：${dateScoreDetailByISO[dateFromQuestion]}`,
        `注意事项：${dateNoticeByISO[dateFromQuestion] ?? "暂无额外注意事项"}`,
      ].join("\n");
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

    if (normalizedQuestion.includes("化解") || normalizedQuestion.includes("规避")) {
      return [
        "可优先考虑以下化解方式：",
        "1) 避开相冲时辰，核心仪式放在当日吉时（如巳时/午时）。",
        "2) 若是工作日或调休日，提前一晚完成迎亲关键流程，降低赶场风险。",
        "3) 对有冲项但整体高分的日期，可保留日子不变，优化流程顺序与宾客动线。",
      ].join("\n");
    }

    if (normalizedQuestion.includes("推荐") || normalizedQuestion.includes("吉日")) {
      return [`当前城市：${city || "未填写"}，年份：${year}。`, "当前 Top3 推荐：", topThreeText].join("\n");
    }

    return "我已收到你的问题。你可以直接问“为什么 2026-09-05 扣分？”或“如果不在意冲生肖会怎样？”。";
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

  return (
    <div className="fixed bottom-5 right-5 z-50">
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
              placeholder="例如：为什么 2026-09-21 不推荐？"
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
