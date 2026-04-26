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
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
      }}
    >
      {/* 🟢 PAGE 1 */}
      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "15px 40px",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
          overflow: "hidden",
          justifyContent: "space-between",
        }}
      >
        <button style={styles.btnBack} onClick={() => navigate("/")}>
          ← Back
        </button>
        <header style={{ textAlign: "center" }}>
          <h1 style={styles.title}>AlgoVerse</h1>
          <div style={{ fontSize: "11px", color: T.textMuted }}>
            Merge Sort Mastery
          </div>
        </header>

        <div
          style={{
            display: "flex",
            gap: "10px",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <StatBox
            label="COMPARISONS"
            value={stats.cmp}
            color={T.cyan}
            desc="Checks"
          />
          <StatBox
            label="SPLITS"
            value={stats.split}
            color={T.purple}
            desc="Divides"
          />
          <StatBox
            label="MERGES"
            value={stats.merge}
            color={T.green}
            desc="Combines"
          />
          <StatBox
            label="STACK"
            value={stack.length}
            color={T.orange}
            desc="Pending"
          />
        </div>

        <div style={styles.canvas}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              height: "180px",
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
                      width: "38px",
                      height: `${val * 2}px`,
                      backgroundColor:
                        phase === "done"
                          ? T.green
                          : isActive
                            ? T.purple
                            : T.surface,
                      borderRadius: "4px 4px 0 0",
                      border: `1px solid ${isActive ? "#fff" : T.border}`,
                      opacity: isActive || phase === "done" ? 1 : 0.3,
                    }}
                  />
                  <div
                    style={{
                      fontSize: "10px",
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

        <div style={styles.narrativeBox}>
          <div style={styles.narrativeHeader}>
            <span>LIVE LOGIC INTERPRETER</span>
            <div style={{ display: "flex", gap: "10px" }}>
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
          <div style={styles.narrativeText}>
            {quiz.finished ? (
              <div style={{ textAlign: "center", color: T.green }}>
                🏆 MASTERY ACHIEVED: {quiz.score}%
              </div>
            ) : quiz.active ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "16px" }}>
                  {MERGE_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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

        {/* 🛠️ BUTTONS ROW - STRICTLY INCLUDED */}
        <div style={styles.controls}>
          <button
            style={styles.btnSecondary}
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
          <button style={styles.btnPrimary} onClick={doStep}>
            Next Step ▶
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => {
              const newMute = !isMuted;

              if (newMute) {
                // ❗ STOP speech immediately when muting
                window.speechSynthesis.cancel();
              }

              setIsMuted(newMute);
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              background: isPlaying ? T.pink : T.accent,
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
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
        }}
      >
        <div style={styles.footerGrid}>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>How it Works</h2>
            <p style={styles.footerP}>
              Merge Sort split the data until single elements remain, then
              merges them back in sorted pairs.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>Costs</h2>
            <p style={styles.footerP}>Time: O(n log n). Space: O(n).</p>
          </div>
        </div>
        <div style={{ ...styles.infoCard, marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: T.pink, fontSize: "24px" }}>Implementation</h2>
            <div style={{ display: "flex", gap: "15px" }}>
              {["Java", "Python", "C++"].map((l) => (
                <span
                  key={l}
                  onClick={() => setActiveLang(l)}
                  style={{
                    color: activeLang === l ? T.cyan : "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {l}
                </span>
              ))}
              <button
                style={styles.copyBtn}
                onClick={() =>
                  navigator.clipboard.writeText(codeSnippets[activeLang])
                }
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

const StatBox = ({ label, value, color, desc }) => (
  <div
    style={{
      flex: 1,
      padding: "12px 15px",
      borderRadius: "12px",
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`,
      background: T.surface,
    }}
  >
    <div style={{ fontSize: "9px", fontWeight: 700, color: T.textMuted }}>
      {label}
    </div>
    <div style={{ fontSize: "22px", fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>
      {desc}
    </div>
  </div>
);

const styles = {
  btnBack: {
    position: "absolute",
    left: "40px",
    top: "25px",
    background: "transparent",
    border: `1px solid ${T.border}`,
    color: T.textMuted,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(90deg, #10b981, #6366f1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  canvas: {
    flexGrow: 1,
    maxHeight: "240px",
    margin: "15px 0",
    background: "rgba(13,17,28,0.3)",
    borderRadius: "20px",
    border: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  narrativeBox: {
    background: T.surface,
    borderRadius: "12px",
    padding: "15px 30px",
    border: `1px solid ${T.border}`,
    marginBottom: "15px",
    minHeight: "120px",
  },
  narrativeHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#818cf8",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "8px",
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
  narrativeText: { fontSize: "17px", color: T.textMuted, lineHeight: 1.4 },
  controls: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    paddingBottom: "20px",
  },
  btnPrimary: {
    background: T.accent,
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    border: `1px solid ${T.border}`,
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  footerGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  infoCard: {
    background: T.surface,
    padding: "20px 30px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
  },
  footerH2: { color: T.cyan, fontSize: "24px", margin: "0 0 10px 0" },
  footerP: {
    fontSize: "14px",
    color: T.textMuted,
    lineHeight: "1.5",
    margin: 0,
  },
  codeBlock: {
    background: "#020617",
    padding: "15px",
    borderRadius: "12px",
    color: T.cyan,
    fontSize: "14px",
    overflowX: "auto",
    border: `1px solid ${T.border}`,
  },
  optBtn: {
    padding: "10px",
    background: "#111827",
    border: `1px solid ${T.border}`,
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
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
};
