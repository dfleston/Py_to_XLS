import React from 'react';
import { ModelInput, ModelOutput } from '../types';
import { Layers, Lightbulb, TrendingUp, Info } from 'lucide-react';

interface ModelSummaryCardProps {
  modelName: string;
  summary: string;
  inputs: ModelInput[];
  outputs: ModelOutput[];
  insights: string[];
}

export const ModelSummaryCard: React.FC<ModelSummaryCardProps> = ({
  modelName,
  summary,
  inputs,
  outputs,
  insights,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 space-y-5">
      {/* Title & Summary */}
      <div>
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Model Architecture
          </span>
          <h2 className="text-base font-bold text-slate-100">{modelName}</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Inputs & Outputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Detected Inputs & Assumptions ({inputs.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {inputs.map((inp, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                <div>
                  <span className="font-mono text-blue-300 font-medium">{inp.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                    {inp.description}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                    {inp.defaultVal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outputs */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Target KPIs & Computed Outputs ({outputs.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {outputs.map((out, idx) => (
              <div key={idx} className="text-xs py-1 border-b border-slate-800/50 last:border-0">
                <span className="font-mono text-emerald-300 font-medium">{out.name}</span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {out.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      {insights && insights.length > 0 && (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
            <span>Financial Engineering & Google Sheets Best Practices:</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            {insights.map((ins, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
