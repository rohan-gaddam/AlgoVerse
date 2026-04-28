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

  // Responsiveness State
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

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
            exp += `\n\n✅ Yes.\n\n${current} is greater than ${nk}, so it is in the wrong position.\n\n👉 We need to shift it one step to the right to make space for the key.`;
          } else {
            nph = "insert";
            exp += `\n\n❌ No.\n\n${current} is not greater than ${nk}.\n\n👉 This means we have found the correct position to insert the key.`;
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

👉 Now the subarray from index 0 to ${ni} is sorted.\n\nWe move to the next element and repeat the process.`;
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

  useEffect(() => {
    if (isPlaying && phase !== "done") {
      autoPlayRef.current = setInterval(doStep, 1500);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, phase, doStep]);

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
            Insertion Sort Master Explorer
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
            label="SHIFTS"
            value={stats.shf}
            color={T.pink}
            desc="Movements"
            isMobile={isMobile}
          />
          <StatBox
            label="KEY VALUE"
            value={key ?? "-"}
            color={T.orange}
            desc="Active Target"
            isMobile={isMobile}
          />
          <StatBox
            label="POINTER (i)"
            value={i}
            color={T.purple}
            desc="Progress"
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
                      width: isMobile ? "18px" : "45px", // FIXED: Width for desktop
                      height: `${val * (isMobile ? 1.3 : 2.0)}px`,
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
                      fontSize: isMobile ? "8px" : "10px",
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
                  {INSERTION_QUIZ[quiz.step].q}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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

        <div style={styles.controls(isMobile)}>
          <button
            style={styles.btnSecondary(isMobile)}
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
              Insertion Sort treats the array as two parts: Sorted and Unsorted.
              It picks the next item from the unsorted side and inserts it into
              its correct position.
            </p>
          </div>
          <div style={styles.infoCard(isMobile)}>
            <h2 style={styles.footerH2(isMobile)}>Efficiency</h2>
            <p style={styles.footerP(isMobile)}>
              <b>Time:</b> Worst O(n²), Best O(n).
              <br />
              <b>Space:</b> O(1) auxiliary space (In-place).
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
    fontSize: isMobile ? "2rem" : "3.5rem",
    fontWeight: "900",
    margin: 0,
    background: "linear-gradient(90deg, #6366f1, #22d3ee)",
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
