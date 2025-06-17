import React, { useEffect, useState } from "react";
import { getModelIntegrations, getInfoData } from "../services/api";
import { motion } from "framer-motion";

export default function Info() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [infoData, setInfoData] = useState({
    repo_url: "https://github.com/your-repo/SIA_Dataset",
    repo_structure: "",
    upcoming_models: [],
  });

  useEffect(() => {
    setIsLoading(true);

    Promise.all([getModelIntegrations(), getInfoData()])
      .then(([integrations, info]) => {
        setRows(integrations.data);
        setInfoData(info.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center text-gray-800 py-24 overflow-hidden bg-transparent"
      style={{ background: "none" }}
    >
      <div className="relative max-w-5xl mx-auto px-6 z-10 py-3">
        <div className="text-center mb-4">
          <div className="inline-block mb-2 py-1 px-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
            <span className="text-sm font-medium tracking-wider uppercase text-blue-700">
              Documentation
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
            Resource Information
          </h2>
          <p className="text-md text-gray-600 max-w-3xl mx-auto">
            Details about model integration, upcoming evaluations, and
            repository structure
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            Evaluated Models
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Model
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Provider
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      API Used
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row) => (
                    <tr
                      key={row.model_name}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.model_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={row.api_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {row.api}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🔮</span>
              Upcoming Model Evaluations
            </h3>
            <p className="mb-4 text-gray-600">
              {/* We are actively working on integrating the latest advanced
              reasoning models to evaluate the capabilities of recent LLMs in
              automated SIA tasks, including: */}
              More evaluation results are coming soon. Stay tuned!
            </p>
            {/* <ul className="space-y-3 mb-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                infoData.upcoming_models.map((model) => (
                  <li
                    key={model.name}
                    className="flex items-center bg-blue-50 rounded-lg p-3"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <a
                        className="font-medium text-blue-700 hover:text-blue-900"
                        href={model.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {model.name}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </li>
                ))
              )}
            </ul> */}
            <p className="italic text-gray-500 text-sm">
              Stay tuned for updates!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="text-2xl mr-2">📂</span>
              Repository Structure
            </h3>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto mb-4">
              <pre className="whitespace-pre-wrap">
                {isLoading ? "Loading..." : infoData.repo_structure}
              </pre>
            </div>
            <a
              href="https://github.com/llmslayer/SIABench"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
