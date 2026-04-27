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
    const currentScore = isCorrect ? quiz.score + 20 : quiz.score; // Instant calculation

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
        // 💾 SAVING LOGIC - Ensure key matches Home.jsx exactly
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
        scrollSnapType: "y mandatory",
      }}
    >
      {/* 🟢 PAGE 1 */}
      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          padding: "clamp(10px, 3vw, 20px) clamp(12px, 5vw, 40px)",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        <button style={styles.btnBack} onClick={() => navigate("/")}>
          ← Back
        </button>
        <header style={{ textAlign: "center", marginBottom: "10px" }}>
          <h1 style={styles.title}>AlgoVerse</h1>
          <div style={{ fontSize: "11px", color: T.textMuted }}>
            Two Pointers Ultimate Explorer
          </div>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(8px, 2vw, 15px)",
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
          />
          <StatBox
            label="LEFT (L)"
            value={current?.L ?? 0}
            color={T.pink}
            sub={`Value: ${arr[current?.L] || "-"}`}
          />
          <StatBox
            label="RIGHT (R)"
            value={current?.R ?? 11}
            color={T.purple}
            sub={`Value: ${arr[current?.R] || "-"}`}
          />
        </div>

        <div style={styles.canvas}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(6px, 2vw, 10px)",
              justifyContent: "center",
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
                      ...styles.card,
                      backgroundColor: isL
                        ? T.pink
                        : isR
                          ? T.purple
                          : T.surface,
                      borderColor: isL || isR ? "#fff" : T.border,
                      transform:
                        isL || isR ? "translateY(-12px) scale(1.1)" : "none",
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
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

        <div style={styles.narrativeBox}>
          <div style={styles.narrativeHeader}>
            <span>
              {quiz.active
                ? "MASTERY CHALLENGE"
                : quiz.finished
                  ? "RESULT"
                  : "LIVE LOGIC INTERPRETER"}
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
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
          <div style={styles.narrativeText}>
            {quiz.finished ? (
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: T.green, margin: 0 }}>
                  🏆 MASTERY: {quiz.score}%
                </h2>
                <p style={{ fontSize: "16px", margin: "5px 0" }}>
                  Progress saved to your library.
                </p>
                <button
                  onClick={() => setQuiz({ ...quiz, finished: false })}
                  style={{
                    ...styles.btnSecondary,
                    height: "30px",
                    padding: "0 15px",
                  }}
                >
                  View Algorithm
                </button>
              </div>
            ) : quiz.active ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "16px" }}>{QUIZ_DATA[quiz.step].q}</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {QUIZ_DATA[quiz.step].options.map((opt, i) => {
                    const isCorrect = i === QUIZ_DATA[quiz.step].correct;
                    const showFeedback = quiz.selectedIdx !== null;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        style={{
                          ...styles.optBtn,
                          background: showFeedback
                            ? isCorrect
                              ? T.green
                              : quiz.selectedIdx === i
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
            )}{" "}
          </div>
        </div>

        <div style={styles.controls}>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value))}
            style={styles.input}
          />
          <button
            style={styles.btnSecondary}
            onClick={() => {
              setStepIdx((s) => Math.max(-1, s - 1));
              window.speechSynthesis.cancel();
            }}
          >
            Undo
          </button>
          <button style={styles.btnPrimary} onClick={nextStep}>
            Next Step ▶
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              backgroundColor: isPlaying ? T.pink : T.accent,
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Pause" : "Auto Play"}
          </button>
          <button style={styles.btnSecondary} onClick={handleReset}>
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
          justifyContent: "center",
          padding: "clamp(20px, 5vw, 60px)",
          boxSizing: "border-box",
        }}
      >
        <div style={styles.footerGrid}>
          <div style={styles.infoCard}>
            <h2
              style={{ color: T.cyan, fontSize: "32px", marginBottom: "20px" }}
            >
              How it Works
            </h2>
            <p style={styles.footerP}>
              Place two pointers at the boundaries of a sorted array. Evaluate
              their sum: if it's too small, move the left pointer right. If too
              large, move the right pointer left. This systematic narrowing
              guarantees a solution in linear time.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2
              style={{ color: "#fff", fontSize: "32px", marginBottom: "20px" }}
            >
              Computational Cost
            </h2>
            <p style={styles.footerP}>
              <strong>Time Complexity:</strong> O(N) — Each pointer moves at
              most N steps.
              <br />
              <br />
              <strong>Space Complexity:</strong> O(1) — Constant space used for
              pointers.
            </p>
          </div>
        </div>
        <div style={{ ...styles.infoCard, marginTop: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ color: T.pink, fontSize: "24px", margin: 0 }}>
              Implementation
            </h2>
            <div style={{ display: "flex", gap: "20px" }}>
              {["Java", "Python", "C++", "C"].map((l) => (
                <span
                  key={l}
                  onClick={() => setActiveLang(l)}
                  style={{
                    color: activeLang === l ? T.cyan : "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    opacity: activeLang === l ? 1 : 0.5,
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
                style={styles.copyBtn}
              >
                {copyStatus}
              </button>
            </div>
          </div>
          <pre style={styles.codeBlock}>
            <code>{codeSnippets[activeLang]}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

const StatBox = ({ label, value, color, sub }) => (
  <div
    style={{
      flex: 1,
      padding: "12px 20px",
      borderRadius: "12px",
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`,
      background: T.surface,
    }}
  >
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        color: T.textMuted,
        marginBottom: "6px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "24px", fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
      {sub}
    </div>
  </div>
);

const styles = {
  btnBack: {
    position: "absolute",
    left: "clamp(10px, 4vw, 40px)",
    top: "clamp(10px, 4vw, 25px)",
    background: "transparent",
    border: `1px solid ${T.border}`,
    color: T.textMuted,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  title: {
    fontSize: "clamp(1.8rem, 5vw, 3rem)",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(to right, #8B5CF6, #3B9EFF, #06B6D4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  canvas: {
    flex: 1,
    maxHeight: "220px",
    margin: "15px 0",
    background: "rgba(13,17,28,0.3)",
    borderRadius: "20px",
    border: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "clamp(30px, 8vw, 50px)",
    height: "clamp(40px, 10vw, 65px)",
    borderRadius: "8px",
    border: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "clamp(12px, 3vw, 18px)",
    fontWeight: "800",
    transition: "0.2s",
  },
  narrativeBox: {
    background: T.surface,
    borderRadius: "12px",
    padding: "15px 25px",
    border: `1px solid ${T.border}`,
    marginBottom: "15px",
    minHeight: "120px",
  },
  narrativeHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#818cf8",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "8px",
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
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  narrativeText: {
    fontSize: "18px",
    color: T.textMuted,
    lineHeight: 1.4,
    margin: 0,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "20px",
  },
  input: {
    background: "#000",
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    padding: "10px",
    color: "#fff",
    width: "65px",
    textAlign: "center",
  },
  btnPrimary: {
    background: T.accent,
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    border: `1px solid ${T.border}`,
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  footerP: {
    fontSize: "15px",
    color: T.textMuted,
    lineHeight: "1.6",
    margin: 0,
  },
  codeBlock: {
    background: "#020617",
    padding: "20px",
    borderRadius: "12px",
    color: T.cyan,
    fontSize: "14px",
    overflowX: "auto",
    border: `1px solid ${T.border}`,
  },
  copyBtn: {
    background: T.border,
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  optBtn: {
    padding: "8px",
    border: `1px solid ${T.border}`,
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "12px",
  },
};
