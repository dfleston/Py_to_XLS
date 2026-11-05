import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Code, 
  Layers, 
  Terminal, 
  Calculator, 
  Info, 
  Sparkles, 
  AlertCircle,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { PythonEditor } from './components/PythonEditor';
import { AppsScriptViewer } from './components/AppsScriptViewer';
import { InteractiveSpreadsheetPreview } from './components/InteractiveSpreadsheetPreview';
import { FormulaMappingTable } from './components/FormulaMappingTable';
import { FunctionTester } from './components/FunctionTester';
import { ModelSummaryCard } from './components/ModelSummaryCard';
import { InstallationModal } from './components/InstallationModal';
import { FINANCIAL_TEMPLATES, FinancialTemplate } from './data/templates';
import { ConversionResponse, TargetStyle, FormattingStyle } from './types';

export default function App() {
  const initialTemplate = FINANCIAL_TEMPLATES[0];
  const [pythonCode, setPythonCode] = useState<string>(initialTemplate.pythonCode);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(initialTemplate.id);
  const [targetStyle, setTargetStyle] = useState<TargetStyle>('all');
  const [formattingStyle, setFormattingStyle] = useState<FormattingStyle>('classic_wall_street');
  
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<ConversionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'script' | 'mapping' | 'tester' | 'summary'>('preview');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [copiedQuick, setCopiedQuick] = useState<boolean>(false);

  // Trigger conversion API
  const handleConvert = async (codeToConvert: string = pythonCode, tmplId: string | null = activeTemplateId) => {
    if (!codeToConvert.trim()) return;

    setIsConverting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pythonCode: codeToConvert,
          modelType: tmplId || 'custom',
          targetStyle,
          formattingStyle,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: ConversionResponse = await response.json();
      setConversionResult(data);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Conversion failed:', error);
      setErrorMsg(error.message || 'Failed to transpile Python financial model.');
    } finally {
      setIsConverting(false);
    }
  };

  // Convert on first mount to provide immediate rich experience
  useEffect(() => {
    handleConvert(initialTemplate.pythonCode, initialTemplate.id);
  }, []);

  const handleSelectTemplate = (tmpl: FinancialTemplate) => {
    setPythonCode(tmpl.pythonCode);
    setActiveTemplateId(tmpl.id);
    handleConvert(tmpl.pythonCode, tmpl.id);
  };

  const handleQuickCopyScript = async () => {
    if (!conversionResult) return;
    const combined = `// ${conversionResult.modelName}\n\n${conversionResult.customFunctionsCode}\n\n${conversionResult.sheetBuilderCode}`;
    await navigator.clipboard.writeText(combined);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  const combinedScript = conversionResult 
    ? `${conversionResult.customFunctionsCode}\n\n${conversionResult.sheetBuilderCode}`
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        onSelectTemplate={handleSelectTemplate}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeTemplateId={activeTemplateId}
        isConverting={isConverting}
      />

      {/* Hero Subheader & Stats Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">
              {conversionResult ? conversionResult.modelName : 'Financial Model Transpiler'}
            </span>
            {conversionResult && (
              <span className="text-slate-500 hidden md:inline">
                • {conversionResult.inputs.length} Inputs • {conversionResult.outputs.length} Outputs • {conversionResult.formulaMapping.length} Formula Maps
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {conversionResult && (
              <button
                onClick={handleQuickCopyScript}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  copiedQuick
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {copiedQuick ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuick ? 'Script Copied!' : 'Copy Code.gs'}</span>
              </button>
            )}

            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Paste into Sheets Guide
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => handleConvert()}
              className="underline hover:text-white font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace (Split Grid) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[750px]">
          
          {/* Left Column: Python Input Editor (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
            <PythonEditor
              code={pythonCode}
              onChange={(newCode) => {
                setPythonCode(newCode);
                setActiveTemplateId(null);
              }}
              onConvert={() => handleConvert(pythonCode, activeTemplateId)}
              isConverting={isConverting}
              onSelectTemplate={handleSelectTemplate}
              activeTemplateId={activeTemplateId}
              targetStyle={targetStyle}
              onTargetStyleChange={setTargetStyle}
              formattingStyle={formattingStyle}
              onFormattingStyleChange={setFormattingStyle}
            />
          </div>

          {/* Right Column: Google Sheets Results Suite (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            {/* Right Pane Navigation Bar */}
            <div className="flex items-center space-x-1 mb-3 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveRightTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  activeRightTab === 'preview'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Interactive Sheet</span>
              </button>

              <button
                onClick={() => setActiveRightTab('script')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  activeRightTab === 'script'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Apps Script (Code.gs)</span>
              </button>

              <button
                onClick={() => setActiveRightTab('mapping')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  activeRightTab === 'mapping'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Formula Mapping</span>
              </button>

              <button
                onClick={() => setActiveRightTab('tester')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  activeRightTab === 'tester'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Dry-Run Tester</span>
              </button>

              <button
                onClick={() => setActiveRightTab('summary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  activeRightTab === 'summary'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Model Architecture</span>
              </button>
            </div>

            {/* Right Pane Content Area */}
            <div className="flex-1 min-h-0">
              {conversionResult ? (
                <>
                  {activeRightTab === 'preview' && (
                    <InteractiveSpreadsheetPreview
                      modelName={conversionResult.modelName}
                      mockSheetData={conversionResult.mockSheetData}
                      onOpenGuide={() => setIsGuideOpen(true)}
                    />
                  )}

                  {activeRightTab === 'script' && (
                    <AppsScriptViewer
                      sheetBuilderCode={conversionResult.sheetBuilderCode}
                      customFunctionsCode={conversionResult.customFunctionsCode}
                      modelName={conversionResult.modelName}
                      onOpenGuide={() => setIsGuideOpen(true)}
                    />
                  )}

                  {activeRightTab === 'mapping' && (
                    <FormulaMappingTable
                      mappings={conversionResult.formulaMapping}
                    />
                  )}

                  {activeRightTab === 'tester' && (
                    <FunctionTester
                      customFunctionsCode={conversionResult.customFunctionsCode}
                      inputs={conversionResult.inputs}
                    />
                  )}

                  {activeRightTab === 'summary' && (
                    <ModelSummaryCard
                      modelName={conversionResult.modelName}
                      summary={conversionResult.summary}
                      inputs={conversionResult.inputs}
                      outputs={conversionResult.outputs}
                      insights={conversionResult.insights}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">
                    Ready to Transpile Financial Model
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Click &ldquo;Convert to Sheets Script&rdquo; or select one of the financial templates above.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Google Sheets Installation Modal */}
      <InstallationModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        combinedCode={combinedScript}
      />
    </div>
  );
}
