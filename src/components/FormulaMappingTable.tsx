import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Calculator, HelpCircle } from 'lucide-react';
import { FormulaMapping } from '../types';

interface FormulaMappingTableProps {
  mappings: FormulaMapping[];
}

export const FormulaMappingTable: React.FC<FormulaMappingTableProps> = ({ mappings }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyFormula = async (formula: string, idx: number) => {
    await navigator.clipboard.writeText(formula);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!mappings || mappings.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No formula mappings available. Transpile a Python model to view formula translations.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Python ➔ Google Sheets Formula Mapping</h3>
            <p className="text-xs text-slate-400">Direct equivalencies between Python financial logic and native spreadsheet functions</p>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          {mappings.length} Formulas Mapped
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {mappings.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
              {/* Python Snippet */}
              <div className="flex-1 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1">
                  Python Code:
                </span>
                <code className="text-xs font-mono text-slate-200 break-all">
                  {item.pythonSnippet}
                </code>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-500">
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              {/* Google Sheets Formula */}
              <div className="flex-1 bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                    Google Sheets Formula:
                  </span>
                  <code className="text-xs font-mono font-semibold text-emerald-300 break-all">
                    {item.sheetsFormula}
                  </code>
                </div>
                <button
                  onClick={() => handleCopyFormula(item.sheetsFormula, idx)}
                  className="p-1.5 rounded text-slate-400 hover:text-emerald-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-colors ml-2 shrink-0"
                  title="Copy Sheets formula"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div className="flex items-start space-x-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{item.explanation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
