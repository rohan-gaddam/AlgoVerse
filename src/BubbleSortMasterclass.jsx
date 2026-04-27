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
const BUBBLE_QUIZ = [
  {
    q: "What is the worst-case time complexity of Bubble Sort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(1)"],
    correct: 2,
  },
  {
    q: "After the first full pass, what can we guarantee?",
    options: [
      "The array is fully sorted",
      "The smallest element is at index 0",
      "The largest element is at the last index",
      "The array is partially reversed",
    ],
    correct: 2,
  },
  {
    q: "How can Bubble Sort be optimized to achieve O(n) best-case?",
    options: [
      "Sort right to left",
      "Use a swap flag",
      "Skip every second element",
      "Use recursion",
    ],
    correct: 1,
  },
  {
    q: "Is Bubble Sort a 'Stable' sorting algorithm?",
    options: ["Yes", "No", "Only for small arrays", "Only if optimized"],
    correct: 0,
  },
  {
    q: "What is the Auxiliary Space Complexity of Bubble Sort?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
  },
];

const generateArray = () =>
  Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 15);

export default function BubbleSortMasterclass() {
  const [array, setArray] = useState(() => generateArray());
  const [history, setHistory] = useState([]);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [phase, setPhase] = useState("start");
  const [stats, setStats] = useState({ cmp: 0, swp: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanation, setExplanation] = useState(
    "Ready to bubble up? Click 'Next Step' to begin the first pass.",
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
  const stateRef = useRef({ array, i, j, phase, stats });

  useEffect(() => {
    stateRef.current = { array, i, j, phase, stats };
  }, [array, i, j, phase, stats]);

  const cleanText = (text) => {
    return text
      .replace(/\[.*?\]/g, "") // remove [i], [j]
      .replace(/[{}()]/g, "") // remove brackets
      .replace(/=/g, " becomes ") // replace =
      .replace(/</g, " is less than ")
      .replace(/>/g, " is greater than ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getBestVoice = () => {
    const voices = speechSynthesis.getVoices();

    // Try to get good natural voice
    return (
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.name.includes("Microsoft")) ||
      voices.find((v) => v.name.includes("Female")) ||
      voices[0]
    );
  };

  const speak = (text) => {
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // 🔥 ADD THIS LINE
    utterance.voice = getBestVoice();

    // Improve clarity
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    speechSynthesis.cancel(); // stop previous speech
    speechSynthesis.speak(utterance);
  };
  const doStep = useCallback(() => {
    const st = stateRef.current;
    if (st.phase === "done") return;

    let newArr = [...st.array];
    let ni = st.i,
      nj = st.j,
      nph = st.phase;
    let nStats = { ...st.stats };
    let exp = "";

    switch (st.phase) {
      case "start":
        if (ni >= newArr.length - 1) {
          nph = "done";

          exp = `✅ SORT COMPLETE:

After all passes, every element has moved to its correct position.

👉 The largest elements settled at the end in each pass,
so the array is now fully sorted from smallest to largest.`;
        } else {
          nph = "compare";

          exp = `🔁 NEW PASS:

We start pass ${ni + 1}.

👉 In this pass, we compare adjacent elements
and push the largest value toward the end.

Each pass guarantees one element reaches its final position.`;
        }
        break;

      case "compare":
        nStats.cmp++;

        const left = newArr[nj];
        const right = newArr[nj + 1];

        exp = `🔍 COMPARISON:

👉 Comparing ${left} (index ${nj}) with ${right} (index ${nj + 1})

We check: Is ${left} greater than ${right}?`;

        if (left > right) {
          nph = "swap";

          exp += `

✅ Yes.

${left} is larger, so it is in the wrong order.

👉 We swap them so the larger value moves one step to the right.`;
        } else {
          exp += `

❌ No.

They are already in correct order.

👉 No swap needed, we move forward.`;

          if (nj < newArr.length - ni - 2) {
            nj = nj + 1;
            nph = "compare";
          } else {
            ni = ni + 1;
            nj = 0;
            nph = "start";

            exp += `

🏁 PASS COMPLETE:

The largest element of this pass is now fixed at the end.`;
          }
        }
        break;

      case "swap":
        nStats.swp++;

        const a = newArr[nj];
        const b = newArr[nj + 1];

        [newArr[nj], newArr[nj + 1]] = [b, a];

        exp = `🔄 SWAP:

We swap ${a} and ${b}.

👉 ${a} moves right, and ${b} moves left.

This helps push larger elements toward the end step by step.`;

        if (nj < newArr.length - ni - 2) {
          nj = nj + 1;
          nph = "compare";
        } else {
          ni = ni + 1;
          nj = 0;
          nph = "start";

          exp += `

🏁 PASS COMPLETE:

One more largest element has reached its correct position.`;
        }
        break;

      default:
        break;
    }

    setHistory((prev) => [...prev, st]);
    setArray(newArr);
    setI(ni);
    setJ(nj);
    setPhase(nph);
    setStats(nStats);
    setExplanation(exp);

    if (!isPlaying) speak(exp);
  }, [isPlaying, isMuted]);

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === BUBBLE_QUIZ[quiz.step].correct;
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
        mastery["Bubble Sort"] = Math.max(
          mastery["Bubble Sort"] || 0,
          currentScore,
        );
        localStorage.setItem("algoVerseMastery", JSON.stringify(mastery));
      }
    }, 800);
  };

  const handleReset = () => {
    setArray(generateArray());
    setI(0);
    setJ(0);
    setPhase("start");
    setStats({ cmp: 0, swp: 0 });
    setHistory([]);
    setIsPlaying(false);
    setExplanation("Lab reset. Ready to bubble up!");
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
    Java: `void sort(int arr[]) {\n  int n = arr.length;\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) {\n        int temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;\n      }\n}`,
    Python: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`,
    "C++": `void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);\n}`,
    C: `void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) { /* swap logic */ }\n}`,
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
          display: "flex",
          flexDirection: "column",
          padding: "clamp(10px, 3vw, 20px) clamp(12px, 5vw, 40px)",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
          overflow: "visible",
          justifyContent: "space-between",
        }}
      >
        <button style={styles.btnBack} onClick={() => navigate("/")}>
          ← Back
        </button>
        <header style={{ textAlign: "center" }}>
          <h1 style={styles.title}>AlgoVerse</h1>
          <div style={{ fontSize: "11px", color: T.textMuted }}>
            Bubble Sort Master Explorer
          </div>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(8px, 2vw, 15px)",
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
            desc="Movements"
          />
          <StatBox
            label="PASS NUMBER"
            value={i + 1}
            color={T.purple}
            desc="Outer Loop"
          />
          <StatBox
            label="CHECKING (j)"
            value={j}
            color={T.orange}
            desc="Target Index"
          />
        </div>

        <div style={styles.canvas}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "clamp(4px, 1.5vw, 10px)",
              height: "clamp(120px, 30vw, 180px)",
            }}
          >
            {array.map((val, idx) => {
              const isComparing =
                (idx === j || idx === j + 1) &&
                phase !== "start" &&
                phase !== "done";
              const isSorted = idx >= array.length - i;
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
                      width: "clamp(16px, 5vw, 42px)",
                      height: `${val * 1.5}px`,
                      backgroundColor:
                        phase === "done"
                          ? T.green
                          : isComparing
                            ? T.pink
                            : isSorted
                              ? T.purple
                              : T.surface,
                      borderRadius: "4px 4px 0 0",
                      border: `1px solid ${isComparing ? "#fff" : T.border}`,
                      transition: "0.3s",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "6px",
                      fontWeight: "bold",
                      color: isComparing ? T.pink : T.textMuted,
                    }}
                  >
                    {isComparing ? (idx === j ? "j" : "j+1") : idx}
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  {BUBBLE_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {BUBBLE_QUIZ[quiz.step].options.map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        ...styles.optBtn,
                        background:
                          quiz.selectedIdx === idx
                            ? idx === BUBBLE_QUIZ[quiz.step].correct
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
                setPhase(p.phase);
                setStats(p.stats);
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
          </button>{" "}
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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(20px, 5vw, 60px)",
          boxSizing: "border-box",
          scrollSnapAlign: "start",
        }}
      >
        <div style={styles.footerGrid}>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>How it Works</h2>
            <p style={styles.footerP}>
              Bubble Sort steps through the list, compares adjacent elements and
              swaps them if they are in the wrong order. This repeats until the
              largest elements "bubble" to the end.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>Efficiency</h2>
            <p style={styles.footerP}>
              <b>Time:</b> Worst O(n²), Best O(n) if optimized.
              <br />
              <b>Space:</b> O(1) auxiliary space (In-place).
            </p>
          </div>
        </div>
        <div style={{ ...styles.infoCard, marginTop: "40px" }}>
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
    background: "linear-gradient(90deg, #60a5fa, #3b82f6, #0ea5e9)",
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
    color: "#f43f5e",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  phaseTag: {
    background: "#f43f5e",
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
  narrativeText: {
    fontSize: "clamp(13px, 3.5vw, 17px)",
    color: T.textMuted,
    lineHeight: 1.4,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
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
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
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
    background: "#111827",
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
