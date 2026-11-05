import React, { useRef, useState, useMemo } from 'react';
import { 
  Code2, 
  Upload, 
  Copy, 
  Check, 
  Trash2, 
  Play, 
  Sparkles, 
  FileCode,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FINANCIAL_TEMPLATES, FinancialTemplate } from '../data/templates';
import { TargetStyle, FormattingStyle } from '../types';

interface PythonEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onConvert: () => void;
  isConverting: boolean;
  onSelectTemplate: (template: FinancialTemplate) => void;
  activeTemplateId: string | null;
  targetStyle: TargetStyle;
  onTargetStyleChange: (style: TargetStyle) => void;
  formattingStyle: FormattingStyle;
  onFormattingStyleChange: (style: FormattingStyle) => void;
}

export const PythonEditor: React.FC<PythonEditorProps> = ({
  code,
  onChange,
  onConvert,
  isConverting,
  onSelectTemplate,
  activeTemplateId,
  targetStyle,
  onTargetStyleChange,
  formattingStyle,
  onFormattingStyleChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Line numbers calculation
  const lineNumbers = useMemo(() => {
    const lines = code.split('\n');
    return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);
  }, [code]);

  // Detected libraries & hints
  const detectedTags = useMemo(() => {
    const tags: string[] = [];
    if (code.includes('import numpy') || code.includes('np.')) tags.push('NumPy');
    if (code.includes('import pandas') || code.includes('pd.')) tags.push('Pandas');
    if (code.includes('math.')) tags.push('Math');
    if (code.includes('scipy')) tags.push('SciPy');
    if (code.includes('def ')) tags.push('Custom Functions');
    if (code.includes('return ')) tags.push('Return Statement');
    return tags;
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle Ctrl+Enter / Cmd+Enter to convert
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isConverting && code.trim()) {
        onConvert();
      }
    }
    // Allow Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      onChange(value.substring(0, start) + '    ' + value.substring(end));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Editor Header */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-200">Python Financial Model</span>
              <span className="text-[11px] font-mono text-slate-400">financial_model.py</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>{lineNumbers.length} lines</span>
              <span>•</span>
              <span>{(code.length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 ${
              showConfig 
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Configure conversion output preferences"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Options</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors flex items-center space-x-1"
            title="Upload Python script (.py)"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title="Copy Python Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title="Clear Code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Model Options Drawer */}
      {showConfig && (
        <div className="bg-slate-950/95 border-b border-slate-800 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Conversion Output Target:</label>
            <select
              value={targetStyle}
              onChange={(e) => onTargetStyleChange(e.target.value as TargetStyle)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Full Suite (Custom Functions + Sheet Builder Macro)</option>
              <option value="custom_function">Custom Functions Only (=CUSTOM_FORMULA)</option>
              <option value="sheet_builder">Sheet Builder Macro Only (SpreadsheetApp)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Sheets Visual Styling:</label>
            <select
              value={formattingStyle}
              onChange={(e) => onFormattingStyleChange(e.target.value as FormattingStyle)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="classic_wall_street">Classic Wall Street (Blue Inputs / Black Formulas)</option>
              <option value="modern_emerald">Google Sheets Modern (Emerald & Slate Accents)</option>
              <option value="minimalist">Minimalist Clean (High Data Density)</option>
            </select>
          </div>
        </div>
      )}

      {/* Quick Model Selector Pills */}
      <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">Sample Models:</span>
        {FINANCIAL_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-all ${
              activeTemplateId === tmpl.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Code Textarea & Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden bg-slate-950/80 font-mono text-[13px]">
        {/* Line Numbers Column */}
        <div 
          className="select-none py-3 px-3 text-right bg-slate-950 text-slate-600 border-r border-slate-800/80 font-mono text-xs w-12 shrink-0 overflow-hidden"
          aria-hidden="true"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="# Paste your Python financial model here (DCF, loan amortization, options, forecasting, etc.)..."
          spellCheck={false}
          className="w-full flex-1 p-3 bg-transparent text-emerald-100 placeholder-slate-600 focus:outline-none resize-none leading-6 font-mono text-xs sm:text-[13px] selection:bg-emerald-500/30 overflow-y-auto"
        />
      </div>

      {/* Footer Info & Convert CTA */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {detectedTags.map((tag) => (
            <span 
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
            >
              {tag}
            </span>
          ))}
          {detectedTags.length === 0 && (
            <span className="text-[11px] text-slate-500 italic">
              Paste or type Python financial logic
            </span>
          )}
        </div>

        <button
          onClick={onConvert}
          disabled={isConverting || !code.trim()}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg ${
            isConverting || !code.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/40 border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isConverting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Transpiling Model...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Convert to Sheets Script</span>
              <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] rounded bg-emerald-900/30 text-emerald-950 border border-emerald-900/20 font-mono">
                ⌘+Enter
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
