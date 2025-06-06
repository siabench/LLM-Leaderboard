import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLanding } from "../services/api";

export default function Landing() {
  const [info, setInfo] = useState(null);

  const scrollToLeaderboard = () => {
    const el = document.getElementById("leaderboard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    getLanding()
      .then((res) => setInfo(res.data))
      .catch((err) => {
        console.error("Failed to load landing info:", err);
      });
  }, []);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-24 overflow-hidden bg-transparent"
      style={{ background: "none" }}
    >
      <div className="relative max-w-5xl mx-auto text-center px-8 z-10">
        <h1 className="text-5xl sm:text-6xl font-grotesk font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700">
          {info.title}
        </h1>

        <p className="text-lg max-w-2xl mx-auto mb-10 text-gray-600 leading-relaxed">
          {info.description}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <a
            href="#leaderboard"
            className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-3.5 px-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-blue-200 hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>View Leaderboard</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </a>

          <a
            href="https://github.com/your-repo/SIA_Dataset"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-auto border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-8 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>GitHub Repo</span>
          </a>
        </div>

        <div className="w-full flex justify-center bg-transparent">
          <div className="max-w-2xl w-full mx-auto mb-8 mt-6 z-10 relative">
            <div className="bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-100 rounded-lg p-4 shadow border border-blue-200 flex items-start gap-3">
              <span className="text-2xl mt-0.5">🔔</span>
              <div className="text-left w-full">
                <div className="font-semibold text-blue-800 mb-1 text-center">
                  What's New?
                </div>
                <div className="text-gray-700 text-sm mb-2">
                  <div>
                    <strong className="text-indigo-600">
                      New Model Evaluation Added:
                    </strong>{" "}
                    Claude-3.5!
                  </div>
                  <div>
                    <strong className="text-indigo-600">
                      Upcoming Reasoning Models:
                    </strong>{" "}
                    DeepSeek-R1 &amp; OpenAI o3-mini
                  </div>
                </div>
                <div className="text-gray-600 text-xs">
                  Stay updated as we continue expanding and refining our dataset
                  and evaluation! ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
        onClick={scrollToLeaderboard}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </motion.section>
  );
}
