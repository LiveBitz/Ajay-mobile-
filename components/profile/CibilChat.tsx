"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard,
  MessageCircle,
  ChevronRight,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";

/* ── Types ── */
interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
}

interface Option {
  label: string;
  value: string;
}

interface Step {
  key: string;
  question: string;
  options: Option[];
}

/* ── Questions flow ── */
const STEPS: Step[] = [
  {
    key: "age",
    question: "Let's start! What is your age group?",
    options: [
      { label: "18 – 25 years", value: "18-25" },
      { label: "26 – 35 years", value: "26-35" },
      { label: "36 – 50 years", value: "36-50" },
      { label: "51+ years", value: "51+" },
    ],
  },
  {
    key: "employment",
    question: "What is your current employment status?",
    options: [
      { label: "Salaried (Private / Govt)", value: "salaried" },
      { label: "Self-Employed / Freelancer", value: "self_employed" },
      { label: "Business Owner", value: "business" },
      { label: "Student", value: "student" },
      { label: "Currently Unemployed", value: "unemployed" },
    ],
  },
  {
    key: "income",
    question: "What is your approximate monthly income?",
    options: [
      { label: "Below ₹20,000", value: "below_20k" },
      { label: "₹20,000 – ₹40,000", value: "20k_40k" },
      { label: "₹40,000 – ₹80,000", value: "40k_80k" },
      { label: "Above ₹80,000", value: "above_80k" },
      { label: "No income (Student / Unemployed)", value: "no_income" },
    ],
  },
  {
    key: "emi",
    question: "Do you currently have any active loans or EMIs?",
    options: [
      { label: "No, I am debt-free", value: "none" },
      { label: "Yes — EMIs under 20% of income", value: "low" },
      { label: "Yes — EMIs 20–40% of income", value: "medium" },
      { label: "Yes — EMIs above 40% of income", value: "high" },
    ],
  },
  {
    key: "card_history",
    question: "Have you ever used a credit card before?",
    options: [
      { label: "No, never had one", value: "never" },
      { label: "Yes — always paid on time", value: "on_time" },
      { label: "Yes — occasional delays (1–2 times)", value: "occasional" },
      { label: "Yes — frequently missed payments", value: "frequent" },
      { label: "Yes — defaulted or settled", value: "defaulted" },
    ],
  },
  {
    key: "credit_age",
    question: "How long have you had any credit history?",
    options: [
      { label: "No credit history at all", value: "none" },
      { label: "Less than 1 year", value: "lt_1yr" },
      { label: "1 – 3 years", value: "1_3yr" },
      { label: "3 – 5 years", value: "3_5yr" },
      { label: "More than 5 years", value: "gt_5yr" },
    ],
  },
  {
    key: "inquiries",
    question: "How many times did you apply for a loan or card in the last 6 months?",
    options: [
      { label: "None", value: "none" },
      { label: "1 – 2 times", value: "1_2" },
      { label: "3 or more times", value: "3_plus" },
    ],
  },
];

/* ── Score calculator ── */
function calculateScore(answers: Record<string, string>): number {
  let score = 600;
  if (answers.age === "18-25") score -= 20;
  else if (answers.age === "26-35") score += 30;
  else if (answers.age === "36-50") score += 40;
  else if (answers.age === "51+") score += 20;

  if (answers.employment === "salaried") score += 40;
  else if (answers.employment === "business") score += 30;
  else if (answers.employment === "self_employed") score += 20;
  else if (answers.employment === "student") score -= 40;
  else if (answers.employment === "unemployed") score -= 60;

  if (answers.income === "above_80k") score += 50;
  else if (answers.income === "40k_80k") score += 30;
  else if (answers.income === "20k_40k") score += 10;
  else if (answers.income === "below_20k") score -= 30;
  else if (answers.income === "no_income") score -= 50;

  if (answers.emi === "none") score += 20;
  else if (answers.emi === "low") score += 10;
  else if (answers.emi === "high") score -= 60;

  if (answers.card_history === "on_time") score += 80;
  else if (answers.card_history === "occasional") score += 20;
  else if (answers.card_history === "frequent") score -= 50;
  else if (answers.card_history === "defaulted") score -= 120;

  if (answers.credit_age === "gt_5yr") score += 60;
  else if (answers.credit_age === "3_5yr") score += 40;
  else if (answers.credit_age === "1_3yr") score += 20;
  else if (answers.credit_age === "none") score -= 20;

  if (answers.inquiries === "1_2") score -= 20;
  else if (answers.inquiries === "3_plus") score -= 50;

  return Math.max(300, Math.min(900, score));
}

function getScoreInfo(score: number) {
  if (score >= 800) return { label: "Excellent", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", ring: "rgba(16,185,129,0.2)" };
  if (score >= 750) return { label: "Very Good", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", ring: "rgba(59,130,246,0.2)" };
  if (score >= 650) return { label: "Good", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", ring: "rgba(245,158,11,0.2)" };
  if (score >= 550) return { label: "Fair", color: "#f97316", bg: "#fff7ed", border: "#fed7aa", ring: "rgba(249,115,22,0.2)" };
  return { label: "Poor", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", ring: "rgba(239,68,68,0.2)" };
}

function getCardEligibility(score: number) {
  if (score >= 800) return {
    eligible: true,
    cards: ["HDFC Infinia", "Axis Magnus", "SBI Aurum", "ICICI Emeralde"],
    tip: "You qualify for super-premium cards with high limits, lounge access, and premium rewards.",
  };
  if (score >= 750) return {
    eligible: true,
    cards: ["HDFC Regalia", "ICICI Sapphiro", "Axis Ace", "SBI SimplyCLICK"],
    tip: "You qualify for premium cards with strong rewards, cashback, and travel perks.",
  };
  if (score >= 650) return {
    eligible: true,
    cards: ["SBI SimplySAVE", "HDFC MoneyBack", "ICICI Platinum", "Kotak 811"],
    tip: "You qualify for standard credit cards. Start with a low-limit card and grow your score.",
  };
  if (score >= 550) return {
    eligible: true,
    cards: ["Secured card (FD-backed)", "SBI Unnati", "Kotak Aqua"],
    tip: "You may get secured or entry-level cards. An FD-backed card is the safest path right now.",
  };
  return {
    eligible: false,
    cards: [] as string[],
    tip: "You are not eligible for a credit card right now. Focus on building credit history and reducing existing debts.",
  };
}

function getRecommendations(answers: Record<string, string>, score: number): string[] {
  const tips: string[] = [];
  if (answers.card_history === "defaulted" || answers.card_history === "frequent")
    tips.push("Clear outstanding dues and maintain a clean repayment record for at least 6 months.");
  if (answers.emi === "high")
    tips.push("Reduce your EMI-to-income ratio below 30% before applying for a new credit product.");
  if (answers.credit_age === "none" || answers.credit_age === "lt_1yr")
    tips.push("Start with a small personal loan or secured credit card to begin building your history.");
  if (answers.inquiries === "3_plus")
    tips.push("Avoid applying for multiple credit products in a short window — each inquiry lowers your score.");
  if (answers.income === "no_income" || answers.income === "below_20k")
    tips.push("A co-applicant with stable income can significantly improve your eligibility.");
  if (score >= 650 && score < 750)
    tips.push("Pay bills on time every month — even one missed payment can drop your score by 50–100 points.");
  if (score >= 750)
    tips.push("Keep credit utilisation below 30% of your total limit to maintain your excellent score.");
  if (tips.length === 0)
    tips.push("Keep up the excellent habits — timely payments and low debt are the foundation of a great score.");
  return tips;
}

/* ── Component ── */
export function CibilChat() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [typing, setTyping] = useState(false);
  const [optionsKey, setOptionsKey] = useState(0); // force re-render of options after step change

  // Scroll only inside the messages container, never the page
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, done, scrollToBottom]);

  const addBotMessage = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, from: "bot", text },
      ]);
      resolve();
    });
  }, []);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function startChat() {
    setStarted(true);
    setTyping(true);
    await sleep(400);
    await addBotMessage("👋 Hi! I'm your CIBIL Score Assistant.");
    await sleep(600);
    await addBotMessage("I'll ask you 7 quick questions to estimate your score and check your credit card eligibility.");
    await sleep(700);
    setTyping(false);
    await sleep(100);
    await addBotMessage(STEPS[0].question);
  }

  async function handleOption(option: Option) {
    const step = STEPS[currentStep];
    const newAnswers = { ...answers, [step.key]: option.value };
    setAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: "user", text: option.label },
    ]);

    const nextStep = currentStep + 1;

    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep);
      setTyping(true);
      await sleep(650);
      setTyping(false);
      await addBotMessage(STEPS[nextStep].question);
      setOptionsKey((k) => k + 1); // re-render options panel
    } else {
      setTyping(true);
      await sleep(700);
      await addBotMessage("Perfect! I have all the information I need. Calculating your score...");
      await sleep(1300);
      setTyping(false);
      const finalScore = calculateScore(newAnswers);
      setScore(finalScore);
      setDone(true);
    }
  }

  function reset() {
    setStarted(false);
    setMessages([]);
    setCurrentStep(0);
    setAnswers({});
    setDone(false);
    setScore(0);
    setTyping(false);
    setOptionsKey(0);
  }

  const scoreInfo = done ? getScoreInfo(score) : null;
  const eligibility = done ? getCardEligibility(score) : null;
  const recommendations = done ? getRecommendations(answers, score) : null;
  const pct = done ? ((score - 300) / 600) * 100 : 0;
  const progress = `${currentStep} / ${STEPS.length}`;

  return (
    <div className="cb-root">

      {/* ── Header ── */}
      <div className="cb-header">
        <div className="cb-header-left">
          <div className="cb-header-icon">
            <CreditCard className="cb-h-icon" />
          </div>
          <div>
            <h3 className="cb-title">CIBIL Score Checker</h3>
            <p className="cb-subtitle">Credit score &amp; card eligibility — instant &amp; free</p>
          </div>
        </div>
        {started && !done && (
          <div className="cb-progress-pill">{progress} answered</div>
        )}
        {started && (
          <button className="cb-reset-btn" onClick={reset} title="Start over">
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* ── Landing screen ── */}
      {!started && (
        <div className="cb-landing">
          <div className="cb-landing-pills">
            <span className="cb-lpill"><ShieldCheck size={12} /> 100% Private</span>
            <span className="cb-lpill"><Zap size={12} /> ~60 seconds</span>
            <span className="cb-lpill"><BarChart3 size={12} /> 7 Questions</span>
          </div>
          <p className="cb-landing-desc">
            Answer a few questions about your financial profile. We estimate your CIBIL score range and show exactly which credit cards you qualify for — no personal data stored anywhere.
          </p>
          <button className="cb-start-btn" onClick={startChat}>
            <MessageCircle size={15} />
            Start Assessment
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Chat area ── */}
      {started && (
        <div className="cb-chat-area">

          {/* Messages — scrolls internally, NEVER scrolls the page */}
          <div className="cb-messages" ref={messagesRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`cb-msg cb-msg-${msg.from}`}>
                {msg.from === "bot" && (
                  <div className="cb-bot-avatar">
                    <Sparkles size={11} />
                  </div>
                )}
                <div className={`cb-bubble cb-bubble-${msg.from}`}>{msg.text}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="cb-msg cb-msg-bot">
                <div className="cb-bot-avatar">
                  <Sparkles size={11} />
                </div>
                <div className="cb-bubble cb-bubble-bot cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* ── Result card ── */}
            {done && scoreInfo && eligibility && recommendations && (
              <div className="cb-result">

                {/* Score */}
                <div className="cb-score-card" style={{ background: scoreInfo.bg, borderColor: scoreInfo.border }}>
                  <div className="cb-score-row">
                    <div>
                      <div className="cb-score-num" style={{ color: scoreInfo.color }}>{score}</div>
                      <div className="cb-score-of">out of 900</div>
                    </div>
                    <div className="cb-score-right">
                      <div className="cb-score-badge" style={{ background: scoreInfo.ring, color: scoreInfo.color }}>
                        {scoreInfo.label}
                      </div>
                      <div className="cb-score-range-label">CIBIL Score</div>
                    </div>
                  </div>
                  <div className="cb-bar-track">
                    <div className="cb-bar-fill" style={{ width: `${pct}%`, background: scoreInfo.color }} />
                  </div>
                  <div className="cb-bar-ends">
                    <span>300 · Poor</span>
                    <span>900 · Excellent</span>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="cb-elig-card">
                  <div className="cb-elig-top">
                    {eligibility.eligible
                      ? <CheckCircle2 size={15} className="cb-icon-ok" />
                      : <XCircle size={15} className="cb-icon-no" />
                    }
                    <span className="cb-elig-label">
                      {eligibility.eligible ? "You are eligible for a Credit Card" : "Not yet eligible for a Credit Card"}
                    </span>
                  </div>
                  <p className="cb-elig-tip">{eligibility.tip}</p>
                  {eligibility.cards.length > 0 && (
                    <div className="cb-cards-wrap">
                      {eligibility.cards.map((c) => (
                        <span key={c} className="cb-card-tag">
                          <BadgeCheck size={11} className="cb-card-tag-icon" />
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="cb-reco-card">
                  <div className="cb-reco-top">
                    <TrendingUp size={14} className="cb-reco-icon" />
                    <span className="cb-reco-label">How to Improve Your Score</span>
                  </div>
                  <ul className="cb-reco-list">
                    {recommendations.map((r, i) => (
                      <li key={i} className="cb-reco-item">
                        <AlertTriangle size={12} className="cb-reco-bullet" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="cb-retry-btn" onClick={reset}>
                  <RotateCcw size={13} />
                  Retake Assessment
                </button>
              </div>
            )}
          </div>

          {/* ── Options panel — fixed below messages, never causes page scroll ── */}
          {!done && !typing && currentStep < STEPS.length && (
            <div className="cb-options" key={optionsKey}>
              {STEPS[currentStep].options.map((opt) => (
                <button
                  key={opt.value}
                  className="cb-opt"
                  onClick={() => handleOption(opt)}
                >
                  <span>{opt.label}</span>
                  <ChevronRight size={14} className="cb-opt-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .cb-root {
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }

        /* Header */
        .cb-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f4f4f5;
          background: #fafafa;
        }
        .cb-header-left { display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0; }
        .cb-header-icon {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 9px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          display: flex; align-items: center; justify-content: center;
        }
        .cb-h-icon { width: 16px; height: 16px; color: #fff; }
        .cb-title { font-size: 14px; font-weight: 800; color: #09090b; letter-spacing: -0.01em; line-height: 1.2; }
        .cb-subtitle { font-size: 11px; color: #a1a1aa; font-weight: 500; margin-top: 1px; }
        .cb-progress-pill {
          font-size: 10px; font-weight: 700;
          color: #52525b;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 999px;
          padding: 3px 10px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cb-reset-btn {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 8px;
          border: 1px solid #e4e4e7;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #71717a;
          transition: all 0.15s;
        }
        .cb-reset-btn:hover { background: #f4f4f5; color: #09090b; }

        /* Landing */
        .cb-landing { padding: 22px 20px 24px; display: flex; flex-direction: column; gap: 14px; }
        .cb-landing-pills { display: flex; flex-wrap: wrap; gap: 7px; }
        .cb-lpill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: #3f3f46;
          background: #f4f4f5; border: 1px solid #e4e4e7;
          border-radius: 999px; padding: 4px 10px;
        }
        .cb-landing-desc { font-size: 13px; color: #52525b; line-height: 1.65; font-weight: 500; }
        .cb-start-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #09090b; color: #fff;
          border: none; border-radius: 12px;
          padding: 13px 20px;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.18s, transform 0.14s;
          letter-spacing: -0.01em;
        }
        .cb-start-btn:hover { background: #dc2626; }
        .cb-start-btn:active { transform: scale(0.98); }

        /* Chat area — flex column, fixed height */
        .cb-chat-area {
          display: flex;
          flex-direction: column;
          height: 480px; /* fixed container height */
        }

        /* Messages — fills available space, scrolls internally */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 16px 14px;
          scrollbar-width: thin;
          scrollbar-color: #e4e4e7 transparent;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }

        /* Message rows */
        .cb-msg { display: flex; align-items: flex-start; gap: 8px; }
        .cb-msg-user { flex-direction: row-reverse; }

        .cb-bot-avatar {
          width: 26px; height: 26px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          margin-top: 1px;
        }

        .cb-bubble {
          max-width: 76%;
          padding: 9px 13px;
          border-radius: 14px;
          font-size: 13px; font-weight: 500; line-height: 1.55;
        }
        .cb-bubble-bot {
          background: #f4f4f5; color: #18181b;
          border-bottom-left-radius: 4px;
        }
        .cb-bubble-user {
          background: #09090b; color: #fff;
          border-bottom-right-radius: 4px;
        }

        /* Typing dots */
        .cb-typing {
          display: flex; align-items: center; gap: 5px;
          padding: 12px 14px; min-width: 52px;
        }
        .cb-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a1a1aa;
          animation: cb-bounce 1.1s ease infinite;
          display: inline-block;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.14s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.28s; }
        @keyframes cb-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        /* Options panel — sits at bottom, never pushes page */
        .cb-options {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 10px 14px 14px;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e4e4e7 transparent;
        }
        .cb-options::-webkit-scrollbar { width: 3px; }
        .cb-options::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 3px; }

        .cb-opt {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; text-align: left;
          background: #fff;
          border: 1px solid #e4e4e7;
          border-radius: 10px;
          padding: 10px 13px;
          font-size: 13px; font-weight: 600; color: #18181b;
          cursor: pointer;
          transition: background 0.14s, border-color 0.14s, color 0.14s, transform 0.1s;
        }
        .cb-opt:hover {
          background: #09090b; color: #fff; border-color: #09090b;
          transform: translateX(2px);
        }
        .cb-opt:hover .cb-opt-arrow { color: #fff; }
        .cb-opt:active { transform: scale(0.98); }
        .cb-opt-arrow { color: #d4d4d8; flex-shrink: 0; transition: color 0.14s; }

        /* Result */
        .cb-result { display: flex; flex-direction: column; gap: 10px; width: 100%; }

        /* Score card */
        .cb-score-card {
          border: 1px solid; border-radius: 14px; padding: 16px;
        }
        .cb-score-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }
        .cb-score-num { font-size: 46px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; }
        .cb-score-of { font-size: 11px; color: #71717a; font-weight: 500; margin-top: 3px; }
        .cb-score-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .cb-score-badge {
          font-size: 12px; font-weight: 800;
          border-radius: 999px; padding: 4px 12px;
          letter-spacing: 0.02em;
        }
        .cb-score-range-label { font-size: 10px; color: #a1a1aa; font-weight: 500; }
        .cb-bar-track {
          height: 7px; background: rgba(0,0,0,0.07);
          border-radius: 999px; overflow: hidden;
        }
        .cb-bar-fill { height: 100%; border-radius: 999px; transition: width 1.1s cubic-bezier(.25,.46,.45,.94); }
        .cb-bar-ends {
          display: flex; justify-content: space-between;
          font-size: 10px; color: #a1a1aa; font-weight: 500; margin-top: 5px;
        }

        /* Eligibility card */
        .cb-elig-card {
          background: #fafafa; border: 1px solid #e4e4e7;
          border-radius: 13px; padding: 13px 15px;
        }
        .cb-elig-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .cb-icon-ok { color: #10b981; flex-shrink: 0; }
        .cb-icon-no { color: #ef4444; flex-shrink: 0; }
        .cb-elig-label { font-size: 13px; font-weight: 800; color: #09090b; }
        .cb-elig-tip { font-size: 12px; color: #52525b; font-weight: 500; line-height: 1.6; margin-bottom: 10px; }
        .cb-cards-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
        .cb-card-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: #18181b;
          background: #fff; border: 1px solid #e4e4e7;
          border-radius: 999px; padding: 3px 10px;
        }
        .cb-card-tag-icon { color: #10b981; }

        /* Recommendations */
        .cb-reco-card {
          background: #fafafa; border: 1px solid #e4e4e7;
          border-radius: 13px; padding: 13px 15px;
        }
        .cb-reco-top { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
        .cb-reco-icon { color: #f59e0b; flex-shrink: 0; }
        .cb-reco-label { font-size: 13px; font-weight: 800; color: #09090b; }
        .cb-reco-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .cb-reco-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #52525b; font-weight: 500; line-height: 1.6; }
        .cb-reco-bullet { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }

        /* Retry */
        .cb-retry-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: #f4f4f5; border: 1px solid #e4e4e7;
          border-radius: 10px; padding: 10px;
          font-size: 12px; font-weight: 700; color: #52525b;
          cursor: pointer; transition: all 0.15s;
        }
        .cb-retry-btn:hover { background: #e4e4e7; color: #09090b; }
      `}</style>
    </div>
  );
}
