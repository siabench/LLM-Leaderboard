import React, { useEffect, useState } from "react";
import { getScenarios, getScenarioQuestions } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ScenariosTree() {
  const [scenarios, setScenarios] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: [], level: [] });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    getScenarios()
      .then((res) => {
        console.log("API Response:", res.data);
        setScenarios(Array.isArray(res.data) ? res.data : res.data ?? []);
      })
      .catch((error) => {
        console.error("Failed to load scenarios:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleScenario = async (name) => {
    setExpanded((p) => ({ ...p, [name]: !p[name] }));
    if (!questions[name]) {
      try {
        const res = await getScenarioQuestions(name);
        setQuestions((p) => ({
          ...p,
          [name]: Array.isArray(res.data) ? res.data : [],
        }));
      } catch (e) {
        console.error(e);
        setQuestions((p) => ({ ...p, [name]: [] }));
      }
    }
  };

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => setFilters({ category: [], level: [] });

  const categories = [
    ...new Set(
      scenarios.map((s) => s.task_category || s.category).filter(Boolean)
    ),
  ];
  const levels = [
    ...new Set(
      scenarios.map((s) => s.question_level || s.level).filter(Boolean)
    ),
  ];

  const filteredScenarios = scenarios.filter((s) => {
    const cat = s.task_category || s.category;
    const lvl = s.question_level || s.level;

    if (filters.category.length && cat && !filters.category.includes(cat)) {
      return false;
    }

    if (filters.level.length && lvl && !filters.level.includes(lvl)) {
      return false;
    }

    return true;
  });

  return (
    <motion.section
      id="scenarios"
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-24 overflow-hidden bg-transparent"
      style={{ background: "none" }}
    >
      <div className="relative max-w-5xl mx-auto px-8 z-10">
        <div className="text-center mb-6">
          <div className="inline-block mb-3 py-1 px-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
            <span className="text-sm font-medium tracking-wider uppercase text-blue-700">
              Test Scenarios
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Security Incident Scenarios
          </h2>
          <p className="text-md text-gray-600 max-w-3xl mx-auto">
            Explore the scenarios used to evaluate model performance in security
            analysis tasks.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 ">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Scenarios Library
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {scenarios.length} scenarios available
                </p>
              </div>
            </div>

            <button
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm ${
                showFilters
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Hide Filters
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Filter Scenarios
                </>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-blue-100/70">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex items-center">
                  <div className="flex items-center gap-1 mr-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2 w-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Category:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleFilter("category", cat)}
                        className={`inline-flex items-center h-5 px-1.5 rounded text-xs font-medium ${
                          filters.category.includes(cat)
                            ? "bg-blue-500 text-white"
                            : "bg-white/90 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {cat}
                        {filters.category.includes(cat) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 ml-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-5 w-px bg-blue-200/80 hidden sm:block"></div>

                <div className="flex items-center">
                  <div className="flex items-center gap-1 mr-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2 w-2 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Difficulty Level:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleFilter("level", level)}
                        className={`inline-flex items-center h-5 px-1.5 rounded text-xs font-medium ${
                          filters.level.includes(level)
                            ? "bg-indigo-500 text-white"
                            : "bg-white/90 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                        }`}
                      >
                        {level}
                        {filters.level.includes(level) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 ml-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {(filters.category.length > 0 || filters.level.length > 0) && (
                  <div className="h-5 w-px bg-blue-200/80 hidden sm:block"></div>
                )}

                {(filters.category.length > 0 || filters.level.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center text-xs bg-red-50 text-red-600 hover:bg-red-100 px-1.5 h-5 rounded-sm border border-red-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear ({filters.category.length + filters.level.length})
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-3 text-gray-600">Loading scenarios...</p>
                </div>
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-700 mb-2">
                  No scenarios found
                </h4>
                <p className="text-gray-500 max-w-sm">
                  {filters.category.length > 0 || filters.level.length > 0
                    ? "Try changing your filter criteria to see more results"
                    : "There are no scenarios available at this time"}
                </p>
                {(filters.category.length > 0 || filters.level.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <div key={level} className="text-center">
                      <div
                        className={`py-2 rounded-t-lg font-medium text-sm ${
                          level === "Easy"
                            ? "bg-green-100 text-green-800"
                            : level === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {level}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["Easy", "Medium", "Hard"].map((level) => {
                    const levelScenarios = filteredScenarios.filter((s) => {
                      const scenarioLevel = (
                        s?.question_level ??
                        s?.level ??
                        ""
                      ).trim();

                      console.log(
                        "Scenario:",
                        s.scenario_name,
                        "Level:",
                        scenarioLevel,
                        "Expecting:",
                        level
                      );

                      if (Array.isArray(s.levels)) {
                        return s.levels.some(
                          (l) => l.trim().toLowerCase() === level.toLowerCase()
                        );
                      }

                      return (
                        scenarioLevel.toLowerCase() === level.toLowerCase()
                      );
                    });

                    return (
                      <div key={level} className="flex flex-col space-y-4">
                        {levelScenarios.length === 0 ? (
                          <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 h-32 flex items-center justify-center">
                            No {level.toLowerCase()} scenarios available
                          </div>
                        ) : (
                          levelScenarios.map((s) => {
                            const name = s.scenario_name ?? s.name;
                            const cat = s.task_category ?? s.category ?? "—";
                            const lvl = s?.question_level ?? s?.level ?? "";
                            const isOpen = !!expanded[name];
                            const qs = Array.isArray(questions[name])
                              ? questions[name]
                              : [];

                            return (
                              <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div
                                  className={`px-3 py-3 bg-gradient-to-r text-sm ${
                                    lvl === "Easy"
                                      ? "from-green-50 to-green-100"
                                      : lvl === "Medium"
                                      ? "from-yellow-50 to-yellow-100"
                                      : lvl === "Hard"
                                      ? "from-red-50 to-red-100"
                                      : "from-gray-50 to-gray-100"
                                  } cursor-pointer`}
                                  onClick={() => toggleScenario(name)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="font-medium text-gray-800">
                                        {name}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 text-gray-400 transition-transform ${
                                          isOpen ? "transform rotate-180" : ""
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 py-3 bg-white border-t border-gray-200">
                                        {!questions[name] ? (
                                          <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                          </div>
                                        ) : qs.length === 0 ? (
                                          <div className="text-center py-4 text-sm text-gray-500">
                                            No questions found for this
                                            scenario.
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-2">
                                              Questions:
                                            </div>
                                            <ul className="space-y-2">
                                              {qs.map((q, i) => (
                                                <li
                                                  key={q.question_id ?? i}
                                                  className="bg-gray-50 rounded-md p-3 text-sm"
                                                >
                                                  <div className="flex">
                                                    <span className="flex-shrink-0 text-blue-600 mr-2">
                                                      Q{i + 1}:
                                                    </span>
                                                    <span className="text-gray-700">
                                                      {q.question ??
                                                        q.text ??
                                                        "(missing question text)"}
                                                    </span>
                                                  </div>
                                                  {q.correct_answer && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                      <span className="text-xs font-medium text-gray-500">
                                                        Expected Answer:{" "}
                                                      </span>
                                                      <span className="text-xs font-mono bg-green-50 text-green-800 px-1.5 py-0.5 rounded border border-green-100">
                                                        {q.correct_answer}
                                                      </span>
                                                    </div>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center text-xs text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-500 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Click on a scenario to view its associated questions
              {filters.category.length > 0 || filters.level.length > 0
                ? `. Showing ${filteredScenarios.length} of ${scenarios.length} scenarios based on filters.`
                : `.`}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
