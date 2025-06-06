import React, { useEffect, useState } from "react";
import { getLegend } from "../services/api";

export default function Legend() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getLegend()
      .then((res) => {
        setItems(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching legend data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4 mb-4 border border-gray-100 text-sm">
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5 text-blue-500"
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
          <h3 className="font-medium text-gray-800">Legend</h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
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

      {expanded &&
        (isLoading ? (
          <div className="flex justify-center py-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
              {items.map(({ code, meaning }) => (
                <div
                  key={code}
                  className="bg-gray-50 rounded px-2 py-1.5 border border-gray-100 flex items-center"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1.5"></div>
                  <div className="leading-tight">
                    <span className="font-medium text-blue-700 text-xs">
                      {code}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({meaning})
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 rounded p-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-blue-500 mr-1 flex-shrink-0"
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
              <span>Codes used in detailed results table</span>
            </div>
          </>
        ))}

      {!expanded && !isLoading && (
        <div className="flex flex-wrap gap-1 opacity-60">
          {items.slice(0, 6).map(({ code }) => (
            <span
              key={code}
              className="bg-gray-50 rounded px-1.5 py-0.5 text-xs text-gray-500 border border-gray-100"
            >
              {code}
            </span>
          ))}
          {items.length > 6 && (
            <span className="text-xs text-gray-500">
              +{items.length - 6} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
