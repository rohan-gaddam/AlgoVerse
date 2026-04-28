import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  // Responsiveness State
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

  const [mastery, setMastery] = useState(() => {
    const saved = localStorage.getItem("algoVerseMastery");
    return saved
      ? JSON.parse(saved)
      : {
          "Insertion Sort": 0,
          "Bubble Sort": 0,
          "Selection Sort": 0,
          "Merge Sort": 0,
          "Binary Search": 0,
          "Two Pointers (Two Sum)": 0,
          "Quick Sort": 0,
        };
  });

  // RESTORED ALL ORIGINAL ANIMATIONS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
      @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      @keyframes floatFast { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
      @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes pulseGlow { 0% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; transform: scale(1); } }
      @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      .grid-bg {
        background-image: linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
        background-size: 50px 50px;
      }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #020617; }
      ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #334155; }
    `;
    document.head.appendChild(style);
  }, []);

  const algorithms = [
    {
      name: "Insertion Sort",
      icon: "📌",
      path: "/insertion",
      desc: "Build sorted portion by inserting elements.",
      complexity: "O(n²)",
      space: "O(1)",
      stable: "Yes",
    },
    {
      name: "Two Pointers (Two Sum)",
      icon: "🎯",
      path: "/two-pointers",
      desc: "Find two numbers that add up to target.",
      complexity: "O(n)",
      space: "O(1)",
      stable: "N/A",
    },
    {
      name: "Bubble Sort",
      icon: "🫧",
      path: "/bubble",
      desc: "Compare and swap adjacent elements",
      complexity: "O(n²)",
      space: "O(1)",
      stable: "Yes",
    },
    {
      name: "Selection Sort",
      icon: "🎯",
      path: "/selection",
      desc: "Select minimum and place correctly",
      complexity: "O(n²)",
      space: "O(1)",
      stable: "No",
    },
    {
      name: "Merge Sort",
      icon: "🔀",
      path: "/merge",
      desc: "Divide and conquer sorting",
      complexity: "O(n log n)",
      space: "O(n)",
      stable: "Yes",
    },
    {
      name: "Binary Search",
      icon: "🔍",
      path: "/binary",
      desc: "Efficient search in sorted arrays",
      complexity: "O(log n)",
      space: "O(1)",
      stable: "N/A",
    },
    {
      name: "Quick Sort",
      icon: "⚡",
      path: "/quick",
      desc: "Fast pivot-based sorting",
      complexity: "O(n log n)",
      space: "O(log n)",
      stable: "No",
    },
  ];

  const filteredAlgorithms = algorithms
    .filter((algo) =>
      (algo.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      onMouseMove={(e) => !isMobile && setMouse({ x: e.clientX, y: e.clientY })}
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="grid-bg"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {!isMobile && (
        <div
          style={{
            position: "fixed",
            top: mouse.y - 200,
            left: mouse.x - 200,
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12), transparent)",
            pointerEvents: "none",
            filter: "blur(100px)",
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "20px" : "clamp(40px, 8vw, 80px) 40px",
          paddingBottom: "100px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* WHY ALGOVERSE SECTION */}
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "30px" : "60px",
            marginBottom: isMobile ? "50px" : "80px",
            alignItems: "center",
            animation: "slideIn 1s ease-out",
          }}
        >
          <div
            style={{
              textAlign: isMobile ? "center" : "left",
              animation: "floatSlow 5s ease-in-out infinite", // RESTORED
              padding: isMobile ? "10px" : "30px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(16, 185, 129, 0.1)",
                padding: "8px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                marginBottom: "20px",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulseGlow 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#10b981",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                ALGO-ENGINE READY
              </span>
            </div>

            <h2
              style={{
                fontSize: isMobile ? "2.5rem" : "3.5rem",
                fontWeight: "900",
                lineHeight: "1.1",
                marginBottom: "20px",
              }}
            >
              Why{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #818cf8, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AlgoVerse?
              </span>
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: isMobile ? "1rem" : "1.2rem",
                lineHeight: "1.6",
                maxWidth: isMobile ? "100%" : "500px",
                fontWeight: "300",
              }}
            >
              Abstract code is hard to grasp. We transform logic into
              interactive cinematic experiences.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            {[
              { label: "Execution", sub: "Live Visuals", icon: "✨" },
              { label: "Voice Logic", sub: "TTS Narrator", icon: "🔊" },
              { label: "Step-by-Step", sub: "Interactive", icon: "📝" },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "20px",
                  background: "rgba(15,23,42,0.6)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  gridColumn: i === 2 && !isMobile ? "span 2" : "auto",
                  animation: `float ${4 + i}s ease-in-out infinite`, // RESTORED
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                  {f.icon}
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    color: "#f8fafc",
                  }}
                >
                  {f.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {f.sub}
                </div>
              </div>
            ))}
            <div
              style={{
                gridColumn: "span 2",
                padding: "15px",
                borderRadius: "20px",
                border: "1px solid rgba(99,102,241,0.2)",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.1))",
                animation: "floatSlow 6s ease-in-out infinite", // RESTORED
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                }}
              >
                <span>JAVA</span> <span>C++</span> <span>C</span>{" "}
                <span>PYTHON</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO AREA */}
        <div
          style={{
            textAlign: "center",
            margin: "40px 0",
            animation: "floatFast 8s ease-in-out infinite",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "3.5rem" : "5.5rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)",
              backgroundSize: "200% auto",
              animation: "gradientMove 4s linear infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-2px",
            }}
          >
            AlgoVerse
          </h1>
          <p
            style={{
              color: "#475569",
              letterSpacing: "4px",
              fontWeight: "600",
              fontSize: "0.8rem",
            }}
          >
            VISUALIZE • UNDERSTAND • MASTER
          </p>
        </div>

        {/* SEARCH BAR */}
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            position: "relative",
            marginBottom: "60px",
            animation: "floatSlow 7s ease-in-out infinite", // RESTORED
          }}
        >
          <input
            type="text"
            placeholder="Search the library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: isMobile ? "16px 25px" : "22px 35px",
              borderRadius: "100px",
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(99,102,241,0.5)",
              color: "#fff",
              outline: "none",
              fontSize: isMobile ? "1rem" : "1.1rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(300px, 1fr))",
            gap: isMobile ? "20px" : "30px",
            width: "100%",
            maxWidth: "1300px",
          }}
        >
          {filteredAlgorithms.map((algo, index) => {
            const progress = mastery[algo.name] || 0;
            return (
              <div
                key={algo.name}
                onClick={() => navigate(algo.path)}
                style={{
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  padding: isMobile ? "25px" : "35px",
                  borderRadius: "28px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                  animation: `float 6s ease-in-out infinite ${index * 0.4}s`, // RESTORED
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform =
                      "translateY(-15px) scale(1.05)";
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(99,102,241,0.3)";
                    e.currentTarget.style.animationPlayState = "paused";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.animationPlayState = "running";
                  }
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                  {algo.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "800",
                    marginBottom: "10px",
                  }}
                >
                  {algo.name}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    marginBottom: "25px",
                    lineHeight: "1.5",
                  }}
                >
                  {algo.desc}
                </p>

                <div style={{ marginBottom: "20px", textAlign: "left" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      marginBottom: "6px",
                      color: progress === 100 ? "#10B981" : "#818cf8",
                    }}
                  >
                    <span>
                      {progress === 100
                        ? "✓ MASTERED"
                        : `PROGRESS: ${progress}%`}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background:
                          progress === 100
                            ? "#10B981"
                            : "linear-gradient(90deg, #6366f1, #22d3ee)",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: "#6366f1",
                        fontWeight: "900",
                      }}
                    >
                      RUNTIME
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#cbd5e1",
                        fontWeight: "600",
                      }}
                    >
                      {algo.complexity}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: "#22d3ee",
                        fontWeight: "900",
                      }}
                    >
                      STABILITY
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#cbd5e1",
                        fontWeight: "600",
                      }}
                    >
                      {algo.stable}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
