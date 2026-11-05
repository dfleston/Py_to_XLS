import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Eye, 
  Code, 
  HelpCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface InteractiveSpreadsheetPreviewProps {
  modelName: string;
  mockSheetData: string[][];
  onOpenGuide: () => void;
}

export const InteractiveSpreadsheetPreview: React.FC<InteractiveSpreadsheetPreviewProps> = ({
  modelName,
  mockSheetData,
  onOpenGuide,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 1, col: 1 });
  const [showFormulas, setShowFormulas] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Fallback if empty
  const data = mockSheetData && mockSheetData.length > 0 ? mockSheetData : [
    ["LINE ITEM", "YEAR 1", "YEAR 2", "YEAR 3"],
    ["Revenue", "$1,000,000", "$1,150,000", "$1,322,500"],
    ["EBITDA", "$250,000", "$287,500", "$330,625"],
    ["Net Income", "$150,000", "$172,500", "$198,375"]
  ];

  const colHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const maxCols = Math.max(...data.map(r => r.length), 4);
  const activeColLetters = colHeaders.slice(0, maxCols);

  const activeCellCoord = `${colHeaders[selectedCell.col] || 'A'}${selectedCell.row + 1}`;
  const activeCellValue = data[selectedCell.row]?.[selectedCell.col] || '';

  // Classify cell type for Wall Street financial styling
  const getCellStyling = (val: string, rowIndex: number, colIndex: number) => {
    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
    const isHeaderRow = rowIndex === 0 || (val.toUpperCase() === val && val.length > 3 && !val.includes('$'));
    const isTotalRow = val.toLowerCase().includes('total') || val.toLowerCase().includes('enterprise value') || val.toLowerCase().includes('implied');
    const isInputVal = !isHeaderRow && colIndex === 1 && (val.includes('$') || val.includes('%') || !isNaN(Number(val)));

    let classes = "px-3 py-1.5 text-xs border-r border-b border-slate-700/60 font-mono transition-colors whitespace-nowrap overflow-hidden text-ellipsis ";

    if (isSelected) {
      classes += "outline-2 outline-emerald-400 bg-emerald-500/10 z-10 relative ";
    } else if (isHeaderRow) {
      classes += "font-bold text-slate-100 bg-slate-800/90 ";
    } else if (isTotalRow) {
      classes += "font-bold text-emerald-300 bg-emerald-950/20 border-t-2 border-slate-600 ";
    } else if (isInputVal) {
      // Wall Street convention: blue font for inputs
      classes += "text-blue-300 font-medium bg-blue-950/10 ";
    } else {
      classes += "text-slate-300 hover:bg-slate-800/40 ";
    }

    // Number alignment
    if (val.includes('$') || val.includes('%') || (!isNaN(Number(val)) && val.trim() !== '')) {
      classes += " text-right";
    } else {
      classes += " text-left";
    }

    return classes;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Google Sheets Header & Toolbar */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-200">{modelName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Interactive Preview
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Preview generated sheet layout & formulas</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
              showFormulas
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Toggle Formulas View (Ctrl + `)"
          >
            {showFormulas ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFormulas ? 'Showing Formulas' : 'Show Formulas'}</span>
          </button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center space-x-1"
          >
            <span>Open in Sheets</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Formula Bar (Authentic Google Sheets style) */}
      <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center space-x-2 text-xs font-mono">
        {/* Cell Reference Box */}
        <div className="w-12 text-center py-1 bg-slate-900 text-emerald-400 font-semibold rounded border border-slate-700/80">
          {activeCellCoord}
        </div>

        {/* fx symbol */}
        <div className="text-slate-500 font-bold italic px-1 select-none">
          fx
        </div>

        {/* Value/Formula Display */}
        <div className="flex-1 py-1 px-2.5 bg-slate-900/90 text-slate-200 rounded border border-slate-800 truncate">
          {showFormulas ? (activeCellValue.startsWith('=') ? activeCellValue : `="${activeCellValue}"`) : activeCellValue}
        </div>
      </div>

      {/* Interactive Sheet Grid */}
      <div className="flex-1 overflow-auto bg-slate-950">
        <table className="w-full border-collapse select-none">
          <thead>
            <tr className="bg-slate-900/90 sticky top-0 z-20">
              {/* Corner top-left cell */}
              <th className="w-10 min-w-10 bg-slate-900 border-r border-b border-slate-700 text-center py-1 text-[11px] font-mono text-slate-500 font-normal">
                #
              </th>
              {activeColLetters.map((col, idx) => (
                <th 
                  key={col} 
                  className={`border-r border-b border-slate-700 text-center py-1 px-3 text-[11px] font-mono font-medium transition-colors ${
                    selectedCell.col === idx ? 'bg-emerald-950/60 text-emerald-300' : 'text-slate-400'
                  }`}
                  style={{ minWidth: idx === 0 ? '160px' : '110px' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-900/30">
                {/* Row Header Number */}
                <td className={`border-r border-b border-slate-700 text-center py-1 px-1.5 text-[11px] font-mono transition-colors sticky left-0 z-10 ${
                  selectedCell.row === rIdx ? 'bg-emerald-950/60 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-500'
                }`}>
                  {rIdx + 1}
                </td>

                {/* Cells */}
                {activeColLetters.map((_, cIdx) => {
                  const cellVal = row[cIdx] || '';
                  return (
                    <td
                      key={cIdx}
                      onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                      className={getCellStyling(cellVal, rIdx, cIdx)}
                    >
                      {cellVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet Tabs Bar (At bottom, just like Google Sheets) */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          {['Financial Model', 'Assumptions & Inputs', 'Sensitivity Analysis'].map((tabName, idx) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1 rounded-t-md text-xs font-medium transition-colors border-b-2 flex items-center space-x-1.5 ${
                activeTab === idx
                  ? 'bg-slate-900 text-emerald-300 border-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-900/50'
              }`}
            >
              <span>{tabName}</span>
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <span>Blue = Inputs</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            <span>White = Calculations</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Green = Key Outputs</span>
          </span>
        </div>
      </div>
    </div>
  );
};
