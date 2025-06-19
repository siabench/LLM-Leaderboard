import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLanding } from "../services/api";

export default function Landing() {
  const [info, setInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const scrollToLeaderboard = (e) => {
    if (e) e.preventDefault();
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

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!info) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-16 overflow-hidden"
      style={{ background: "transparent" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="relative max-w-5xl mx-auto text-center px-8 z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-center gap-3 my-20">
              <motion.h1
                variants={itemVariants}
                className="text-12xl sm:text-9xl md:text-11xl font-['Space_Grotesk',sans-serif] font-bold leading-none tracking-tight inline-flex items-center"
              >
                <motion.span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    backgroundSize: "200% auto",
                  }}
                >
                  {info.title}
                </motion.span>

                <motion.div
                  className="relative inline-block ml-4"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={() => setShowInfo(true)}
                    className="flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 border border-blue-300 w-5 h-5 md:w-8 md:h-8"
                    aria-label="How scores are calculated"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="white"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16v-4m0-4h.01"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              </motion.h1>
            </div>

            <motion.p
              variants={itemVariants}
              className="text-sm md:text-base max-w-2xl mx-auto mb-12 text-gray-500 leading-relaxed font-['Space_Grotesk',sans-serif] font-light tracking-wide"
            >
              {info.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-8"
            >
              <motion.button
                onClick={scrollToLeaderboard}
                className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium py-3.5 px-7 rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>View Leaderboard</span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 1,
                      repeatDelay: 1,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </motion.svg>
                </span>
                <span className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </motion.button>

              <motion.a
                href={info.links[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-7 rounded-md shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(249, 250, 251, 1)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.svg
                  className="w-4 h-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  whileHover={{ rotate: 10 }}
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </motion.svg>
                <span>GitHub Repo</span>
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative"
            >
              <button
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowInfo(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-lg font-bold mb-2">
                {info.announcement_title}
              </h3>
              <div className="text-gray-600 mb-3 space-y-2.5 text-sm">
                <motion.div
                  className="bg-white/60 p-3 rounded-md border-l-2 border-blue-300"
                  whileHover={{
                    x: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-medium text-blue-600 mb-1">
                    {info.part1_title}
                  </h3>
                  <p className="text-gray-500">{info.part1_description}</p>
                </motion.div>

                <motion.div
                  className="bg-white/60 p-3 rounded-md border-l-2 border-indigo-300"
                  whileHover={{
                    x: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-medium text-indigo-600 mb-1">
                    {info.part2_title}
                  </h3>
                  <p className="text-gray-500">{info.part2_description}</p>
                </motion.div>
              </div>

              <div className="text-gray-400 text-xs italic mt-2 pt-2 border-t border-gray-100">
                {info.evaluation_note}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1.5 z-20"
        onClick={scrollToLeaderboard}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ y: -3 }}
      >
        <motion.div
          className="bg-blue-50 p-1.5 w-9 h-9 ring-1 ring-blue-100 shadow-sm rounded-full flex items-center justify-center bg-gradient-to-b from-white to-blue-50"
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-blue-500"
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
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap");
      `}</style>
    </motion.section>
  );
}
