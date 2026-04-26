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

// ─── QUICK SORT MASTER QUIZ DATA ────────────────────────────
const QUICK_QUIZ = [
  {
    q: "Quick Sort belongs to which algorithmic design paradigm?",
    options: [
      "Dynamic Programming",
      "Divide and Conquer",
      "Greedy Method",
      "Backtracking",
    ],
    correct: 1,
  },
  {
    q: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correct: 2,
  },
  {
    q: "What is the average time complexity of Quick Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(n!)"],
    correct: 1,
  },
  {
    q: "What happens during the 'Partition' step of the algorithm?",
    options: [
      "The array is merged",
      "The pivot is placed in its final sorted position",
      "A random element is deleted",
      "The array is duplicated",
    ],
    correct: 1,
  },
  {
    q: "What is the average Auxiliary Space Complexity of Quick Sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct: 1,
  },
];

const generateArray = () =>
  Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 15);

export default function QuickSortMasterclass() {
  const [array, setArray] = useState(() => generateArray());
  const [history, setHistory] = useState([]);
  const [i, setI] = useState(-1);
  const [j, setJ] = useState(0);
  const [key, setKey] = useState(null);
  const [phase, setPhase] = useState("start");
  const [stats, setStats] = useState({ cmp: 0, swp: 0, piv: 0 });
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(13);
  const [callStack, setCallStack] = useState([{ low: 0, high: 13 }]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanation, setExplanation] = useState(
    "Ready to master Quick Sort? Click 'Next Step' to begin the first partition.",
  );
  const [activeLang, setActiveLang] = useState("Java");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [isMuted, setIsMuted] = useState(false);
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
  const stateRef = useRef({
    array,
    i,
    j,
    key,
    phase,
    stats,
    low,
    high,
    callStack,
  });

  useEffect(() => {
    stateRef.current = { array, i, j, key, phase, stats, low, high, callStack };
  }, [array, i, j, key, phase, stats, low, high, callStack]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (isMuted || !window.speechSynthesis || isPlaying || quiz.active) return;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(text.replace(/👉|✅|❌|🚀|🔍|🎯|➡️/g, "")),
    );
  };

  const doStep = useCallback(() => {
    const st = stateRef.current;
    if (st.phase === "done") return;

    let newArr = [...st.array],
      nlow = st.low,
      nhigh = st.high,
      ni = st.i,
      nj = st.j,
      npivot = st.key,
      nph = st.phase,
      nStats = { ...st.stats },
      nStack = [...st.callStack],
      exp = "";

    // ─── START / IDLE ─────────────────────────
    if (st.phase === "start" || st.phase === "idle") {
      if (nStack.length === 0) {
        nph = "done";

        exp = `✅ SORT COMPLETE:

All subarrays have been processed.

Each pivot has been placed in its correct position,
so the entire array is now sorted from smallest to largest.`;
      } else {
        const current = nStack.pop();
        nlow = current.low;
        nhigh = current.high;

        if (nlow >= nhigh) {
          exp = `⚪ BASE CASE:

Subarray [${nlow}..${nhigh}] has ${
            nlow === nhigh ? "only one element" : "no elements"
          }.

👉 Such a subarray is already sorted, so we skip it
and move to the next pending segment.`;

          nph = "idle";
        } else {
          npivot = newArr[nhigh];
          ni = nlow - 1;
          nj = nlow;
          nph = "partition";

          exp = `🚀 PARTITION START:

We are working on subarray [${nlow}..${nhigh}].

👉 Pivot selected: ${npivot} (last element)

Goal:
- Move all values ≤ ${npivot} to the left
- Move all values > ${npivot} to the right

We now scan elements from index ${nlow} to ${nhigh - 1}.`;
        }
      }
    }

    // ─── PARTITION ─────────────────────────
    else if (st.phase === "partition") {
      if (nj < nhigh) {
        nStats.cmp++;

        const current = newArr[nj];

        if (current <= npivot) {
          ni++;
          nStats.swp++;
          [newArr[ni], newArr[nj]] = [newArr[nj], newArr[ni]];

          exp = `🔍 COMPARISON:

👉 Current element: ${current} (index ${nj})
👉 Pivot: ${npivot}

Since ${current} ≤ ${npivot},

👉 it belongs to the LEFT partition.

We expand the left boundary to index ${ni}
and place ${current} there by swapping.`;
        } else {
          exp = `🔍 COMPARISON:

👉 Current element: ${current} (index ${nj})
👉 Pivot: ${npivot}

Since ${current} > ${npivot},

👉 it belongs to the RIGHT partition.

So we leave it in place and continue scanning.`;
        }

        nj++;
      } else {
        ni++;
        const pivotVal = newArr[nhigh];

        nStats.swp++;
        [newArr[ni], newArr[nhigh]] = [newArr[nhigh], newArr[ni]];
        nStats.piv++;

        if (ni + 1 < nhigh) nStack.push({ low: ni + 1, high: nhigh });
        if (nlow <= ni - 1) nStack.push({ low: nlow, high: ni - 1 });

        nph = "idle";
        npivot = null;

        exp = `🎯 PIVOT PLACEMENT:

All elements have been checked.

👉 Pivot ${pivotVal} is now placed at index ${ni}.

Now:
- Left side contains values ≤ ${pivotVal}
- Right side contains values > ${pivotVal}

This position is final for the pivot.

➡️ Next, we repeat the same process on left and right subarrays.`;
      }
    }

    setHistory((prev) => [...prev, st]);
    setArray(newArr);
    setLow(nlow);
    setHigh(nhigh);
    setI(ni);
    setJ(nj);
    setKey(npivot);
    setPhase(nph);
    setStats(nStats);
    setCallStack(nStack);
    setExplanation(exp);

    if (!isPlaying) speak(exp);
  }, [isPlaying, isMuted]);

  const codeSnippets = {
    Java: `void quickSort(int[] arr, int low, int high) {\n  if (low < high) {\n    int pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}\n\nint partition(int[] arr, int low, int high) {\n  int pivot = arr[high], i = low - 1;\n  for (int j = low; j < high; j++) {\n    if (arr[j] <= pivot) swap(arr, ++i, j);\n  }\n  swap(arr, i + 1, high); return i + 1;\n}`,
    Python: `def quick_sort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quick_sort(arr, low, pi - 1)\n        quick_sort(arr, pi + 1, high)\n\ndef partition(arr, low, high):\n    pivot = arr[high]\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[high] = arr[high], arr[i+1]\n    return i + 1`,
    "C++": `int partition(int arr[], int low, int high) {\n    int pivot = arr[high], i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (arr[j] <= pivot) swap(arr[++i], arr[j]);\n    }\n    swap(arr[i + 1], arr[high]);\n    return i + 1;\n}\n\nvoid quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}`,
    C: `int partition(int arr[], int low, int high) {\n    int pivot = arr[high], i = low - 1, temp;\n    for (int j = low; j < high; j++) {\n        if (arr[j] <= pivot) {\n            i++; temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\n        }\n    }\n    temp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = temp;\n    return i + 1;\n}`,
  };

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === QUICK_QUIZ[quiz.step].correct;
    setQuiz((prev) => ({
      ...prev,
      selectedIdx: idx,
      score: isCorrect ? prev.score + 20 : prev.score,
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
      else setQuiz((prev) => ({ ...prev, finished: true, active: false }));
    }, 800);
  };

  const handleReset = () => {
    setArray(generateArray());
    setI(-1);
    setJ(0);
    setKey(null);
    setPhase("start");
    setStats({ cmp: 0, swp: 0, piv: 0 });
    setCallStack([{ low: 0, high: 13 }]);
    setHistory([]);
    setIsPlaying(false);
    setQuiz({
      active: false,
      step: 0,
      score: 0,
      finished: false,
      selectedIdx: null,
      isLock: false,
    });
    setExplanation("Lab reset. Fresh array ready.");
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
          padding: "20px 40px",
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
            Quick Sort Mastery Explorer
          </div>
        </header>

        <div
          style={{
            display: "flex",
            gap: "15px",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <StatBox
            label="COMPARISONS"
            value={stats.cmp}
            color={T.cyan}
            desc="Logic Checks"
          />
          <StatBox
            label="SWAPS"
            value={stats.swp}
            color={T.pink}
            desc="Elements Moved"
          />
          <StatBox
            label="PIVOT VALUE"
            value={key ?? "-"}
            color={T.orange}
            desc="Active Reference"
          />
          <StatBox
            label="POINTER (i)"
            value={i}
            color={T.purple}
            desc="Partition Index"
          />
        </div>

        <div style={styles.canvas}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              height: "180px",
            }}
          >
            {array.map((val, idx) => (
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
                    width: "40px",
                    height: `${val * 1.8}px`,
                    backgroundColor:
                      phase === "done"
                        ? T.green
                        : key === val
                          ? T.orange
                          : idx === j
                            ? T.pink
                            : idx === i
                              ? T.purple
                              : T.surface,
                    borderRadius: "4px 4px 0 0",
                    border: `1px solid ${idx === i || idx === j ? "#fff" : T.border}`,
                    transition: "0.3s",
                  }}
                />
                <div
                  style={{
                    fontSize: "10px",
                    marginTop: "6px",
                    fontWeight: "bold",
                    color:
                      key === val
                        ? T.orange
                        : idx === i
                          ? T.purple
                          : idx === j
                            ? T.pink
                            : T.textMuted,
                  }}
                >
                  {key === val
                    ? "PIV"
                    : idx === i
                      ? "i ↑"
                      : idx === j
                        ? "j ↑"
                        : idx}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.narrativeBox}>
          <div style={styles.narrativeHeader}>
            <span>
              {quiz.active ? "MASTERY CHALLENGE" : "LIVE LOGIC INTERPRETER"}
            </span>
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
                  gridTemplateColumns: "1.5fr 2fr",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  {QUICK_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {QUICK_QUIZ[quiz.step].options.map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        ...styles.optBtn,
                        background:
                          quiz.selectedIdx === idx
                            ? idx === QUICK_QUIZ[quiz.step].correct
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

        <div style={styles.controls}>
          <button
            style={styles.btnSecondary}
            onClick={() => {
              if (history.length > 0) {
                const p = history.pop();
                setArray(p.array);
                setI(p.i);
                setJ(p.j);
                setKey(p.key);
                setPhase(p.phase);
                setStats(p.stats);
                setCallStack(p.callStack);
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
              Quick Sort is a Divide & Conquer algorithm. It picks a pivot and
              partitions the array such that left side ≤ pivot &lt; right side.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>Cost Efficiency</h2>
            <p style={styles.footerP}>
              <b>Time Complexity:</b> Average O(n log n), Worst O(n²).
              <br />
              <b>Space Complexity:</b> O(log n) for recursion stack.
            </p>
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
                style={styles.copyBtn}
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
    <div style={{ fontSize: "10px", fontWeight: 700, color: T.textMuted }}>
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
    background: "linear-gradient(90deg, #6366f1, #22d3ee)",
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
    padding: "18px 24px",
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
    border: `1px solid ${T.border}`,
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
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
