import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Table from "./Table";
import { getAlertTriagingLeaderboard } from "../services/api";

export default function AlertTriagingLeaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "overall_solving_percentage",
    direction: "desc",
  });

  useEffect(() => {
    setLoading(true);
    getAlertTriagingLeaderboard()
      .then((res) => {
        setData(
          res.data.map((row, idx) => ({
            ...row,
            index: idx,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: "Model",
      accessor: "model_name",
      sortable: true,
      cell: (value, row) => {
        const medals = ["🥇", "🥈", "🥉"];
        const medal = medals[row.index] || "";
        return (
          <span className="font-medium text-gray-900">
            {medal} {value}
          </span>
        );
      },
    },
    {
      header: "Fully Solved Scenarios (FS)",
      accessor: "overall_fully_solved",
      sortable: true,
      cell: (value, row) => (
        <span className="font-mono">
          {value}/{row.total_scenarios || "-"}
        </span>
      ),
    },
    {
      header: "Partial Solving Percentage (PS)",
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
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <motion.section
      id="alert-triaging-leaderboard"
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-24 overflow-hidden bg-transparent"
      style={{ background: "none" }}
    >
      <div className="relative max-w-5xl mx-auto px-8 z-10">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              Alert Triaging Leaderboard
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
            on alert triaging tasks.
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
                    <span className="font-semibold">
                      Partial Solving Percentage (PS)
                    </span>
                    :
                    <br />
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
                      Fully Solved Scenarios (FS)
                    </span>
                    :
                    <br />
                    <code>
                      Number of scenarios where the model solved <b>every</b>{" "}
                      question.
                    </code>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table
              columns={columns}
              data={data}
              isLoading={loading}
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
                Results calculated from the alert triaging benchmark dataset.
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
