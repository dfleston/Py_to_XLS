import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Sparkles, 
  FileSpreadsheet, 
  HelpCircle,
  Code
} from 'lucide-react';
import { highlightCode } from '../utils/highlighter';

interface AppsScriptViewerProps {
  sheetBuilderCode: string;
  customFunctionsCode: string;
  modelName: string;
  onOpenGuide: () => void;
}

export const AppsScriptViewer: React.FC<AppsScriptViewerProps> = ({
  sheetBuilderCode,
  customFunctionsCode,
  modelName,
  onOpenGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'sheetBuilder' | 'customFunction' | 'combined'>('sheetBuilder');
  const [copied, setCopied] = useState(false);

  // Combined code
  const combinedCode = useMemo(() => {
    return `/**
 * ============================================================================
 * ${modelName.toUpperCase()}
 * Transpiled with PyFin2Sheets for Google Sheets & Google Apps Script (V8)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// SECTION 1: CUSTOM SHEET FUNCTIONS
// Use directly in any Google Sheet cell: e.g. =FUNCTION(...)
// ----------------------------------------------------------------------------
${customFunctionsCode}

// ----------------------------------------------------------------------------
// SECTION 2: AUTOMATED SPREADSHEET BUILDER & MACRO
// Run via custom menu '📊 Financial Models' or the script editor
// ----------------------------------------------------------------------------
${sheetBuilderCode}
`;
  }, [modelName, customFunctionsCode, sheetBuilderCode]);

  const currentDisplayCode = useMemo(() => {
    if (activeTab === 'sheetBuilder') return sheetBuilderCode;
    if (activeTab === 'customFunction') return customFunctionsCode;
    return combinedCode;
  }, [activeTab, sheetBuilderCode, customFunctionsCode, combinedCode]);

  const highlightedHtml = useMemo(() => {
    return highlightCode(currentDisplayCode, 'javascript');
  }, [currentDisplayCode]);

  const lineCount = useMemo(() => {
    return currentDisplayCode.split('\n').length;
  }, [currentDisplayCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentDisplayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'combined' ? 'Code.gs' : `${modelName.replace(/\s+/g, '_')}_${activeTab}.gs`;
    const blob = new Blob([currentDisplayCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = () => {
    const manifest = {
      timeZone: "America/New_York",
      dependencies: {},
      exceptionLogging: "STACKDRIVER",
      runtimeVersion: "V8"
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appsscript.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header with Sub-Tabs */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('sheetBuilder')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'sheetBuilder'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Automated Sheet Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('customFunction')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'customFunction'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Custom Functions (=CALC)</span>
          </button>

          <button
            onClick={() => setActiveTab('combined')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'combined'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Package (Code.gs)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title="How to paste into Google Sheets"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadManifest}
            className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title="Download appsscript.json manifest"
          >
            <Download className="w-3 h-3 text-slate-400" />
            <span>manifest.json</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title="Download .gs file"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Download .gs</span>
          </button>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Script Meta Bar */}
      <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-emerald-400 font-medium">
            {activeTab === 'sheetBuilder' && 'buildFinancialModel()'}
            {activeTab === 'customFunction' && 'Custom Functions (@customfunction)'}
            {activeTab === 'combined' && 'Code.gs (Complete Package)'}
          </span>
          <span>•</span>
          <span>{lineCount} lines</span>
          <span>•</span>
          <span className="text-slate-500">Google Apps Script V8 Engine</span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400/90 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Ready for Extensions &gt; Apps Script</span>
        </div>
      </div>

      {/* Syntax-Highlighted Code View */}
      <div className="relative flex-1 overflow-auto bg-slate-950/90 font-mono text-[13px] p-4">
        <pre className="language-javascript">
          <code 
            className="language-javascript"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>

      {/* Footer tips */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>💡 Paste this code into Google Sheets: <strong>Extensions &gt; Apps Script</strong>, then save and refresh.</span>
        <button
          onClick={onOpenGuide}
          className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
        >
          View visual guide
        </button>
      </div>
    </div>
  );
};
