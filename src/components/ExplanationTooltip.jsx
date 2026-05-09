import React from 'react';
import { Info } from 'lucide-react';

/**
 * A reusable explanation tooltip component with a brown info icon.
 * Displays a pill-shaped tooltip on hover.
 * 
 * @param {Object} props
 * @param {string} props.text - The explanation text to display in the tooltip.
 * @param {string} [props.bgColor] - Optional background color class (defaults to bg-amber-50).
 * @param {string} [props.className] - Optional additional classes for the container.
 */
const ExplanationTooltip = ({ text, bgColor = "bg-amber-50", className = "" }) => {
  if (!text) return null;

  return (
    <div className={`relative flex items-center min-w-0 group shrink-0 ${className}`}>
      <Info size={16} className="text-[#8B4513] cursor-pointer" />
      <div className={`absolute left-5 top-3 hidden group-hover:block min-w-max max-w-[240px] ${bgColor} text-[#8B4513] text-[12px] px-3 py-1 rounded-md shadow-md z-50 border border-amber-200 pointer-events-none`}>
        {text}
      </div>
    </div>
  );
};

export default ExplanationTooltip;
