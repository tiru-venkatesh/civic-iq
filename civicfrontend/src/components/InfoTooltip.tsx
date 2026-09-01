/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HelpCircle, Info } from "lucide-react";

interface InfoTooltipProps {
  title?: string;
  text: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
}

export default function InfoTooltip({
  title,
  text,
  children,
  iconOnly = false,
  className = "",
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center gap-1 group cursor-help ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}
      {iconOnly && (
        <HelpCircle className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#1565C0] transition-colors shrink-0" />
      )}

      {isVisible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700/80 font-sans"
          id="info-tooltip-box"
        >
          {title && (
            <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5 text-[11px] uppercase font-mono tracking-wider">
              <Info className="h-3 w-3 shrink-0" />
              <span>{title}</span>
            </div>
          )}
          <p className="text-[11px] text-slate-200 leading-normal">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
