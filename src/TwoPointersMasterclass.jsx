import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── THEME ──────────────────────────────────────────────────
const T = {
  bg: "#05070A",
  surface: "#0D111C",
  border: "#1E2533",
  accent: "#6366f1",
  cyan: "#22d3ee",
  pink: "#f43f5e",
  purple: "#8B5CF6",
  green: "#10b981",
  textMain: "#FFFFFF",
  textMuted: "#94a3b8",
};

// ─── QUIZ DATA ──────────────────────────────────────────────
const QUIZ_DATA = [
  {
    q: "What is the primary prerequisite for Two Pointers for Two Sum?",
    options: ["Unsorted array", "Sorted array", "Empty array", "Large array"],
    correct: 1,
  },
  {
    q: "What is the Time Complexity of this approach?",
    options: ["O(N log N)", "O(N²)", "O(N)", "O(1)"],
    correct: 2,
  },
  {
    q: "If sum < target, which pointer do we move?",
    options: [
      "Left pointer right",
      "Right pointer left",
      "Both inwards",
      "None",
    ],
    correct: 0,
  },
  {
    q: "What is the Auxiliary Space Complexity?",
    options: ["O(N)", "O(1)", "O(log N)", "O(N²)"],
    correct: 1,
  },
  {
    q: "Why is it better than nested loops?",
    options: [
      "Uses more RAM",
      "Linear time vs Quadratic",
      "It's recursive",
      "None",
    ],
    correct: 1,
  },
];

const generateSortedArray = () => {
  const size = 12;
  const raw = Array.from(
    { length: 20 },
    () => Math.floor(Math.random() * 80) + 10,
  );
  return [...new Set(raw)].sort((a, b) => a - b).slice(0, size);
};

const buildSteps = (arr, target) => {
  const steps = [];
  let L = 0,
    R = arr.length - 1;

  while (L < R) {
    const sum = arr[L] + arr[R];

    // 🔍 COMPARE STEP
    steps.push({
      L,
      R,
      sum,
      phase: "compare",
      explanation: `🔍 COMPARISON:

👉 Left pointer at index ${L} → value ${arr[L]}
👉 Right pointer at index ${R} → value ${arr[R]}

We calculate the sum: ${arr[L]} + ${arr[R]} = ${sum}.

Now we compare this sum with the target ${target}
to decide our next move.`,
    });

    // ✅ FOUND
    if (sum === target) {
      steps.push({
        L,
        R,
        sum,
        phase: "found",
        explanation: `🎯 TARGET ACHIEVED:

The sum ${sum} exactly matches the target ${target}.

👉 Pair found: (${arr[L]}, ${arr[R]})

Since the array is sorted and we used the two-pointer strategy,
this is the correct and final answer.`,
      });
      return steps;
    }

    // ➡️ MOVE LEFT POINTER
    if (sum < target) {
      const oldL = L;
      L++;

      const newSum = arr[L] + arr[R];

      steps.push({
        L,
        R,
        sum: newSum,
        phase: "move-L",
        explanation: `➡️ MOVE LEFT POINTER:

The current sum ${sum} is LESS than the target ${target}.

👉 This means we need a BIGGER sum.

Since the array is sorted, moving the left pointer right
(from index ${oldL} → ${L}) increases the value.

Now we check the new pair:
${arr[L]} + ${arr[R]} = ${newSum}`,
      });
    }

    // ⬅️ MOVE RIGHT POINTER
    else {
      const oldR = R;
      R--;

      const newSum = arr[L] + arr[R];

      steps.push({
        L,
        R,
        sum: newSum,
        phase: "move-R",
        explanation: `⬅️ MOVE RIGHT POINTER:

The current sum ${sum} is GREATER than the target ${target}.

👉 This means we need a SMALLER sum.

Since the array is sorted, moving the right pointer left
(from index ${oldR} → ${R}) decreases the value.

Now we check the new pair:
${arr[L]} + ${arr[R]} = ${newSum}`,
      });
    }
  }

  // ❌ NOT FOUND
  steps.push({
    phase: "not-found",
    explanation: `❌ NO VALID PAIR FOUND:

We have checked all possible pairs using the two-pointer approach,
but none of them add up to the target ${target}.`,
  });

  return steps;
};

export default function TwoPointersMasterclass() {
  const [arr, setArr] = useState(() => generateSortedArray());
  const [target, setTarget] = useState(45);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState("Java");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [quiz, setQuiz] = useState({
    active: false,
    step: 0,
    score: 0,
    finished: false,
    selectedIdx: null,
    isLock: false,
  });

  const navigate = useNavigate();
  const autoPlayRef = useRef(null);
  const current = steps[stepIdx] || null;

  // Responsiveness State
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

  const cleanText = (text) => {
    return text
      .replace(/👉|🔍|➡️|⬅️|🎯|❌/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = (text) => {
    if (isMuted || !window.speechSynthesis || quiz.active) return;

    const cleaned = cleanText(text);

    const utterance = new SpeechSynthesisUtterance(cleaned);

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];

    if (voice) utterance.voice = voice;

    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
  };

  const nextStep = () => {
    window.speechSynthesis.cancel();
    if (stepIdx === -1) {
      const s = buildSteps(arr, target);
      setSteps(s);
      setStepIdx(0);
      speak(s[0].explanation);
      return;
    }
    if (stepIdx < steps.length - 1) {
      setStepIdx((s) => s + 1);
      speak(steps[stepIdx + 1].explanation);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      autoPlayRef.current = setInterval(nextStep, 2000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, stepIdx]);

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === QUIZ_DATA[quiz.step].correct;
    const currentScore = isCorrect ? quiz.score + 20 : quiz.score;

    setQuiz((prev) => ({
      ...prev,
      selectedIdx: idx,
      score: currentScore,
      isLock: true,
    }));

    setTimeout(() => {
      if (quiz.step < 4) {
        setQuiz((prev) => ({
          ...prev,
          step: prev.step + 1,
          selectedIdx: null,
          isLock: false,
        }));
      } else {
        setQuiz((prev) => ({ ...prev, finished: true, active: false }));
        const mastery = JSON.parse(
          localStorage.getItem("algoVerseMastery") || "{}",
        );
        mastery["Two Pointers (Two Sum)"] = Math.max(
          mastery["Two Pointers (Two Sum)"] || 0,
          currentScore,
        );
        localStorage.setItem("algoVerseMastery", JSON.stringify(mastery));
      }
    }, 1000);
  };

  const handleReset = () => {
    setArr(generateSortedArray());
    setStepIdx(-1);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    setQuiz({
      active: false,
      step: 0,
      score: 0,
      finished: false,
      selectedIdx: null,
      isLock: false,
    });
  };

  const codeSnippets = {
    Java: `public int[] twoSum(int[] arr, int target) {\n  int l = 0, r = arr.length - 1;\n  while (l < r) {\n    int sum = arr[l] + arr[r];\n    if (sum == target) return new int[]{l, r};\n    if (sum < target) l++; else r--;\n  }\n  return new int[]{-1, -1};\n}`,
    Python: `def two_sum(arr, target):\n    l, r = 0, len(arr) - 1\n    while l < r:\n        s = arr[l] + arr[r]\n        if s == target: return [l, r]\n        if s < target: l += 1\n        else: r -= 1\n    return [-1, -1]`,
    "C++": `vector<int> twoSum(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l < r) {\n        int sum = arr[l] + arr[r];\n        if (sum == target) return {l, r};\n        (sum < target) ? l++ : r--;\n    }\n    return {};\n}`,
    C: `void twoSum(int arr[], int n, int target, int* r1, int* r2) {\n    int l = 0, r = n - 1;\n    while (l < r) {\n        int sum = arr[l] + arr[r];\n        if (sum == target) { *r1 = l; *r2 = r; return; }\n        if (sum < target) l++; else r--;\n    }\n    *r1 = -1; *r2 = -1;\n}`,
  };

  return (
    <div
      style={{
        backgroundColor: T.bg,
        minHeight: "100vh",
        overflowY: "auto",
        scrollSnapType: isMobile ? "none" : "y mandatory",
      }}
    >
      {/* 🟢 PAGE 1 */}
      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "15px" : "20px 40px",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            position: "relative",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <button
            style={styles.btnBack(isMobile)}
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
          <h1 style={styles.title(isMobile)}>AlgoVerse</h1>
          <div
            style={{ fontSize: isMobile ? "10px" : "11px", color: T.textMuted }}
          >
            Two Pointers Ultimate Explorer
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fit, minmax(160px, 1fr))",
            gap: isMobile ? "10px" : "15px",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto 15px",
          }}
        >
          <StatBox
            label="LIVE SUM"
            value={current?.sum || "-"}
            color={T.cyan}
            sub={`Target: ${target}`}
            isMobile={isMobile}
          />
          <StatBox
            label="LEFT (L)"
            value={current?.L ?? 0}
            color={T.pink}
            sub={`Val: ${arr[current?.L] || "-"}`}
            isMobile={isMobile}
          />
          <StatBox
            label="RIGHT (R)"
            value={current?.R ?? 11}
            color={T.purple}
            sub={`Val: ${arr[current?.R] || "-"}`}
            isMobile={isMobile}
          />
          {isMobile && (
            <div
              style={{
                background: T.surface,
                borderRadius: "12px",
                border: `1px solid ${T.border}`,
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "10px", color: T.textMuted }}>
                Target: {target}
              </span>
            </div>
          )}
        </div>

        <div style={styles.canvas(isMobile)}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? "6px" : "12px",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {arr.map((val, idx) => {
              const isL = current?.L === idx;
              const isR = current?.R === idx;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      ...styles.card(isMobile),
                      backgroundColor: isL
                        ? T.pink
                        : isR
                          ? T.purple
                          : T.surface,
                      borderColor: isL || isR ? "#fff" : T.border,
                      transform:
                        isL || isR ? "translateY(-8px) scale(1.1)" : "none",
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "10px" : "12px",
                      marginTop: "6px",
                      fontWeight: "bold",
                      color: isL ? T.pink : isR ? T.purple : "transparent",
                    }}
                  >
                    {isL ? "L ↑" : isR ? "R ↑" : "."}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.narrativeBox(isMobile)}>
          <div style={styles.narrativeHeader}>
            <span>
              {quiz.active
                ? "MASTERY CHALLENGE"
                : quiz.finished
                  ? "RESULT"
                  : "LIVE LOGIC INTERPRETER"}
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!quiz.active && !quiz.finished && (
                <button
                  onClick={() => setQuiz({ ...quiz, active: true })}
                  style={styles.quizEntryBtn}
                >
                  TAKE QUIZ
                </button>
              )}
              <span style={styles.phaseTag}>
                {quiz.active
                  ? `Q ${quiz.step + 1}/5`
                  : quiz.finished
                    ? "DONE"
                    : current?.phase.toUpperCase() || "IDLE"}
              </span>
            </div>
          </div>
          <div style={styles.narrativeText(isMobile)}>
            {quiz.finished ? (
              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    color: T.green,
                    margin: 0,
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                >
                  🏆 MASTERY: {quiz.score}%
                </h2>
                <button
                  onClick={() => setQuiz({ ...quiz, finished: false })}
                  style={styles.btnSecondary(isMobile)}
                >
                  View Algorithm
                </button>
              </div>
            ) : quiz.active ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: isMobile ? "14px" : "16px" }}>
                  {QUIZ_DATA[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {QUIZ_DATA[quiz.step].options.map((opt, idx) => {
                    const isCorrect = idx === QUIZ_DATA[quiz.step].correct;
                    const showFeedback = quiz.selectedIdx !== null;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        style={{
                          ...styles.optBtn,
                          background: showFeedback
                            ? isCorrect
                              ? T.green
                              : quiz.selectedIdx === idx
                                ? T.pink
                                : "#111827"
                            : "#111827",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              current?.explanation || "Ready to search? Click Next Step."
            )}
          </div>
        </div>

        <div style={styles.controls(isMobile)}>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value))}
            style={styles.input(isMobile)}
          />
          <button
            style={styles.btnSecondary(isMobile)}
            onClick={() => {
              setStepIdx((s) => Math.max(-1, s - 1));
              window.speechSynthesis.cancel();
            }}
          >
            Undo
          </button>
          <button style={styles.btnPrimary(isMobile)} onClick={nextStep}>
            Next ▶
          </button>
          <button
            style={styles.btnSecondary(isMobile)}
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            style={{
              ...styles.btnPrimary(isMobile),
              backgroundColor: isPlaying ? T.pink : T.accent,
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Pause" : "Auto"}
          </button>
          <button style={styles.btnSecondary(isMobile)} onClick={handleReset}>
            Reset
          </button>
        </div>
      </section>

      {/* 🔵 PAGE 2 */}
      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "40px 20px" : "60px",
          boxSizing: "border-box",
          gap: "30px",
        }}
      >
        <div style={styles.footerGrid(isMobile)}>
          <div style={styles.infoCard(isMobile)}>
            <h2
              style={{
                color: T.cyan,
                fontSize: isMobile ? "24px" : "32px",
                marginBottom: "15px",
              }}
            >
              How it Works
            </h2>
            <p style={styles.footerP(isMobile)}>
              Place two pointers at the boundaries of a sorted array. Evaluate
              their sum: if it's too small, move the left pointer right. If too
              large, move the right pointer left.
            </p>
          </div>
          <div style={styles.infoCard(isMobile)}>
            <h2
              style={{
                color: "#fff",
                fontSize: isMobile ? "24px" : "32px",
                marginBottom: "15px",
              }}
            >
              Cost
            </h2>
            <p style={styles.footerP(isMobile)}>
              <strong>Time:</strong> O(N) — Linear traversal.
              <br />
              <strong>Space:</strong> O(1) — Constant memory.
            </p>
          </div>
        </div>
        <div style={styles.infoCard(isMobile)}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                color: T.pink,
                fontSize: isMobile ? "20px" : "24px",
                margin: 0,
              }}
            >
              Implementation
            </h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {["Java", "Python", "C++", "C"].map((l) => (
                <span
                  key={l}
                  onClick={() => setActiveLang(l)}
                  style={{
                    color: activeLang === l ? T.cyan : "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    opacity: activeLang === l ? 1 : 0.5,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  {l}
                </span>
              ))}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippets[activeLang]);
                  setCopyStatus("Copied!");
                  setTimeout(() => setCopyStatus("Copy"), 2000);
                }}
                style={styles.copyBtn(isMobile)}
              >
                {copyStatus}
              </button>
            </div>
          </div>
          <pre style={styles.codeBlock(isMobile)}>
            <code>{codeSnippets[activeLang]}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

const StatBox = ({ label, value, color, sub, isMobile }) => (
  <div
    style={{
      padding: isMobile ? "10px" : "12px 20px",
      borderRadius: "12px",
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`,
      background: T.surface,
    }}
  >
    <div
      style={{
        fontSize: isMobile ? "8px" : "10px",
        fontWeight: 700,
        color: T.textMuted,
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800 }}>
      {value}
    </div>
    <div
      style={{
        fontSize: isMobile ? "8px" : "10px",
        color: "rgba(255,255,255,0.4)",
      }}
    >
      {sub}
    </div>
  </div>
);

const styles = {
  btnBack: (isMobile) => ({
    position: isMobile ? "static" : "absolute",
    left: "40px",
    top: "25px",
    background: "transparent",
    border: `1px solid ${T.border}`,
    color: T.textMuted,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: isMobile ? "10px" : "0",
  }),
  title: (isMobile) => ({
    fontSize: isMobile ? "2.2rem" : "3.5rem",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(to right, #8B5CF6, #3B9EFF, #06B6D4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
  canvas: (isMobile) => ({
    flex: 1,
    minHeight: isMobile ? "200px" : "220px",
    margin: "15px 0",
    background: "rgba(13,17,28,0.3)",
    borderRadius: "20px",
    border: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    overflowX: "auto",
  }),
  card: (isMobile) => ({
    width: isMobile ? "35px" : "50px",
    height: isMobile ? "45px" : "65px",
    borderRadius: "8px",
    border: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: isMobile ? "14px" : "18px",
    fontWeight: "800",
    transition: "0.2s",
    background: T.surface,
  }),
  narrativeBox: (isMobile) => ({
    background: T.surface,
    borderRadius: "12px",
    padding: isMobile ? "15px" : "15px 25px",
    border: `1px solid ${T.border}`,
    marginBottom: "15px",
    minHeight: isMobile ? "140px" : "120px",
  }),
  narrativeHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#818cf8",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  phaseTag: {
    background: "#4f46e5",
    color: "#fff",
    padding: "1px 6px",
    borderRadius: "4px",
  },
  quizEntryBtn: {
    background: T.accent,
    border: "none",
    color: "#fff",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  narrativeText: (isMobile) => ({
    fontSize: isMobile ? "14px" : "18px",
    color: T.textMuted,
    lineHeight: 1.4,
    margin: 0,
  }),
  controls: (isMobile) => ({
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "20px",
  }),
  input: (isMobile) => ({
    background: "#000",
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    padding: isMobile ? "8px" : "10px",
    color: "#fff",
    width: isMobile ? "50px" : "65px",
    textAlign: "center",
    fontSize: isMobile ? "12px" : "14px",
  }),
  btnPrimary: (isMobile) => ({
    background: T.accent,
    color: "#fff",
    border: "none",
    padding: isMobile ? "8px 16px" : "10px 22px",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "13px",
  }),
  btnSecondary: (isMobile) => ({
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    border: `1px solid ${T.border}`,
    padding: isMobile ? "8px 12px" : "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "13px",
  }),
  footerGrid: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "20px",
  }),
  infoCard: (isMobile) => ({
    background: T.surface,
    padding: isMobile ? "20px" : "30px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
  }),
  footerP: (isMobile) => ({
    fontSize: isMobile ? "13px" : "15px",
    color: T.textMuted,
    lineHeight: "1.6",
    margin: 0,
  }),
  codeBlock: (isMobile) => ({
    background: "#020617",
    padding: isMobile ? "12px" : "20px",
    borderRadius: "12px",
    color: T.cyan,
    fontSize: isMobile ? "11px" : "14px",
    overflowX: "auto",
    border: `1px solid ${T.border}`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  }),
  copyBtn: (isMobile) => ({
    background: T.border,
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
  }),
  optBtn: {
    padding: "10px",
    border: `1px solid ${T.border}`,
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "12px",
  },
};
