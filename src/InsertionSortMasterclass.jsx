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
const INSERTION_QUIZ = [
  {
    q: "In the worst-case scenario (a reverse-sorted array), what is the time complexity of Insertion Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    correct: 2,
  },
  {
    q: "Which data state represents the 'Best Case' for Insertion Sort, resulting in O(n) time?",
    options: [
      "Reverse Sorted",
      "Randomly Shuffled",
      "Already Sorted",
      "Array with all unique values",
    ],
    correct: 2,
  },
  {
    q: "Insertion Sort is considered 'Stable'. What does this guarantee?",
    options: [
      "The speed is always the same",
      "Relative order of equal elements is preserved",
      "It uses O(n) extra memory",
      "It only works on integers",
    ],
    correct: 1,
  },
  {
    q: "What is the Auxiliary Space Complexity of Insertion Sort?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
  },
  {
    q: "During the i-th iteration of the loop, what is true about the subarray from index 0 to i?",
    options: [
      "It contains the i smallest elements",
      "It is sorted relative to itself",
      "It is in its final sorted position",
      "It is completely unsorted",
    ],
    correct: 1,
  },
];

const generateArray = () =>
  Array.from({ length: 14 }, () => Math.floor(Math.random() * 80) + 15);

export default function InsertionSortMasterclass() {
  const [array, setArray] = useState(() => generateArray());
  const [history, setHistory] = useState([]);
  const [i, setI] = useState(1);
  const [j, setJ] = useState(0);
  const [key, setKey] = useState(null);
  const [phase, setPhase] = useState("start");
  const [stats, setStats] = useState({ cmp: 0, shf: 0, ins: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanation, setExplanation] = useState(
    "Ready to learn? Click 'Next Step' to begin the first iteration.",
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
  const stateRef = useRef({ array, i, j, key, phase, stats });

  useEffect(() => {
    stateRef.current = { array, i, j, key, phase, stats };
  }, [array, i, j, key, phase, stats]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (isMuted || !window.speechSynthesis || isPlaying || quiz.active) return;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        text.replace(
          /PICK KEY:|COMPARE:|SHIFT:|INSERT:|EDGE CASE:|SUCCESS:/g,
          "",
        ),
      ),
    );
  };

  const doStep = useCallback(() => {
    const st = stateRef.current;
    if (st.phase === "done") return;

    let newArr = [...st.array];
    let ni = st.i,
      nj = st.j,
      nk = st.key,
      nph = st.phase;
    let nStats = { ...st.stats };
    let exp = "";

    switch (st.phase) {
      case "start":
        if (ni >= newArr.length) {
          nph = "done";

          exp = `✅ SORT COMPLETE:

All elements have been processed one by one.

Each element has been inserted into its correct position,
so the entire array is now sorted from left to right.`;
        } else {
          nk = newArr[ni];
          nj = ni - 1;
          nph = "compare";

          exp = `🔑 PICK KEY:

We select the element ${nk} at index ${ni}.

👉 Everything before index ${ni} is already sorted.
Now our goal is to insert ${nk} into its correct position
within this sorted portion.`;
        }
        break;

      case "compare":
        nStats.cmp++;

        if (nj >= 0) {
          const current = newArr[nj];

          exp = `🔍 COMPARISON:

👉 Key: ${nk}
👉 Comparing with: ${current} (index ${nj})

We check: Is ${current} greater than ${nk}?`;

          if (current > nk) {
            nph = "shift";

            exp += `

✅ Yes.

${current} is greater than ${nk}, so it is in the wrong position.

👉 We need to shift it one step to the right
to make space for the key.`;
          } else {
            nph = "insert";

            exp += `

❌ No.

${current} is not greater than ${nk}.

👉 This means we have found the correct position
to insert the key.`;
          }
        } else {
          nph = "insert";

          exp = `⚠️ REACHED START:

We have moved past the beginning of the array.

👉 This means ${nk} is the smallest element so far,
and it should be placed at index 0.`;
        }
        break;

      case "shift":
        nStats.shf++;

        const shiftedVal = newArr[nj];
        newArr[nj + 1] = shiftedVal;

        exp = `➡️ SHIFT STEP:

We move ${shiftedVal} from index ${nj} to index ${nj + 1}.

👉 This creates space for the key ${nk}.

Now we continue checking elements on the left.`;

        nj = nj - 1;
        nph = "compare";
        break;

      case "insert":
        nStats.ins++;

        newArr[nj + 1] = nk;

        exp = `📥 INSERT STEP:

We place the key ${nk} at index ${nj + 1}.

👉 Now the subarray from index 0 to ${ni}
is sorted.

We move to the next element and repeat the process.`;

        ni = ni + 1;
        nk = null;
        nph = "start";
        break;

      default:
        break;
    }

    setHistory((prev) => [...prev, st]);
    setArray(newArr);
    setI(ni);
    setJ(nj);
    setKey(nk);
    setPhase(nph);
    setStats(nStats);
    setExplanation(exp);

    if (!isPlaying) speak(exp);
  }, [isPlaying, isMuted]);

  const handleAnswer = (idx) => {
    if (quiz.isLock) return;
    const isCorrect = idx === INSERTION_QUIZ[quiz.step].correct;
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
        mastery["Insertion Sort"] = Math.max(
          mastery["Insertion Sort"] || 0,
          currentScore,
        );
        localStorage.setItem("algoVerseMastery", JSON.stringify(mastery));
      }
    }, 800);
  };

  const handleReset = () => {
    setArray(generateArray());
    setI(1);
    setJ(0);
    setKey(null);
    setPhase("start");
    setStats({ cmp: 0, shf: 0, ins: 0 });
    setHistory([]);
    setIsPlaying(false);
    setExplanation("Lab reset. Fresh unsorted array ready.");
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
    Java: `void sort(int arr[]) {\n  for (int i = 1; i < arr.length; i++) {\n    int key = arr[i], j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n}`,
    Python: `def insertion_sort(arr):\n  for i in range(1, len(arr)):\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and arr[j] > key:\n      arr[j + 1] = arr[j]\n      j -= 1\n    arr[j + 1] = key`,
    "C++": `void insertionSort(int arr[], int n) {\n  for (int i = 1; i < n; i++) {\n    int key = arr[i], j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n}`,
    C: `void insertionSort(int arr[], int n) {\n  for (int i = 1; i < n; i++) {\n    int k = arr[i], j = i - 1;\n    while (j >= 0 && arr[j] > k) {\n      arr[j+1] = arr[j]; j--;\n    }\n    arr[j+1] = k;\n  }\n}`,
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
            Insertion Sort Master Explorer
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
            desc="Checks"
          />
          <StatBox
            label="SHIFTS"
            value={stats.shf}
            color={T.pink}
            desc="Movements"
          />
          <StatBox
            label="KEY VALUE"
            value={key ?? "-"}
            color={T.orange}
            desc="Target"
          />
          <StatBox
            label="POINTER (i)"
            value={i}
            color={T.purple}
            desc="Progress"
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
            {array.map((val, idx) => {
              const isKey =
                idx === i && phase !== "start" && phase !== "insert";
              const isComparing =
                idx === j && (phase === "compare" || phase === "shift");
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
                      width: "42px",
                      height: `${val * 1.8}px`,
                      backgroundColor:
                        phase === "done"
                          ? T.green
                          : isKey
                            ? T.orange
                            : isComparing
                              ? T.pink
                              : isSorted
                                ? T.purple
                                : T.surface,
                      borderRadius: "4px 4px 0 0",
                      border: `1px solid ${isKey || isComparing ? "#fff" : T.border}`,
                      transform: isKey ? "translateY(-10px)" : "none",
                      transition: "0.3s",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "6px",
                      fontWeight: "bold",
                      color: isKey
                        ? T.orange
                        : isComparing
                          ? T.pink
                          : T.textMuted,
                    }}
                  >
                    {isKey ? "KEY" : idx === i ? "i" : idx === j ? "j" : idx}
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
                  gridTemplateColumns: "1.5fr 2fr",
                  gap: "20px",
                }}
              >
                <div style={{ fontSize: "18px" }}>
                  {INSERTION_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {INSERTION_QUIZ[quiz.step].options.map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        ...styles.optBtn,
                        background:
                          quiz.selectedIdx === idx
                            ? idx === INSERTION_QUIZ[quiz.step].correct
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
              Insertion Sort treats the array as two parts: Sorted and Unsorted.
              It picks the next item from the unsorted side and inserts it into
              its correct position.
            </p>
          </div>
          <div style={styles.infoCard}>
            <h2 style={styles.footerH2}>Efficiency</h2>
            <p style={styles.footerP}>
              <b>Time:</b> Worst O(n²), Best O(n).
              <br />
              <b>Space:</b> O(1) auxiliary space (In-place).
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
    background: "#818cf8",
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
