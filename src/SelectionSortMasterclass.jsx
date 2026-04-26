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

// ─── QUIZ DATA ──────────────────────────────────────────────
const SELECTION_QUIZ = [
  {
    q: "What is the time complexity of Selection Sort in the best-case?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    correct: 2,
  },
  {
    q: "After 'k' passes, what are the first 'k' elements?",
    options: [
      "Sorted relative to each other",
      "The k smallest elements in final positions",
      "In random order",
      "The k largest elements",
    ],
    correct: 1,
  },
  {
    q: "Standard Selection Sort is generally considered...",
    options: ["Stable", "Unstable", "Recursive", "Adaptive"],
    correct: 1,
  },
  {
    q: "What is the Auxiliary Space Complexity?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
  },
  {
    q: "How many swaps are performed in an array of size N?",
    options: ["N log N", "N²", "Maximum N-1", "Varies based on input"],
    correct: 2,
  },
];

const generateArray = () =>
  Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 15);

export default function SelectionSortMasterclass() {
  const [arr, setArr] = useState(() => generateArray());
  const [history, setHistory] = useState([]);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(1);
  const [minIdx, setMinIdx] = useState(0);
  const [phase, setPhase] = useState("start");
  const [stats, setStats] = useState({ cmp: 0, swp: 0 });
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
  const [explanation, setExplanation] = useState(
    "Ready to select? Click 'Next Step' to begin searching for the minimum.",
  );

  const navigate = useNavigate();
  const autoPlayRef = useRef(null);
  const stateRef = useRef({ arr, i, j, minIdx, phase, stats });

  useEffect(() => {
    stateRef.current = { arr, i, j, minIdx, phase, stats };
  }, [arr, i, j, minIdx, phase, stats]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (isMuted || !window.speechSynthesis || isPlaying || quiz.active) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const doStep = useCallback(() => {
    const {
      arr: currentArr,
      i: si,
      j: sj,
      minIdx: sm,
      phase: sp,
      stats: ss,
    } = stateRef.current;
    let newArr = [...currentArr];
    let ni = si,
      nj = sj,
      nm = sm,
      nph = sp;
    let nStats = { ...ss };
    let exp = "";

    if (sp === "done") return;

    switch (sp) {
      case "start":
        if (si >= newArr.length - 1) {
          nph = "done";
          exp = `✅ SORT COMPLETE:
All positions have been processed.
Each element is now placed in its correct sorted position.
The array is fully sorted.`;
        } else {
          nm = si;
          nj = si + 1;
          nph = "compare";

          exp = `🚀 NEW PASS STARTS:

We begin at index ${si} with value ${newArr[si]}.
👉 Assume this is the smallest element for now.

Now we scan the remaining elements (from index ${si + 1} to end)
to find if any value is smaller than ${newArr[si]}.`;
        }
        break;

      case "compare":
        nStats.cmp++;

        const current = newArr[sj];
        const minVal = newArr[nm];

        exp = `🔍 COMPARISON STEP:

👉 Current element: ${current} (index ${sj})
👉 Current minimum: ${minVal} (index ${nm})

We check: Is ${current} smaller than ${minVal}?`;

        if (current < minVal) {
          nm = sj;
          exp += `

✅ Yes! ${current} is smaller than ${minVal}.
So we update our minimum.

👉 New minimum is ${current} at index ${sj}.`;
        } else {
          exp += `

❌ No. ${current} is not smaller than ${minVal}.
So we keep ${minVal} as the current minimum.`;
        }

        if (sj < newArr.length - 1) {
          nj = sj + 1;
          exp += `

➡️ Moving to the next element to continue searching.`;
        } else {
          nph = "swap";
          exp += `

🏁 End of scan reached.
We have found the smallest element for this pass.`;
        }
        break;

      case "swap":
        nStats.swp++;

        const minValue = newArr[nm];
        const startValue = newArr[si];

        exp = `🔄 SWAP STEP:

👉 Smallest element found: ${minValue} (index ${nm})
👉 Position to fill: index ${si}

We now swap ${minValue} with ${startValue}
to place the correct element at index ${si}.`;

        [newArr[nm], newArr[si]] = [newArr[si], newArr[nm]];

        exp += `

✅ After swapping:
👉 ${minValue} is now correctly placed at index ${si}.`;

        ni = si + 1;
        nm = ni;
        nj = ni + 1;
        nph = "start";

        exp += `

➡️ Moving to the next position (index ${ni}) to repeat the process.`;
        break;

      default:
        break;
    }

    setHistory((prev) => [...prev, { ...stateRef.current }]);
    setArr(newArr);
    setI(ni);
    setJ(nj);
    setMinIdx(nm);
    setPhase(nph);
    setStats(nStats);
    setExplanation(exp);
    if (!isPlaying) speak(exp);
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (isPlaying && phase !== "done") {
      autoPlayRef.current = setInterval(doStep, 600);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, phase, doStep]);

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === SELECTION_QUIZ[quiz.step].correct;
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
        mastery["Selection Sort"] = Math.max(
          mastery["Selection Sort"] || 0,
          currentScore,
        );
        localStorage.setItem("algoVerseMastery", JSON.stringify(mastery));
      }
    }, 1000);
  };

  const handleReset = () => {
    setArr(generateArray());
    setI(0);
    setJ(1);
    setMinIdx(0);
    setPhase("start");
    setStats({ cmp: 0, swp: 0 });
    setHistory([]);
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
    setExplanation("Lab reset. Ready to scan.");
  };

  const codeSnippets = {
    Java: `void selectionSort(int arr[]) {\n  for (int i = 0; i < arr.length-1; i++) {\n    int min = i;\n    for (int j = i+1; j < arr.length; j++)\n      if (arr[j] < arr[min]) min = j;\n    int temp = arr[min]; arr[min] = arr[i]; arr[i] = temp;\n  }\n}`,
    Python: `def selection_sort(arr):\n    for i in range(len(arr)):\n        min_idx = i\n        for j in range(i + 1, len(arr)):\n            if arr[min_idx] > arr[j]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    "C++": `void selectionSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++) {\n    int min = i;\n    for (int j = i+1; j < n; j++)\n      if (arr[j] < arr[min]) min = j;\n    swap(arr[min], arr[i]);\n  }\n}`,
    C: `void selectionSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++) {\n    int m = i;\n    for (int j = i+1; j < n; j++)\n      if (arr[j] < arr[m]) m = j;\n    int t = arr[m]; arr[m] = arr[i]; arr[i] = t;\n  }\n}`,
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
      {/* 🟢 PAGE 1: VISUALIZER */}
      <section
        style={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          padding: "20px 40px",
          boxSizing: "border-box",
        }}
      >
        <button style={styles.btnBack} onClick={() => navigate("/")}>
          ← Back
        </button>
        <header style={{ textAlign: "center", marginBottom: "10px" }}>
          <h1 style={styles.title}>AlgoVerse</h1>
          <div style={{ fontSize: "11px", color: T.textMuted }}>
            Selection Sort Mastery Explorer
          </div>
        </header>

        <div
          style={{
            display: "flex",
            gap: "15px",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto 15px",
          }}
        >
          <StatBox
            label="COMPARISONS"
            value={stats.cmp}
            color={T.cyan}
            sub="Total Logic Checks"
          />
          <StatBox
            label="SWAPS"
            value={stats.swp}
            color={T.pink}
            sub="Elements Placed"
          />
          <StatBox
            label="MIN INDEX"
            value={minIdx}
            color={T.orange}
            sub={`Value: ${arr[minIdx]}`}
          />
          <StatBox
            label="ACTIVE (i)"
            value={i}
            color={T.purple}
            sub={`Target Slot`}
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
            {arr.map((val, idx) => {
              const isI = i === idx;
              const isJ = j === idx && phase === "compare";
              const isMin = minIdx === idx;
              const isSorted = idx < i;
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
                      width: "35px",
                      height: `${val * 1.8}px`,
                      background:
                        phase === "done"
                          ? T.green
                          : isMin
                            ? T.orange
                            : isJ
                              ? T.pink
                              : isSorted
                                ? T.purple
                                : T.surface,
                      border: `1px solid ${isI || isJ || isMin ? "#fff" : T.border}`,
                      borderRadius: "4px 4px 0 0",
                      transition: "0.3s",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        marginTop: "-15px",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "6px",
                      fontWeight: "bold",
                      color: isMin
                        ? T.orange
                        : isI
                          ? T.purple
                          : isJ
                            ? T.pink
                            : T.textMuted,
                    }}
                  >
                    {isMin ? "MIN" : isI ? "i" : isJ ? "j" : idx}
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
                    : phase.toUpperCase()}
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
                  Selection Sort concepts unlocked.
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
                  gridTemplateColumns: "1fr 2fr",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "16px" }}>
                  {SELECTION_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {SELECTION_QUIZ[quiz.step].options.map((opt, i) => {
                    const isCorrect = i === SELECTION_QUIZ[quiz.step].correct;
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
              explanation
            )}
          </div>
        </div>

        <div style={styles.controls}>
          <button
            style={styles.btnSecondary}
            onClick={() => {
              if (history.length > 0) {
                const prev = history[history.length - 1];
                setArr(prev.arr);
                setI(prev.i);
                setJ(prev.j);
                setMinIdx(prev.minIdx);
                setPhase(prev.phase);
                setStats(prev.stats);
                setHistory(history.slice(0, -1));
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

      {/* 🔵 PAGE 2: INFO & CODE */}
      <section
        style={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
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
              Selection Sort divides the array into a sorted and unsorted part.
              It repeatedly picks the absolute minimum from the unsorted section
              and swaps it with the first unsorted element, effectively growing
              the sorted portion one element at a time.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2
              style={{ color: "#fff", fontSize: "32px", marginBottom: "20px" }}
            >
              Computational Cost
            </h2>
            <p style={styles.footerP}>
              <strong>Time Complexity:</strong> O(N²) — It always performs
              N(N-1)/2 comparisons, even if sorted.
              <br />
              <br />
              <strong>Space Complexity:</strong> O(1) — Only a few pointers are
              stored.
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
    background: "linear-gradient(to right, #10b981, #3b82f6, #6366f1)",
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
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "20px",
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
  footerGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  infoCard: {
    background: T.surface,
    padding: "30px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
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
