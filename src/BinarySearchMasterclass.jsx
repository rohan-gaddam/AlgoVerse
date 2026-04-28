import React, { useState, useEffect, useRef, useCallback } from "react";
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
  orange: "#f59e0b",
  yellow: "#FACC15",
  textMain: "#FFFFFF",
  textMuted: "#94a3b8",
};

// ─── QUIZ DATA ──────────────────────────────────────────────
const BINARY_QUIZ = [
  {
    q: "What is the primary prerequisite for Binary Search?",
    options: ["Unsorted array", "Sorted array", "Unique values", "Empty array"],
    correct: 1,
  },
  {
    q: "What is the Time Complexity in average and worst-case?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    correct: 2,
  },
  {
    q: "If target > midpoint value (arr[mid] < target), how are pointers updated?",
    options: ["high = mid - 1", "low = mid", "low = mid + 1", "high = mid + 1"],
    correct: 2,
  },
  {
    q: "In an array of 1,024 elements, what is the max comparisons needed?",
    options: ["10", "512", "1024", "1"],
    correct: 0,
  },
  {
    q: "What is the Auxiliary Space Complexity of an Iterative implementation?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
  },
];

const generateSortedArray = () => {
  const raw = Array.from(
    { length: 25 },
    () => Math.floor(Math.random() * 90) + 10,
  );
  return [...new Set(raw)].sort((a, b) => a - b).slice(0, 14);
};

export default function BinarySearchMasterclass() {
  const [arr, setArr] = useState(() => generateSortedArray());
  const [targetInput, setTargetInput] = useState("55");
  const [target, setTarget] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState("Java");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [explanation, setExplanation] = useState(
    "Ready to master Binary Search? Click 'Next Step' to begin the first iteration.",
  );
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
      .replace(/👉|🔵|🔍|➡️|⬅️|🎯|❌/g, "")
      .replace(
        /INITIALIZATION:|MIDPOINT:|FOUND:|MOVE RIGHT:|MOVE LEFT:|NOT FOUND:/g,
        "",
      )
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

  const buildSteps = (array, val) => {
    const s = [];
    let low = 0,
      high = array.length - 1,
      comparisons = 0;

    // 🔵 INIT
    s.push({
      low,
      high,
      mid: null,
      found: null,
      phase: "init",
      explanation: `🔵 INITIALIZATION:

We begin with the entire array as our search space.

👉 Current range: index ${low} to ${high}
👉 Target value: ${val}

Since the array is sorted, we can repeatedly divide this range
to quickly narrow down where the target might be.`,
      stats: { comparisons: 0, range: high - low + 1, midVal: "-" },
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      comparisons++;

      // 🔍 MID CHECK
      s.push({
        low,
        high,
        mid,
        found: null,
        phase: "compare",
        explanation: `🔍 MIDPOINT CHECK:

👉 Current range: [${low} to ${high}]
👉 Middle index: ${mid}
👉 Middle value: ${array[mid]}

We compare ${array[mid]} with target ${val}
to decide which half of the array to search next.`,
        stats: { comparisons, range: high - low + 1, midVal: array[mid] },
      });

      if (array[mid] === val) {
        // ✅ FOUND
        s.push({
          low,
          high,
          mid,
          found: mid,
          phase: "found",
          explanation: `🎯 TARGET FOUND:

The middle value ${array[mid]} matches the target ${val}.

👉 Target found at index ${mid}

Since we always narrow the search space correctly,
this result is guaranteed to be correct.`,
          stats: { comparisons, range: 1, midVal: array[mid] },
        });

        return s;
      } else if (array[mid] < val) {
        const oldLow = low;
        low = mid + 1;

        // ➡️ MOVE RIGHT
        s.push({
          low,
          high,
          mid,
          found: null,
          phase: "move",
          explanation: `➡️ MOVE RIGHT:

${array[mid]} is smaller than ${val}.

👉 This means the target cannot be in the left half.

So we discard the left side [${oldLow} to ${mid}]
and search only in the right half.

👉 New range: [${low} to ${high}]`,
          stats: { comparisons, range: high - low + 1, midVal: array[mid] },
        });
      } else {
        const oldHigh = high;
        high = mid - 1;

        // ⬅️ MOVE LEFT
        s.push({
          low,
          high,
          mid,
          found: null,
          phase: "move",
          explanation: `⬅️ MOVE LEFT:

${array[mid]} is greater than ${val}.

👉 This means the target cannot be in the right half.

So we discard the right side [${mid} to ${oldHigh}]
and search only in the left half.

👉 New range: [${low} to ${high}]`,
          stats: { comparisons, range: high - low + 1, midVal: array[mid] },
        });
      }
    }

    // ❌ NOT FOUND
    s.push({
      low,
      high,
      mid: null,
      found: -1,
      phase: "not-found",
      explanation: `❌ TARGET NOT FOUND:

The search range has become empty.

👉 This means we have checked all possible positions,
and ${val} does not exist in the array.`,
      stats: { comparisons, range: 0, midVal: "-" },
    });

    return s;
  };

  const handleNext = () => {
    if (stepIdx === -1) {
      const val = parseInt(targetInput) || arr[Math.floor(arr.length / 2)];
      setTarget(val);
      const s = buildSteps(arr, val);
      setSteps(s);
      setStepIdx(0);
      setExplanation(s[0].explanation);
      speak(s[0].explanation);
    } else if (stepIdx < steps.length - 1) {
      setStepIdx((s) => s + 1);
      setExplanation(steps[stepIdx + 1].explanation);
      speak(steps[stepIdx + 1].explanation);
    } else setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      autoPlayRef.current = setInterval(handleNext, 1500);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, stepIdx, steps]);

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === BINARY_QUIZ[quiz.step].correct;
    const currentScore = isCorrect ? quiz.score + 20 : quiz.score;
    setQuiz((prev) => ({
      ...prev,
      selectedIdx: idx,
      score: currentScore,
      isLock: true,
    }));
    setTimeout(() => {
      if (quiz.step < 4)
        setQuiz((prev) => ({
          ...prev,
          step: prev.step + 1,
          selectedIdx: null,
          isLock: false,
        }));
      else {
        setQuiz((prev) => ({ ...prev, finished: true, active: false }));
        const mastery = JSON.parse(
          localStorage.getItem("algoVerseMastery") || "{}",
        );
        mastery["Binary Search"] = Math.max(
          mastery["Binary Search"] || 0,
          currentScore,
        );
        localStorage.setItem("algoVerseMastery", JSON.stringify(mastery));
      }
    }, 1000);
  };

  const handleReset = () => {
    setArr(generateSortedArray());
    setSteps([]);
    setStepIdx(-1);
    setIsPlaying(false);
    setExplanation("Lab reset. Ready to search.");
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
    Java: `int binarySearch(int arr[], int target) {\n  int l = 0, r = arr.length - 1;\n  while (l <= r) {\n    int m = l + (r - l) / 2;\n    if (arr[m] == target) return m;\n    if (arr[m] < target) l = m + 1; else r = m - 1;\n  }\n  return -1;\n}`,
    Python: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        if arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1`,
    "C++": `int binarySearch(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == target) return mid;\n        (arr[mid] < target) ? l = mid + 1 : r = mid - 1;\n    }\n    return -1;\n}`,
  };

  return (
    <div
      style={{
        backgroundColor: T.bg,
        minHeight: "100vh",
        overflowY: "auto",
        scrollSnapType: isMobile ? "none" : "y mandatory",
        color: T.textMain,
      }}
    >
      {/* 🟢 PAGE 1 */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "15px" : "20px 40px",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
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
            style={{
              fontSize: isMobile ? "10px" : "11px",
              color: T.textMuted,
              marginTop: "8px",
            }}
          >
            Binary Search Ultimate Explorer
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
            label="COMPARISONS"
            value={current?.stats.comparisons || 0}
            color={T.cyan}
            desc="Checks"
            isMobile={isMobile}
          />
          <StatBox
            label="SEARCH RANGE"
            value={current?.stats.range || arr.length}
            color={T.pink}
            desc="Remaining"
            isMobile={isMobile}
          />
          <StatBox
            label="CURRENT MID"
            value={current?.stats.midVal || "-"}
            color={T.yellow}
            desc="Mid Value"
            isMobile={isMobile}
          />
          <StatBox
            label="TARGET"
            value={target || "?"}
            color={T.purple}
            desc="Goal"
            isMobile={isMobile}
          />
        </div>

        <div style={styles.canvas(isMobile)}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: isMobile ? "4px" : "12px",
              height: isMobile ? "150px" : "200px",
              width: "100%",
            }}
          >
            {arr.map((val, idx) => {
              const isEliminated =
                current && (idx < current.low || idx > current.high);
              const isMid = current?.mid === idx;
              const isFound = current?.found === idx;
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
                      width: isMobile ? "18px" : "45px", // FIXED: Width for desktop
                      height: `${val * (isMobile ? 1.3 : 2.0)}px`,
                      backgroundColor: isFound
                        ? T.green
                        : isMid
                          ? T.yellow
                          : isEliminated
                            ? "rgba(22,27,38,0.4)"
                            : T.accent,
                      borderRadius: "6px 6px 2px 2px",
                      border: `1px solid ${isMid || isFound ? "#fff" : T.border}`,
                      transition: "0.3s",
                      opacity: isEliminated ? 0.3 : 1,
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      marginTop: "6px",
                      fontWeight: "bold",
                      color: isFound ? T.green : isMid ? T.yellow : T.textMuted,
                    }}
                  >
                    {isMid ? "MID" : isFound ? "FOUND" : idx}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.narrativeBox(isMobile)}>
          <div style={styles.narrativeHeader}>
            <span>
              {quiz.active ? "MASTERY CHALLENGE" : "LIVE LOGIC INTERPRETER"}
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!quiz.active && !quiz.finished && (
                <button
                  onClick={() => setQuiz({ ...quiz, active: true })}
                  style={styles.takeQuizBtn}
                >
                  TAKE QUIZ
                </button>
              )}
              <span style={styles.phaseTag}>
                {current?.phase.toUpperCase() || "START"}
              </span>
            </div>
          </div>
          <div style={styles.narrativeText(isMobile)}>
            {quiz.finished ? (
              <div
                style={{
                  textAlign: "center",
                  color: T.green,
                  fontSize: isMobile ? "20px" : "24px",
                }}
              >
                🏆 MASTERY ACHIEVED: {quiz.score}%
              </div>
            ) : quiz.active ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: isMobile ? "14px" : "18px" }}>
                  {BINARY_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {BINARY_QUIZ[quiz.step].options.map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        ...styles.optBtn,
                        background:
                          quiz.selectedIdx === idx
                            ? idx === BINARY_QUIZ[quiz.step].correct
                              ? T.green
                              : T.pink
                            : "#111827",
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              explanation
            )}
          </div>
        </div>

        <div style={styles.controls(isMobile)}>
          <input
            type="number"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            style={styles.input(isMobile)}
          />
          <button
            style={styles.btnSecondary(isMobile)}
            onClick={() => {
              if (stepIdx > 0) setStepIdx(stepIdx - 1);
            }}
          >
            Undo
          </button>
          <button style={styles.btnPrimary(isMobile)} onClick={handleNext}>
            Next ▶
          </button>
          <button
            style={styles.btnSecondary(isMobile)}
            onClick={() => {
              const newMute = !isMuted;
              if (newMute) window.speechSynthesis.cancel();
              setIsMuted(newMute);
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            style={{
              ...styles.btnPrimary(isMobile),
              background: isPlaying ? T.pink : T.accent,
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
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "40px 20px" : "60px",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
          gap: "30px",
          justifyContent: "center",
        }}
      >
        <div style={styles.footerGrid(isMobile)}>
          <div style={styles.infoCard(isMobile)}>
            <h2 style={styles.footerH2(isMobile)}>How it Works</h2>
            <p style={styles.footerP(isMobile)}>
              Binary Search treats the array as a sorted collection. It
              repeatedly picks the midpoint and compares it to the target,
              eliminating half the search space every single step.
            </p>
          </div>
          <div style={styles.infoCard(isMobile)}>
            <h2 style={styles.footerH2(isMobile)}>Efficiency</h2>
            <p style={styles.footerP(isMobile)}>
              <b>Time:</b> O(log n) average/worst case.
              <br />
              <b>Space:</b> O(1) iterative approach.
            </p>
          </div>
        </div>
        <div style={styles.infoCard(isMobile)}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "10px",
            }}
          >
            <h2 style={{ color: T.pink, fontSize: isMobile ? "20px" : "24px" }}>
              Implementation
            </h2>
            <div style={{ display: "flex", gap: "12px" }}>
              {["Java", "Python", "C++"].map((l) => (
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
                style={styles.copyBtn(isMobile)}
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippets[activeLang]);
                  setCopyStatus("Copied!");
                  setTimeout(() => setCopyStatus("Copy"), 2000);
                }}
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

const StatBox = ({ label, value, color, desc, isMobile }) => (
  <div
    style={{
      padding: isMobile ? "10px" : "12px 15px",
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
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 800 }}>
      {value}
    </div>
    <div
      style={{
        fontSize: isMobile ? "8px" : "9px",
        color: "rgba(255,255,255,0.3)",
      }}
    >
      {desc}
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
    background: "linear-gradient(90deg, #8B5CF6, #3B9EFF, #06B6D4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
  canvas: (isMobile) => ({
    flex: 1,
    minHeight: isMobile ? "220px" : "260px",
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
  narrativeBox: (isMobile) => ({
    background: T.surface,
    borderRadius: "12px",
    padding: isMobile ? "15px" : "15px 30px",
    border: `1px solid ${T.border}`,
    marginBottom: "15px",
    minHeight: isMobile ? "140px" : "120px",
  }),
  narrativeHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#818cf8",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  phaseTag: {
    background: "#4f46e5",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  takeQuizBtn: {
    background: T.accent,
    border: "none",
    color: "#fff",
    borderRadius: "4px",
    padding: "2px 10px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  narrativeText: (isMobile) => ({
    fontSize: isMobile ? "14px" : "17px",
    color: T.textMuted,
    lineHeight: 1.4,
  }),
  controls: (isMobile) => ({
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingBottom: "20px",
    alignItems: "center",
  }),
  input: (isMobile) => ({
    background: "#05070A",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: isMobile ? "8px" : "10px",
    color: "#FFF",
    width: isMobile ? "50px" : "70px",
    textAlign: "center",
    fontSize: isMobile ? "12px" : "14px",
  }),
  btnPrimary: (isMobile) => ({
    background: T.accent,
    color: "#fff",
    border: "none",
    padding: isMobile ? "8px 16px" : "10px 22px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "14px",
  }),
  btnSecondary: (isMobile) => ({
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    border: `1px solid ${T.border}`,
    padding: isMobile ? "8px 12px" : "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "14px",
  }),
  footerGrid: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "20px",
  }),
  infoCard: (isMobile) => ({
    background: T.surface,
    padding: isMobile ? "20px" : "18px 24px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
  }),
  footerH2: (isMobile) => ({
    color: T.cyan,
    fontSize: isMobile ? "22px" : "24px",
    margin: "0 0 10px 0",
  }),
  footerP: (isMobile) => ({
    fontSize: isMobile ? "13px" : "14px",
    color: T.textMuted,
    lineHeight: "1.6",
    margin: 0,
  }),
  codeBlock: (isMobile) => ({
    background: "#020617",
    padding: isMobile ? "12px" : "15px",
    borderRadius: "12px",
    color: T.cyan,
    fontSize: isMobile ? "11px" : "14px",
    overflowX: "auto",
    border: `1px solid ${T.border}`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  }),
  optBtn: {
    padding: "10px",
    background: "#111827",
    border: `1px solid ${T.border}`,
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    textAlign: "left",
  },
  copyBtn: (isMobile) => ({
    background: T.border,
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  }),
};
