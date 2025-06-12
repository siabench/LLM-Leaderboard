import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Table from "./Table";
import {
  getTaskOptions,
  getLevelOptions,
  getLatestResults,
  getDetailedResults,
  getLeaderboard,
} from "../services/api";

export default function Leaderboard() {
  const [latest, setLatest] = useState([]);
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
    key: "overall_percentage",
    direction: "desc",
  });
  const [totalScenarios, setTotalScenarios] = useState(0);

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
        setFilterData(res.data);
        if (res.meta && res.meta.totalScenarios) {
          setTotalScenarios(res.meta.totalScenarios);
        } else if (res.totalScenarios) {
          setTotalScenarios(res.totalScenarios);
        } else if (
          res.data &&
          res.data.length > 0 &&
          res.data[0].total_scenarios
        ) {
          setTotalScenarios(res.data[0].total_scenarios);
        } else {
          setTotalScenarios(42);
        }

        setFilterLoading(false);
      })
      .catch(() => setFilterLoading(false));
  }, [filters]);

  useEffect(() => {
    setIsLoading(true);
    getLatestResults(filters.task, filters.level)
      .then((res) => {
        setLatest(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    setIsLoading(true);
    getDetailedResults()
      .then((detailedRes) => {
        setDetailed(detailedRes.data);
        if (detailedRes.data && detailedRes.data.length) {
          const keys = Object.keys(detailedRes.data[0].breakdown || {});
          setDetailedCols([
            {
              header: "Model",
              accessor: "model_name",
              cell: (value, row) => value,
            },
            ...keys.map((key) => ({
              header: key,
              accessor: key,
              cell: (_value, row) =>
                row.breakdown && row.breakdown[key]
                  ? `${row.breakdown[key].solved}/${row.breakdown[key].total} (${row.breakdown[key].percentage}%)`
                  : "-",
            })),
          ]);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const leaderboardColumns = [
    {
      header: "Model",
      accessor: "model_name",
      sortable: true,
      cell: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      header: "Overall Fully Solved",
      accessor: "overall_fully_solved",
      sortable: true,
      cell: (value) => <span className="font-mono">{value}</span>,
    },
    {
      header: "Overall Solving Percentage",
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
    {
      header: "Filtered Fully Solved",
      accessor: "filtered_fully_solved",
      sortable: true,
      cell: (value) => <span className="font-mono">{value}</span>,
    },
    {
      header: "Filtered Solving Percentage",
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
            Compare how different models perform on our security incident
            analysis tasks. Use filters to focus on specific tasks or difficulty
            levels.
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
          <button
            className="text-blue-700  font-sm mb-2"
            onClick={() => setShowFilters((x) => !x)}
          >
            {showFilters ? "Hide" : ""} Filters
          </button>
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {taskOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter("task", option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.task.includes(option.value)
                          ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-300 border`
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter("level", option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.level.includes(option.value)
                          ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-300 border`
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(filters.task.length > 0 || filters.level.length > 0) && (
            <div className="flex justify-between items-center mb-4 p-2 bg-blue-50 rounded-md">
              <div className="flex flex-wrap gap-2">
                {filters.task.map((task) => (
                  <span
                    key={task}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {task}
                  </span>
                ))}
                {filters.level.map((level) => (
                  <span
                    key={level}
                    className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {level}
                  </span>
                ))}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
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
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <div className="flex items-center">
                              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                                X/Y (Z%)
                              </code>
                              <span className="ml-2">
                                = X passed tests out of Y total (Z% success
                                rate)
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
                          Each column represents a different task category or
                          difficulty level. Results show how many tests were
                          passed out of the total.
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
