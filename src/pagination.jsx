import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // generate page numbers (simple version)
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2">

      {/* PREV */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-1.5 text-slate-500 bg-white border rounded-md"
      >
        <ChevronLeft size={18} />
      </button>

      {/* PAGE NUMBERS */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          {page}
        </button>
      ))}

      {/* NEXT */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-1.5 text-slate-500 bg-white border rounded-md"
      >
        <ChevronRight size={18} />
      </button>

    </div>
  );
};

export default Pagination;