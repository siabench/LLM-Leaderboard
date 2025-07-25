import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Table from "./Table";
import {
  getTaskOptions,
  getLevelOptions,
  // getLatestResults,
  getDetailedResults,
  getLeaderboard,
  getModelDetails,
  getLegend,
} from "../services/api";

export default function Leaderboard() {
  // const [latest, setLatest] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [detailed, setDetailed] = useState([]);
  const [detailedCols, setDetailedCols] = useState([]);
  const [showFull, setShowFull] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterData, setFilterData] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [filters, setFilters] = useState({ task: [], level: [] });
  const [filterLoading, setFilterLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "overall_solving_percentage",
    direction: "desc",
  });
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [filteredScenarios, setFilteredScenarios] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const handleRowClick = (row) => {
    setSelectedModel(row.model_name);
    setModalLoading(true);
    setShowModal(true);
    getModelDetails(row.model_name)
      .then((res) => {
        setModalData(res.data);
        setModalLoading(false);
      })
      .catch(() => setModalData([]));
  };
  useEffect(() => {
    Promise.all([getTaskOptions(), getLevelOptions()]).then(
      ([tasksRes, levelsRes]) => {
        setTaskOptions(
          tasksRes.data.map((task) => ({ value: task, color: "blue" }))
        );
        setLevelOptions(
          levelsRes.data.map((level) => ({
            value: level,
            color: "blue",
          }))
        );
      }
    );
  }, []);

  useEffect(() => {
    setFilterLoading(true);
    getLeaderboard(filters.task, filters.level)
      .then((res) => {
        const withIndex = res.data.map((entry, idx) => ({
          ...entry,
          index: idx,
        }));
        setFilterData(withIndex);
        console.log("raw rows:", res.data);
        console.log("mapped rows:", withIndex);
        if (res.data.length > 0) {
          setTotalScenarios(res.data[0].total_scenarios);
          setFilteredScenarios(res.data[0].total_filtered_scenarios);
        } else {
          setTotalScenarios(0);
          setFilteredScenarios(0);
        }

        setFilterLoading(false);
      })
      .catch(() => setFilterLoading(false));
  }, [filters]);

  // useEffect(() => {
  //   setIsLoading(true);
  //   getLatestResults(filters.task, filters.level)
  //     .then((res) => {
  //       setLatest(res.data);
  //       setIsLoading(false);
  //     })
  //     .catch(() => setIsLoading(false));
  // }, [filters]);

  // in your useEffect that builds detailedCols…

  useEffect(() => {
    setIsLoading(true);

    Promise.all([getDetailedResults(), getLegend()])
      .then(([detailedRes, legendRes]) => {
        setDetailed(detailedRes.data);

        const CATEGORY_CODES = Object.fromEntries(
          legendRes.data
            .filter((x) =>
              [
                "Network Forensics",
                "Memory Forensics",
                "Malware Analysis",
                "Others",
              ].includes(x.meaning)
            )
            .map(({ meaning, code }) => [meaning, code])
        );
        const LEVEL_CODES = Object.fromEntries(
          legendRes.data
            .filter((x) => ["Easy", "Medium", "Hard"].includes(x.meaning))
            .map(({ meaning, code }) => [meaning, code])
        );
        const LEVELS = Object.values(LEVEL_CODES);

        const cols = [
          { header: "Model", accessor: "model_name", cell: (v) => v },
          ...Object.entries(CATEGORY_CODES).map(([catName, catCode]) => ({
            header: catName,
            columns: LEVELS.map((lvl) => ({
              header: lvl,
              accessor: `${catCode}-${lvl}`,
              cell: (_v, row) => {
                const info = row.breakdown?.[`${catCode}-${lvl}`];
                return info
                  ? `${info.solved}/${info.total} (${info.percentage}%)`
                  : "—";
              },
            })),
          })),
        ];
        setDetailedCols(cols);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const leaderboardColumns = [
    {
      header: "Model",
      accessor: "model_name",
      sortable: true,
      cell: (value, row) => {
        const medals = ["🥇", "🥈", "🥉"];
        const medal = medals[row.index] || "";
        return (
          <span
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-700"
            onClick={() => handleRowClick(row)}
            title="View passed questions"
          >
            {medal} {value}
          </span>
        );
      },
    },
    {
      header: "Overall Fully Solved Scenarios (FS)",
      accessor: "overall_fully_solved",
      sortable: true,
      cell: (value) => (
        <span className="font-mono">
          {value}/{totalScenarios}
        </span>
      ),
    },
    {
      header: "Overall Partial Solving Percentage (PS)",
      accessor: "overall_solving_percentage",
      sortable: true,
      cell: (value) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="font-medium">{value}%</span>
        </div>
      ),
    },
    ...(filters.task.length > 0 || filters.level.length > 0
      ? [
          {
            header: "Filtered Fully Solved Scenarios",
            accessor: "filtered_fully_solved",
            sortable: true,
            cell: (value, row) => {
              const denom = row.total_filtered_scenarios ?? "—";
              return (
                <span className="font-mono">
                  {value}/{denom}
                </span>
              );
            },
          },
          {
            header: "Filtered Partial Solving Percentage",
            accessor: "filtered_solving_percentage",
            sortable: true,
            cell: (value) => (
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <span className="font-medium">{value}%</span>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };
  const clearFilters = () => setFilters({ task: [], level: [] });

  return (
    <motion.section
      id="leaderboard"
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-24 overflow-hidden bg-transparent"
      style={{ background: "none" }}
    >
      <div className="relative max-w-5xl mx-auto px-8 z-10">
        <div className="text-center mb-4">
          <div className="inline-block mb-3 py-1 px-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
            <span className="text-sm font-medium tracking-wider uppercase text-blue-700">
              Model Performance
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              Performance Leaderboard
            </h2>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 border border-blue-300 w-7 h-7 ml-2"
              aria-label="How scores are calculated"
              type="button"
            >
              <svg
                className="w-5 h-5 text-blue-700"
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
            </button>
          </div>
          <p className="text-md text-gray-600 max-w-3xl mx-auto">
            Performance comparison of different state-of-the-art (SOTA) models
            in security incident analysis tasks.
          </p>
        </div>

        {showInfo && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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
                How Scores Are Calculated
              </h3>
              <div className="text-sm text-gray-700">
                <ul className="mb-3 list-disc pl-6">
                  <li>
                    <span className="font-semibold">Avg. Scenario Solve %</span>
                    : <br />
                    <code>
                      Average percentage of questions solved per scenario,
                      across all scenarios.
                    </code>
                    <br />
                    <span className="text-gray-500">
                      • Calculated as the mean of (questions passed / questions
                      in scenario), per scenario.
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      Fully Solved Scenarios
                    </span>
                    : <br />
                    <code>
                      Number of scenarios where the model solved <b>every</b>{" "}
                      question.
                    </code>
                  </li>
                </ul>
                <p className="text-xs text-gray-400"></p>
              </div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2"></div>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm ${
                showFilters
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors`}
              onClick={() => {
                console.log("Current showFilters:", showFilters);
                setShowFilters((prevState) => !prevState);
              }}
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
                  Show Filters
                </>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mb-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-lg border border-blue-100/70 shadow-sm p-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                      Task:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {taskOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter("task", option.value)}
                        className={`inline-flex items-center h-5 px-1.5 rounded text-xs font-medium ${
                          filters.task.includes(option.value)
                            ? "bg-blue-500 text-white"
                            : "bg-white/90 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {option.value}
                        {filters.task.includes(option.value) && (
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
                      Task Difficulty Level:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {levelOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter("level", option.value)}
                        className={`inline-flex items-center h-5 px-1.5 rounded text-xs font-medium ${
                          filters.level.includes(option.value)
                            ? "bg-indigo-500 text-white"
                            : "bg-white/90 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                        }`}
                      >
                        {option.value}
                        {filters.level.includes(option.value) && (
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

                {(filters.task.length > 0 || filters.level.length > 0) && (
                  <div className="h-5 w-px bg-blue-200/80 hidden sm:block"></div>
                )}

                {(filters.task.length > 0 || filters.level.length > 0) && (
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
                    Clear ({filters.task.length + filters.level.length})
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table
              columns={leaderboardColumns}
              data={filterData}
              isLoading={filterLoading}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-blue-500 mr-1.5"
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
                Results calculated from a total of{" "}
                <span className="font-medium text-gray-700">
                  {totalScenarios}
                </span>{" "}
                security incident scenarios.
                {filters.task.length > 0 || filters.level.length > 0
                  ? " (Filtered results may use a subset of scenarios based on selected criteria)"
                  : ""}
              </span>
              <div className="flex flex-col md:flex-row md:items-center gap-1">
                <span>
                  Total scenarios: <strong>{totalScenarios}</strong>
                </span>
                {(filters.task.length > 0 || filters.level.length > 0) && (
                  <span className="md:ml-4">
                    Filtered scenarios: <strong>{filteredScenarios}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <button
              className="text-blue-700 hover:text-blue-800 transition-colors text-sm px-3 py-1 font-medium flex items-center"
              onClick={() => setShowFull((x) => !x)}
            >
              {showFull ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Hide Full Detailed Table
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                  Show Full Detailed Table
                </>
              )}
            </button>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <h3 className="text-xl font-bold mb-2">Latest Results</h3>
          <Table
            columns={leaderboardColumns}
            data={latest}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div> */}
      </div>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl relative overflow-auto"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">
              All Answers for{" "}
              <span className="text-blue-600">{selectedModel}</span>
            </h3>
            {modalLoading ? (
              <div className="text-center p-8 text-gray-500">Loading...</div>
            ) : modalData.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                No answers found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b font-bold">Scenario</th>
                      <th className="py-2 px-4 border-b font-bold">Question</th>
                      <th className="py-2 px-4 border-b font-bold">
                        Correct Answer
                      </th>
                      <th className="py-2 px-4 border-b font-bold">
                        LLM Answer
                      </th>
                      <th className="py-2 px-4 border-b font-bold">
                        Adversarial Tactic
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((q, idx) => {
                      const bg =
                        q.response === "pass" ? "bg-green-50" : "bg-red-50";
                      const textColor =
                        q.response === "pass"
                          ? "text-green-700"
                          : "text-red-700";
                      return (
                        <tr
                          key={idx}
                          className={`${bg} hover:bg-opacity-75 transition-colors`}
                        >
                          <td className="py-2 px-4 border-b">
                            {q.scenario_name}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {q.question_text}
                          </td>
                          <td className="py-2 px-4 border-b font-mono">
                            {q.correct_answer}
                          </td>
                          <td className={`py-2 px-4 border-b ${textColor}`}>
                            {q.model_answer}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {q.adversarial_tactic}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-50 overflow-hidden flex items-center justify-center"
            onClick={() => setShowFull(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-[95%] h-[90%] rounded-xl shadow-xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Detailed Performance Results
                  </h3>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
                  onClick={() => setShowFull(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="mt-3 text-gray-600">
                        Loading detailed results...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
                      <div className="flex items-center mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
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
                        <h3 className="text-lg font-bold text-gray-800">
                          Table Legend
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="font-medium text-sm text-gray-700 mb-2">
                            Task Types
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {taskOptions.map((option, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center bg-blue-50 px-2 py-1 rounded text-xs"
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-1.5"></div>
                                {option.value}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-sm text-gray-700 mb-2">
                            Difficulty Levels
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {levelOptions.map((option, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center bg-indigo-50 px-2 py-1 rounded text-xs"
                              >
                                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-1.5"></div>
                                {option.value}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-sm text-gray-700 mb-2">
                            Results Format
                          </div>
                          <div className="bg-gray-50 p-1.5 rounded text-xs">
                            <div className="flex items-center">
                              <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono ">
                                X/Y (Z%)
                              </code>
                              <span className="ml-9">
                                = X fully passed scenarios out of Y scenarios
                                (Z% Partial Solving Percentage)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 bg-blue-50 rounded p-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0"
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
                        <p>
                          Each column represents a different task category and
                          difficulty level.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <Table
                        columns={detailedCols}
                        data={detailed}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowFull(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
