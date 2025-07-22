import React from "react";

export default function Table({
  columns,
  data,
  isLoading,
  sortConfig,
  onSort,
}) {
  const sortedData = React.useMemo(() => {
    if (!sortConfig || !data.length) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (accessor) => {
    if (sortConfig?.key !== accessor) return null;

    return sortConfig.direction === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 ml-1"
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
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 ml-1"
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
    );
  };
  const hasNested = columns.some((c) => Array.isArray(c.columns));
  const flatCols = [];
  function collect(cols) {
    cols.forEach((c) => {
      if (c.columns) collect(c.columns);
      else flatCols.push(c);
    });
  }
  if (hasNested) collect(columns);

  const maxDepth = hasNested
    ? (() => {
        function depth(cols) {
          return (
            1 +
            cols
              .filter((c) => c.columns)
              .reduce((m, c) => Math.max(m, depth(c.columns)), 0)
          );
        }
        return depth(columns);
      })()
    : 1;

  const headerRows = hasNested
    ? Array.from({ length: maxDepth }, () => [])
    : [];

  if (hasNested) {
    function fill(cols, rowIndex) {
      cols.forEach((col) => {
        if (col.columns) {
          let cnt = 0;
          function countLeaves(c) {
            if (c.columns) c.columns.forEach(countLeaves);
            else cnt++;
          }
          countLeaves(col);
          headerRows[rowIndex].push({
            header: col.header,
            colSpan: cnt,
            rowSpan: 1,
            sortable: false,
          });
          fill(col.columns, rowIndex + 1);
        } else {
          headerRows[rowIndex].push({
            header: col.header,
            accessor: col.accessor,
            sortable: col.sortable,
            colSpan: 1,
            rowSpan: maxDepth - rowIndex,
          });
        }
      });
    }
    fill(columns, 0);
  }
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-gray-600">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-white border-t">
        <div className="text-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {hasNested ? (
            headerRows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <th
                    key={ci}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      cell.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    onClick={() =>
                      cell.sortable && onSort && onSort(cell.accessor)
                    }
                  >
                    <div className="flex items-center justify-center">
                      {cell.header}
                      {cell.sortable && getSortIcon(cell.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => col.sortable && onSort(col.accessor)}
                >
                  <div className="flex items-center justify-center">
                    {col.header}
                    {col.sortable && getSortIcon(col.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, ri) => (
            <tr key={ri} className="hover:bg-blue-50 transition-colors">
              {(hasNested ? flatCols : columns).map((col, ci) => (
                <td
                  key={ci}
                  className="px-3 py-3.5 whitespace-nowrap text-sm text-center"
                >
                  {col.cell
                    ? col.cell(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
