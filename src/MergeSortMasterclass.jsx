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
  textMain: "#FFFFFF",
  textMuted: "#94a3b8",
};

// ─── QUIZ DATA (STRICTLY PRESERVED) ──────────────────────────
const MERGE_QUIZ = [
  {
    q: "Merge Sort is based on which algorithmic paradigm?",
    options: [
      "Dynamic Programming",
      "Greedy Strategy",
      "Divide and Conquer",
      "Backtracking",
    ],
    correct: 2,
  },
  {
    q: "What is the Time Complexity of Merge Sort in the worst-case scenario?",
    options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
    correct: 2,
  },
  {
    q: "What is the primary disadvantage of Merge Sort?",
    options: [
      "It is unstable",
      "It requires O(n) auxiliary space",
      "It is slow for large data",
      "It cannot handle duplicates",
    ],
    correct: 1,
  },
  {
    q: "What is the Auxiliary Space Complexity of Merge Sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct: 2,
  },
  {
    q: "Is Merge Sort a 'Stable' algorithm?",
    options: ["Yes", "No", "Only if sorted", "Only if reversed"],
    correct: 0,
  },
];

const generateArray = () =>
  Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 15);

export default function MergeSortMasterclass() {
  const [array, setArray] = useState(() => generateArray());
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState("start");
  const [stats, setStats] = useState({ cmp: 0, split: 0, merge: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanation, setExplanation] = useState(
    "Ready to divide and conquer? Click 'Next Step' to begin.",
  );
  const [activeLang, setActiveLang] = useState("Java");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [isMuted, setIsMuted] = useState(false);

  const [stack, setStack] = useState([{ left: 0, right: 13, step: "split" }]);
  const [activeRange, setActiveRange] = useState({ start: 0, end: 13 });
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
  const stateRef = useRef({ array, stack, phase, stats, activeRange });

  // Responsiveness State
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

  useEffect(() => {
    stateRef.current = { array, stack, phase, stats, activeRange };
  }, [array, stack, phase, stats, activeRange]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (isMuted || !window.speechSynthesis || isPlaying || quiz.active) return;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        text.replace(/DIVIDE:|CONQUER:|COMBINE:/g, ""),
      ),
    );
  };

  const doStep = useCallback(() => {
    const st = stateRef.current;
    if (st.stack.length === 0) return;

    let newArr = [...st.array];
    let newStack = [...st.stack];
    let nStats = { ...st.stats };
    let currentTask = newStack.pop();
    let { left, right, step } = currentTask;
    let exp = "";
    let nActive = { start: left, end: right };

    if (step === "split") {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        nStats.split++;

        newStack.push({ left, mid, right, step: "merge" });
        newStack.push({ left: mid + 1, right, step: "split" });
        newStack.push({ left, right: mid, step: "split" });

        exp = `🔵 DIVIDE STEP:

We take the current segment [${left} to ${right}] and split it into two smaller parts.

👉 Left half: [${left} to ${mid}]
👉 Right half: [${mid + 1} to ${right}]

This is done so we can break the problem into smaller pieces,
making it easier to sort step by step.`;
      } else {
        exp = `🟢 BASE CASE:

The segment [${left}] contains only one element.

👉 A single element is already sorted by definition,
so no further action is needed here.

We now start combining these small sorted parts.`;
      }
    } else if (step === "merge") {
      const mid = currentTask.mid;
      nStats.merge++;

      let leftArr = st.array.slice(left, mid + 1);
      let rightArr = st.array.slice(mid + 1, right + 1);

      let i = 0,
        j = 0,
        k = left;

      while (i < leftArr.length && j < rightArr.length) {
        nStats.cmp++;
        if (leftArr[i] <= rightArr[j]) newArr[k++] = leftArr[i++];
        else newArr[k++] = rightArr[j++];
      }

      while (i < leftArr.length) newArr[k++] = leftArr[i++];
      while (j < rightArr.length) newArr[k++] = rightArr[j++];

      exp = `🟣 MERGE STEP:

We now combine two already sorted parts:

👉 Left part: [${left} to ${mid}]
👉 Right part: [${mid + 1} to ${right}]

We compare elements from both sides and place the smaller one first.

This process continues until all elements are merged,
resulting in a fully sorted segment [${left} to ${right}].`;
    }

    const nPhase = newStack.length === 0 ? "done" : step;

    setHistory((prev) => [...prev, st]);
    setArray(newArr);
    setStack(newStack);
    setPhase(nPhase);
    setStats(nStats);
    setExplanation(exp);
    setActiveRange(nActive);

    if (nPhase === "done") {
      setExplanation(`🎉 SORT COMPLETE:

All divisions and merges are finished.

The array has been completely sorted from smallest to largest.`);
    }

    if (!isPlaying) speak(exp);
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (isPlaying && phase !== "done") {
      autoPlayRef.current = setInterval(doStep, 2000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, phase, doStep]);

  const handleReset = () => {
    setArray(generateArray());
    setStack([{ left: 0, right: 13, step: "split" }]);
    setPhase("start");
    setStats({ cmp: 0, split: 0, merge: 0 });
    setHistory([]);
    setActiveRange({ start: 0, end: 13 });
    setIsPlaying(false);
    setExplanation("Lab reset. Ready to divide.");
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
    Java: `void mergeSort(int[] arr, int l, int r) {\n  if (l < r) {\n    int m = l + (r-l)/2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m+1, r);\n    merge(arr, l, m, r);\n  }\n}`,
    Python: `def merge_sort(arr):\n  if len(arr) > 1:\n    mid = len(arr)//2\n    L, R = arr[:mid], arr[mid:]\n    merge_sort(L)\n    merge_sort(R)\n    # merge logic...`,
    "C++": `void mergeSort(int arr[], int l, int r) {\n  if (l >= r) return;\n  int m = l + (r-l)/2;\n  mergeSort(arr, l, m);\n  mergeSort(arr, m+1, r);\n  merge(arr, l, m, r);\n}`,
    C: `void mergeSort(int arr[], int l, int r) {\n  if (l < r) {\n    int m = l+(r-l)/2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m+1, r);\n    merge(arr, l, m, r);\n  }\n}`,
  };

  return (
    <div
      style={{
        backgroundColor: T.bg,
        height: "100vh",
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
            style={{ fontSize: isMobile ? "10px" : "11px", color: T.textMuted }}
          >
            Merge Sort Mastery
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
            value={stats.cmp}
            color={T.cyan}
            desc="Logic Checks"
            isMobile={isMobile}
          />
          <StatBox
            label="SPLITS"
            value={stats.split}
            color={T.purple}
            desc="Divides"
            isMobile={isMobile}
          />
          <StatBox
            label="MERGES"
            value={stats.merge}
            color={T.green}
            desc="Combines"
            isMobile={isMobile}
          />
          <StatBox
            label="STACK"
            value={stack.length}
            color={T.orange}
            desc="Pending"
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
            {array.map((val, idx) => {
              const isActive =
                idx >= activeRange.start && idx <= activeRange.end;
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
                      height: `${val * (isMobile ? 1.4 : 2.2)}px`,
                      backgroundColor:
                        phase === "done"
                          ? T.green
                          : isActive
                            ? T.purple
                            : T.surface,
                      borderRadius: "4px 4px 0 0",
                      border: `1px solid ${isActive ? "#fff" : T.border}`,
                      opacity: isActive || phase === "done" ? 1 : 0.3,
                      transition: "0.3s",
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? "8px" : "11px",
                      marginTop: "6px",
                      color: isActive ? T.purple : T.textMuted,
                    }}
                  >
                    {idx}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.narrativeBox(isMobile)}>
          <div style={styles.narrativeHeader}>
            <span>LIVE LOGIC INTERPRETER</span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!quiz.active && !quiz.finished && (
                <button
                  onClick={() => setQuiz({ ...quiz, active: true })}
                  style={styles.takeQuizBtn}
                >
                  TAKE QUIZ
                </button>
              )}
              <span style={styles.phaseTag}>{phase.toUpperCase()}</span>
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
                  {MERGE_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {MERGE_QUIZ[quiz.step].options.map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const c = idx === MERGE_QUIZ[quiz.step].correct;
                        setQuiz((p) => ({
                          ...p,
                          score: c ? p.score + 20 : p.score,
                          step: p.step + 1,
                          finished: p.step === 4,
                        }));
                      }}
                      style={styles.optBtn}
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
          <button
            style={styles.btnSecondary(isMobile)}
            onClick={() => {
              if (history.length > 0) {
                const p = history.pop();
                setArray(p.array);
                setStack(p.stack);
                setPhase(p.phase);
                setStats(p.stats);
                setActiveRange(p.activeRange);
              }
            }}
          >
            Undo
          </button>
          <button style={styles.btnPrimary(isMobile)} onClick={doStep}>
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
              Merge Sort splits the data until single elements remain, then
              merges them back in sorted pairs using the divide and conquer
              strategy.
            </p>
          </div>
          <div style={styles.infoCard(isMobile)}>
            <h2 style={styles.footerH2(isMobile)}>Efficiency</h2>
            <p style={styles.footerP(isMobile)}>
              <b>Time:</b> O(n log n) stable performance.
              <br />
              <b>Space:</b> O(n) auxiliary memory.
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
              marginBottom: "15px",
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
        fontSize: isMobile ? "8px" : "9px",
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
    fontSize: isMobile ? "2rem" : "3.5rem",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(90deg, #10b981, #6366f1)",
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
    background: "#10b981",
    color: "#000",
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
  }),
  btnPrimary: (isMobile) => ({
    background: T.accent,
    color: "#fff",
    border: "none",
    padding: isMobile ? "8px 16px" : "10px 22px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "13px",
  }),
  btnSecondary: (isMobile) => ({
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    border: `1px solid ${T.border}`,
    padding: isMobile ? "8px 12px" : "10px 18px",
    borderRadius: "10px",
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
    padding: isMobile ? "20px" : "20px 30px",
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
    lineHeight: "1.5",
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
