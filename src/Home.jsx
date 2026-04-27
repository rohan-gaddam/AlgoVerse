import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");

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
      onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "clamp(40px, 8vw, 80px)",
          paddingBottom: "clamp(50px, 10vw, 100px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* WHY ALGOVERSE SECTION */}
        <div
          style={{
            width: "90%",
            maxWidth: "1200px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(20px, 5vw, 60px)",
            marginBottom: "80px",
            alignItems: "center",
            animation: "slideIn 1s ease-out",
          }}
        >
          {/* Why AlgoVerse Glowing Box */}
          <div
            style={{
              textAlign: "left",
              animation: "floatSlow 5s ease-in-out infinite",
              padding: "30px",
              borderRadius: "32px",
              border: "1px solid transparent",
              transition: "all 0.5s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.03)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
              e.currentTarget.style.boxShadow =
                "0 0 60px rgba(99,102,241,0.15), inset 0 0 20px rgba(34,211,238,0.05)";
              e.currentTarget.style.animationPlayState = "paused";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.animationPlayState = "running";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {/* Status Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(16, 185, 129, 0.1)",
                padding: "8px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                marginBottom: "25px",
                transition: "all 0.3s ease",
                cursor: "default",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  "scale(1.1) translateX(10px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1) translateX(0)")
              }
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulseGlow 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#10b981",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                }}
              >
                ALGO-ENGINE: READY TO VISUALIZE
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                fontWeight: "900",
                lineHeight: "1.1",
                marginBottom: "25px",
                letterSpacing: "-1px",
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
                fontSize: "1.2rem",
                lineHeight: "1.7",
                maxWidth: "500px",
                fontWeight: "300",
              }}
            >
              Abstract code is hard to grasp. We transform logic into
              interactive cinematic experiences, helping you master complex
              patterns through sight and sound.
            </p>
          </div>

          {/* Feature Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                label: "Live Execution",
                sub: "Interactive Visuals",
                icon: "✨",
              },
              { label: "Voice Logic", sub: "TTS Narration", icon: "🔊" },
              {
                label: "Step-by-Step",
                sub: "Contextual Sentences",
                icon: "📝",
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "25px",
                  background: "rgba(15,23,42,0.6)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  animation: `float ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "scale(1.1) translateY(-10px)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 35px rgba(99,102,241,0.3)";
                  e.currentTarget.style.animationPlayState = "paused";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.animationPlayState = "running";
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
                  {f.icon}
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "1rem",
                    color: "#f8fafc",
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  {f.sub}
                </div>
              </div>
            ))}

            {/* Multi-Language Bar */}
            <div
              style={{
                gridColumn: "span 2",
                padding: "18px 30px",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.15))",
                borderRadius: "20px",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                animation: "floatSlow 6s ease-in-out infinite",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 0 50px rgba(34,211,238,0.25)";
                e.currentTarget.style.animationPlayState = "paused";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.animationPlayState = "running";
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#cbd5e1",
                  fontWeight: "600",
                }}
              >
                SOURCE CODE SUPPORT:
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  fontWeight: "800",
                  color: "#818cf8",
                  fontSize: "0.75rem",
                  letterSpacing: "1px",
                }}
              >
                {["JAVA", "C++", "C", "PYTHON"].map((lang) => (
                  <span
                    key={lang}
                    style={{ transition: "all 0.2s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.target.style.color = "#22d3ee")}
                    onMouseLeave={(e) => (e.target.style.color = "#818cf8")}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOGO AREA */}
        <div
          style={{
            animation: "floatFast 8s ease-in-out infinite",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              fontWeight: "900",
              background: "linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)",
              backgroundSize: "200% auto",
              animation: "gradientMove 4s linear infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(99,102,241,0.4))",
              letterSpacing: "-2px",
            }}
          >
            AlgoVerse
          </h1>
          <p
            style={{
              color: "#475569",
              marginTop: "5px",
              letterSpacing: "4px",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            VISUALIZE • UNDERSTAND • MASTER
          </p>
        </div>

        {/* SEARCH BAR */}
        <div
          style={{
            width: "85%",
            maxWidth: "600px",
            marginTop: "50px",
            position: "relative",
            animation: "floatSlow 7s ease-in-out infinite",
          }}
        >
          <input
            type="text"
            placeholder="Search the algorithm library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "clamp(12px, 3vw, 22px) clamp(16px, 5vw, 35px)",
              borderRadius: "100px",
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(99,102,241,0.5)",
              color: "#fff",
              outline: "none",
              fontSize: "1.1rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              transition: "0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(99,102,241,0.5)")
            }
          />
        </div>

        <h2
          style={{
            marginBottom: "40px",
            marginTop: "80px",
            fontSize: "1.1rem",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "5px",
            fontWeight: "700",
          }}
        >
          {searchQuery
            ? `MATCHES FOUND: ${filteredAlgorithms.length}`
            : "ALGORITHM MASTERY LIBRARY"}
        </h2>

        {/* CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "35px",
            width: "92%",
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
                  backdropFilter: "blur(20px)",
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  padding: "clamp(16px, 4vw, 40px)",
                  borderRadius: "28px",
                  cursor: "pointer",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  textAlign: "center",
                  animation: `float 6s ease-in-out infinite ${index * 0.4}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-20px) scale(1.05)";
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow =
                    "0 30px 60px rgba(99,102,241,0.4)";
                  e.currentTarget.style.animationPlayState = "paused";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.animationPlayState = "running";
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                    marginBottom: "15px",
                  }}
                >
                  {algo.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    marginBottom: "10px",
                    color: "#f1f5f9",
                  }}
                >
                  {algo.name}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "1rem",
                    marginBottom: "30px",
                    minHeight: "48px",
                    lineHeight: "1.5",
                  }}
                >
                  {algo.desc}
                </p>

                <div style={{ marginBottom: "25px", textAlign: "left" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      marginBottom: "8px",
                      color: progress === 100 ? "#10B981" : "#818cf8",
                    }}
                  >
                    <span>
                      {progress === 100
                        ? "✓ MASTERED"
                        : `PROGRESS: ${progress}%`}
                    </span>
                    <span style={{ opacity: 0.5 }}>{progress}/100</span>
                  </div>
                  <div
                    style={{
                      height: "8px",
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
                        transition: "width 1.5s cubic-bezier(0.65, 0, 0.35, 1)",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    paddingTop: "25px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "#6366f1",
                        fontWeight: "900",
                        letterSpacing: "1px",
                      }}
                    >
                      RUNTIME
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
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
                        fontSize: "0.65rem",
                        color: "#22d3ee",
                        fontWeight: "900",
                        letterSpacing: "1px",
                      }}
                    >
                      STABILITY
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
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
