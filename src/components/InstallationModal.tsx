import React from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle, 
  ShieldAlert, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  combinedCode: string;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({
  isOpen,
  onClose,
  combinedCode,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(combinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Open Google Sheets',
      desc: 'Create or open an existing spreadsheet at sheets.new or drive.google.com.',
      actionText: 'Open sheets.new',
      actionUrl: 'https://sheets.new',
    },
    {
      num: 2,
      title: 'Open Apps Script Editor',
      desc: 'In the top menu bar of your Google Sheet, click Extensions > Apps Script. A new editor tab will open.',
    },
    {
      num: 3,
      title: 'Paste the Script into Code.gs',
      desc: 'Delete any existing placeholder code in Code.gs and paste your converted script.',
      actionButton: true,
    },
    {
      num: 4,
      title: 'Save the Project',
      desc: 'Click the floppy disk Save icon (💾) or press Ctrl+S (Cmd+S on Mac).',
    },
    {
      num: 5,
      title: 'Refresh & Run',
      desc: 'Return to your spreadsheet tab and reload (F5 / Cmd+R). A new "📊 Financial Models" menu will appear in the toolbar, or type =YOUR_FUNCTION() directly into any cell!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                How to Install in Google Sheets
              </h2>
              <p className="text-xs text-slate-400">
                Setup takes under 60 seconds with no external add-ons required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Quick Copy Script Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="font-semibold text-emerald-300 block text-xs">Step 0: Copy Transpiled Script</span>
              <span className="text-xs text-slate-300">Ready to paste directly into Google Apps Script</span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
            </button>
          </div>

          {/* Numbered Steps */}
          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {s.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200 text-xs sm:text-sm">
                      {s.title}
                    </h4>
                    {s.actionUrl && (
                      <a
                        href={s.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-1 font-medium"
                      >
                        <span>{s.actionText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Google Permissions Pro-tip */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300/90 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>First-Time Authorization Note:</span>
            </div>
            <p className="text-slate-300 pl-5 text-[11px] leading-relaxed">
              When running the sheet builder macro for the first time, Google will ask: <em>&ldquo;Authorization Required&rdquo;</em>.
              Click <strong>Continue</strong> &gt; Select your Google account &gt; Click <strong>Advanced</strong> &gt; Click <strong>Go to Untitled project (unsafe)</strong> &gt; Click <strong>Allow</strong>.
              This is standard Google Apps Script behavior for scripts running on your personal spreadsheet.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            PyFin2Sheets • Google Apps Script V8 Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
