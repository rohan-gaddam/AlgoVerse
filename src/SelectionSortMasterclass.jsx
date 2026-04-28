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

  // Responsiveness State
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

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
        overflowY: "auto",
        scrollSnapType: isMobile ? "none" : "y mandatory",
        color: T.textMain,
      }}
    >
      {/* 🟢 PAGE 1: VISUALIZER */}
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
            Selection Sort Mastery Explorer
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
            sub="Logic Checks"
            isMobile={isMobile}
          />
          <StatBox
            label="SWAPS"
            value={stats.swp}
            color={T.pink}
            sub="Placed"
            isMobile={isMobile}
          />
          <StatBox
            label="MIN INDEX"
            value={minIdx}
            color={T.orange}
            sub={`Val: ${arr[minIdx]}`}
            isMobile={isMobile}
          />
          <StatBox
            label="ACTIVE (i)"
            value={i}
            color={T.purple}
            sub={`Slot`}
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
              height: isMobile ? "140px" : "200px",
              width: "100%",
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
                      width: isMobile ? "20px" : "45px", // FIXED: Increased desktop width for better visibility
                      height: `${val * (isMobile ? 1.2 : 2.0)}px`,
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
                        fontSize: isMobile ? "8px" : "11px",
                        fontWeight: 800,
                        marginTop: "-18px",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "8px" : "11px",
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
                    : phase.toUpperCase()}
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
                  {SELECTION_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {SELECTION_QUIZ[quiz.step].options.map((opt, idx) => {
                    const isCorrect = idx === SELECTION_QUIZ[quiz.step].correct;
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
              explanation
            )}
          </div>
        </div>

        <div style={styles.controls(isMobile)}>
          <button
            style={styles.btnSecondary(isMobile)}
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

      {/* 🔵 PAGE 2: INFO & CODE */}
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
              Selection Sort divides the array into a sorted and unsorted part.
              It repeatedly picks the absolute minimum from the unsorted section
              and swaps it with the first unsorted element.
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
              <strong>Time:</strong> O(N²) — Constant N(N-1)/2 comparisons.
              <br />
              <strong>Space:</strong> O(1) — In-place swap logic.
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
    fontSize: isMobile ? "2rem" : "3.5rem",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(to right, #10b981, #3b82f6, #6366f1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
  canvas: (isMobile) => ({
    flex: 1,
    minHeight: isMobile ? "200px" : "260px",
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
