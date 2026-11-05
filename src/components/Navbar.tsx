import React from 'react';
import { 
  FileSpreadsheet, 
  Code2, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { FINANCIAL_TEMPLATES, FinancialTemplate } from '../data/templates';

interface NavbarProps {
  onSelectTemplate: (template: FinancialTemplate) => void;
  onOpenGuide: () => void;
  activeTemplateId: string | null;
  isConverting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTemplate,
  onOpenGuide,
  activeTemplateId,
  isConverting,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border border-slate-900 shadow">
              <Code2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">PyFin<span className="text-emerald-400">2</span>Sheets</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Apps Script Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Python Financial Models ➔ Google Sheets Scripts & Formulas
            </p>
          </div>
        </div>

        {/* Templates Quick Selector */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">Templates:</span>
            <select
              aria-label="Financial Model Template"
              value={activeTemplateId || ''}
              onChange={(e) => {
                const selected = FINANCIAL_TEMPLATES.find((t) => t.id === e.target.value);
                if (selected) onSelectTemplate(selected);
              }}
              className="bg-transparent text-emerald-300 font-medium border-0 focus:ring-0 cursor-pointer text-xs pr-4 py-0.5"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select model...</option>
              {FINANCIAL_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id} className="bg-slate-900 text-slate-200">
                  {tmpl.name} ({tmpl.badge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            title="Create a fresh Google Sheet in a new tab"
          >
            <span>sheets.new</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install Guide</span>
          </button>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-mono font-medium">Gemini 3.8 Flash</span>
          </div>
        </div>

      </div>
    </header>
  );
};
