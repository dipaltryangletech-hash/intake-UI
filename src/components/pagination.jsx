import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - The current active page number (e.g., 1)
 * @param {number} totalPages - The total number of pages available
 * @param {number} totalRecords - The total number of items in the database/array
 * @param {number} rowsPerPage - How many records are shown per page (default: 10)
 * @param {function} onPageChange - Function to run when a page number is clicked
 * @param {function} onRowsPerPageChange - Function to run when the "records per page" dropdown changes
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {

  // Go to the previous page if we are not on the first page
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Go to the next page if we haven't reached the last page
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate an array of page numbers (e.g.,[1, 2, 3, 4, 5])
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Safe fallback for rowsPerPage to prevent NaN during calculations
  const safeRowsPerPage = Number(rowsPerPage) || 10;

  // Calculate the starting and ending record numbers for the text "Showing 1 to 10 of 50"
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * safeRowsPerPage + 1;
  const endRecord = Math.min(currentPage * safeRowsPerPage, totalRecords);

  return (
    // Main container holding both the dropdown and the pagination buttons
    // flex-col on mobile, flex-row on desktop for responsive design
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">

      {/* LEFT SIDE: "Rows per page" Dropdown & "Showing X to Y" text */}
      <div className="flex items-center gap-2 text-sm text-slate-500">

        {/* Container for the Dropdown/Input */}
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page">Show</label>

          {/* Input field to manually enter how many records to show */}
          <input
            id="rows-per-page"
            type="number"
            min="1"
            value={rowsPerPage === undefined ? 10 : rowsPerPage}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              if (onRowsPerPageChange && (val === "" || val > 0)) {
                onRowsPerPageChange(val);
              }
            }}
            className="border border-slate-300 rounded-md px-2 py-1 text-slate-700 bg-white focus:ring-blue-500 w-16 text-center"
          />

          <span>records</span>
        </div>

        {/* Text showing current viewing range (e.g., "Showing 1 to 10 of 50") */}
        {totalRecords > 0 && (
          <span className="hidden md:inline-block ml-1 border-l border-slate-300 pl-2">
            Showing <span className="font-semibold text-slate-700">{startRecord}</span> to <span className="font-semibold text-slate-700">{endRecord}</span> of <span className="font-semibold text-slate-700">{totalRecords}</span> entries
          </span>
        )}
      </div>

      {/* RIGHT SIDE: Prev Button, Page Numbers, Next Button */}
      <div className="flex items-center gap-1">

        {/* PREV BUTTON */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1} // Disable if on page 1
          className={`p-1.5 rounded-md border transition-all ${currentPage === 1
            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" // Disabled styles
            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700" // Enabled styles
            }`}
          title="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* PAGE NUMBER BUTTONS */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${currentPage === page
              ? "bg-blue-600 text-white shadow-md shadow-blue-200" // Active Page Style
              : "text-slate-500 bg-transparent hover:bg-slate-100 hover:text-slate-700" // Inactive Page Style
              }`}
          >
            {page}
          </button>
        ))}

        {/* NEXT BUTTON */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0} // Disable if on last page
          className={`p-1.5 rounded-md border transition-all ${currentPage === totalPages || totalPages === 0
            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" // Disabled styles
            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700" // Enabled styles
            }`}
          title="Next Page"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
};

export default Pagination;