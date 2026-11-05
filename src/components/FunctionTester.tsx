import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import { ModelInput } from '../types';

interface FunctionTesterProps {
  customFunctionsCode: string;
  inputs: ModelInput[];
}

export const FunctionTester: React.FC<FunctionTesterProps> = ({
  customFunctionsCode,
  inputs,
}) => {
  // Extract function names from code (e.g. function DCF_SHARE_PRICE(...))
  const detectedFunctions = React.useMemo(() => {
    const regex = /function\s+([A-Z0-9_]+)\s*\(([^)]*)\)/gi;
    const matches: { name: string; params: string[] }[] = [];
    let match;
    while ((match = regex.exec(customFunctionsCode)) !== null) {
      const name = match[1];
      const params = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      matches.push({ name, params });
    }
    return matches;
  }, [customFunctionsCode]);

  const [selectedFnIndex, setSelectedFnIndex] = useState(0);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<unknown | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentFn = detectedFunctions[selectedFnIndex];

  // Initialize param values with default inputs
  useEffect(() => {
    if (currentFn) {
      const initial: Record<string, string> = {};
      currentFn.params.forEach((paramName) => {
        const found = inputs.find((inp) => 
          inp.name.toLowerCase().includes(paramName.toLowerCase()) || 
          paramName.toLowerCase().includes(inp.name.toLowerCase())
        );
        initial[paramName] = found?.defaultVal || '100';
      });
      setParamValues(initial);
      setTestResult(null);
      setTestError(null);
    }
  }, [currentFn, inputs]);

  const handleRunTest = async () => {
    if (!currentFn) return;
    setIsRunning(true);
    setTestError(null);
    setTestResult(null);

    const args = currentFn.params.map((p) => {
      const val = paramValues[p];
      const num = Number(val);
      return !isNaN(num) && val.trim() !== '' ? num : val;
    });

    try {
      const res = await fetch('/api/simulate-function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionCode: customFunctionsCode,
          functionName: currentFn.name,
          args,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(data.result);
      } else {
        setTestError(data.error || 'Failed to simulate calculation.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestError(error.message || 'Error communicating with server.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!currentFn) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No custom sheet functions found in current transpilation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Custom Function Playground & Dry-Run</h3>
            <p className="text-xs text-slate-400">Test the Google Apps Script function before deploying to Google Sheets</p>
          </div>
        </div>

        {/* Function selector if multiple */}
        {detectedFunctions.length > 1 && (
          <select
            value={selectedFnIndex}
            onChange={(e) => setSelectedFnIndex(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {detectedFunctions.map((fn, idx) => (
              <option key={fn.name} value={idx}>
                ={fn.name}()
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Form and Output */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Function Formula signature */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
          <span className="text-slate-500 select-none">Formula: </span>
          <span className="text-emerald-400 font-semibold">={currentFn.name}</span>
          <span className="text-slate-400">(</span>
          <span className="text-amber-300">
            {currentFn.params.join(', ')}
          </span>
          <span className="text-slate-400">)</span>
        </div>

        {/* Dynamic Inputs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentFn.params.map((param) => {
            const matchingInput = inputs.find((i) => i.name.toLowerCase().includes(param.toLowerCase()));
            return (
              <div key={param} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {param}
                </label>
                <input
                  type="text"
                  value={paramValues[param] ?? ''}
                  onChange={(e) =>
                    setParamValues({ ...paramValues, [param]: e.target.value })
                  }
                  placeholder="e.g. 100"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                {matchingInput && (
                  <span className="block text-[10px] text-slate-500 mt-1 truncate">
                    {matchingInput.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Google Sheets formula...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Dry-Run Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Simulation Output Card */}
        {testResult !== null && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 animate-in fade-in">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Google Sheets Return Value:
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-emerald-400">
              {typeof testResult === 'number'
                ? testResult.toLocaleString('en-US', { maximumFractionDigits: 4 })
                : JSON.stringify(testResult, null, 2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ✓ Executed in Google Apps Script simulated environment with 0 errors.
            </p>
          </div>
        )}

        {testError && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Execution Error:</span>
              <span className="font-mono">{testError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
