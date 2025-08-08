import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getScenarios, getScenarioQuestions } from "../services/api";

export default function ScenariosTree() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [questionsByScenario, setQuestionsByScenario] = useState({});

  useEffect(() => {
    setLoading(true);
    getScenarios()
      .then((res) => setScenarios(res.data))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
    if (!questionsByScenario[name]) {
      const res = await getScenarioQuestions(name);
      setQuestionsByScenario((prev) => ({ ...prev, [name]: res.data }));
    }
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center text-gray-800 py-24 bg-transparent">
      <div className="relative max-w-5xl mx-auto px-8 w-full">
        <h2 className="text-3xl font-extrabold mb-4">Scenarios</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            {/* Top node */}
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="font-semibold text-gray-900">Scenarios</div>
              <div className="text-xs text-gray-500">
                ({scenarios.length} total)
              </div>
            </div>

            {/* Tree */}
            <ul className="pl-3 border-l border-gray-200">
              {scenarios.map((s) => (
                <li key={s.scenario_name} className="relative">
                  <div className="flex items-start gap-2 py-2 group">
                    {/* Connector dot */}
                    <div className="absolute -left-1.5 top-3 w-3 h-3 rounded-full bg-blue-200 border border-blue-300" />
                    {/* Row content */}
                    <button
                      onClick={() => toggle(s.scenario_name)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 mr-2 text-gray-500 transition-transform ${
                            expanded[s.scenario_name] ? "rotate-90" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 6L14 10L6 14V6Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {s.scenario_name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {s.question_count} questions
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {/* task categories */}
                        {s.task_categories.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {t}
                          </span>
                        ))}
                        {/* levels */}
                        {s.levels.map((l) => (
                          <span
                            key={l}
                            className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </button>
                  </div>

                  <AnimatePresence>
                    {expanded[s.scenario_name] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-5 pl-3 border-l border-gray-200"
                      >
                        {!questionsByScenario[s.scenario_name] ? (
                          <div className="py-2 text-xs text-gray-500">
                            Loading questions…
                          </div>
                        ) : (
                          <ul className="py-2">
                            {questionsByScenario[s.scenario_name].map((q) => (
                              <li
                                key={q.question_id}
                                className="py-1.5 flex items-start gap-2"
                              >
                                <span className="text-[11px] px-1 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                  {q.task_category} · {q.question_level}
                                </span>
                                <span className="text-sm text-gray-800">
                                  {q.question}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
