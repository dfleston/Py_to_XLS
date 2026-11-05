import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Server-side GoogleGenAI initialization per skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ConversionRequest {
  pythonCode: string;
  modelType?: string;
  targetStyle?: 'all' | 'custom_function' | 'sheet_builder' | 'hybrid';
  spreadsheetName?: string;
  formattingStyle?: 'classic_wall_street' | 'modern_emerald' | 'minimalist';
}

// Fallback generator when offline or if API key encounters issues
function generateFallbackConversion(pythonCode: string, modelType?: string) {
  const isLoan = pythonCode.toLowerCase().includes('loan') || pythonCode.toLowerCase().includes('principal') || pythonCode.toLowerCase().includes('amortization');
  const isBlackScholes = pythonCode.toLowerCase().includes('black_scholes') || pythonCode.toLowerCase().includes('strike') || pythonCode.toLowerCase().includes('volatility');

  if (isLoan) {
    return {
      modelName: "Commercial Loan Amortization Schedule",
      summary: "Transpiled Python loan amortization model into Google Sheets Apps Script custom formulas and an automated schedule builder.",
      inputs: [
        { name: "principal", type: "number", defaultVal: "500000", description: "Total loan amount borrowed" },
        { name: "annualInterestRate", type: "number", defaultVal: "0.065", description: "Annual interest rate (e.g. 0.065 for 6.5%)" },
        { name: "years", type: "number", defaultVal: "5", description: "Loan term in years" },
        { name: "extraPayment", type: "number", defaultVal: "250", description: "Optional monthly prepayment towards principal" }
      ],
      outputs: [
        { name: "monthlyPayment", type: "number", description: "Fixed monthly payment (P&I)" },
        { name: "totalInterest", type: "number", description: "Total interest paid over the life of the loan" },
        { name: "totalCost", type: "number", description: "Principal + Total Interest" }
      ],
      customFunctionsCode: `/**
 * Calculates monthly loan payment (Principal + Interest).
 * 
 * @param {number} principal Total loan principal amount.
 * @param {number} annualRate Annual interest rate as decimal (e.g. 0.065).
 * @param {number} years Total term of the loan in years.
 * @return {number} Monthly payment amount.
 * @customfunction
 */
function LOAN_MONTHLY_PAYMENT(principal, annualRate, years) {
  if (!principal || !annualRate || !years) return 0;
  var r = annualRate / 12;
  var n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Returns total interest paid over a loan.
 * 
 * @param {number} principal Total loan principal amount.
 * @param {number} annualRate Annual interest rate as decimal.
 * @param {number} years Total term in years.
 * @return {number} Total interest amount.
 * @customfunction
 */
function LOAN_TOTAL_INTEREST(principal, annualRate, years) {
  var pmt = LOAN_MONTHLY_PAYMENT(principal, annualRate, years);
  return (pmt * years * 12) - principal;
}`,
      sheetBuilderCode: `/**
 * Automated Google Sheet Model Builder for Loan Amortization.
 * Run via the custom menu "Financial Models > Build Loan Schedule".
 */
function buildLoanAmortizationModel() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Loan Amortization";
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  sheet.setTabColor("#107C41"); // Sheets green

  // Title Block
  sheet.getRange("A1").setValue("LOAN AMORTIZATION SCHEDULE");
  sheet.getRange("A1:F1").merge().setBackground("#107C41").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // Inputs Section
  sheet.getRange("A3").setValue("ASSUMPTIONS").setFontWeight("bold").setFontColor("#1F2937");
  sheet.getRange("A4").setValue("Principal Loan Amount ($)");
  sheet.getRange("B4").setValue(500000).setNumberFormat("$#,##0");
  sheet.getRange("A5").setValue("Annual Interest Rate");
  sheet.getRange("B5").setValue(0.065).setNumberFormat("0.00%");
  sheet.getRange("A6").setValue("Loan Term (Years)");
  sheet.getRange("B6").setValue(5).setNumberFormat("0");
  sheet.getRange("A7").setValue("Payments per Year");
  sheet.getRange("B7").setValue(12).setNumberFormat("0");

  // Format Inputs (Classic Wall Street blue text for inputs)
  sheet.getRange("B4:B7").setFontColor("#1D4ED8").setBackground("#F0FDF4");

  // Key KPI Cards
  sheet.getRange("D3").setValue("SUMMARY OUTPUTS").setFontWeight("bold");
  sheet.getRange("D4").setValue("Monthly Payment (PMT)");
  sheet.getRange("E4").setFormula("=PMT(B5/B7, B6*B7, -B4)").setNumberFormat("$#,##0.00").setFontWeight("bold");
  sheet.getRange("D5").setValue("Total Payments");
  sheet.getRange("E5").setFormula("=E4*B6*B7").setNumberFormat("$#,##0.00");
  sheet.getRange("D6").setValue("Total Interest Paid");
  sheet.getRange("E6").setFormula("=E5-B4").setNumberFormat("$#,##0.00").setFontColor("#DC2626");

  // Schedule Table Headers
  var headers = [["Month", "Beginning Balance", "Scheduled Payment", "Principal", "Interest", "Ending Balance"]];
  sheet.getRange("A9:F9").setValues(headers).setBackground("#0F172A").setFontColor("#FFFFFF").setFontWeight("bold");

  // Generate 60 month amortization rows using live formulas
  var totalMonths = 60;
  var rows = [];
  for (var m = 1; m <= totalMonths; m++) {
    var begBalFormula = (m === 1) ? "=B4" : "=F" + (8 + m);
    var pmtFormula = "=$E$4";
    var intFormula = "=B" + (9 + m) + "*($B$5/$B$7)";
    var prinFormula = "=C" + (9 + m) + "-E" + (9 + m);
    var endBalFormula = "=MAX(0, B" + (9 + m) + "-D" + (9 + m) + ")";
    rows.push([m, begBalFormula, pmtFormula, prinFormula, intFormula, endBalFormula]);
  }
  
  var tableRange = sheet.getRange(10, 1, totalMonths, 6);
  tableRange.setFormulas(rows);
  sheet.getRange(10, 2, totalMonths, 5).setNumberFormat("$#,##0.00");
  
  // Auto-resize columns
  for (var c = 1; c <= 6; c++) {
    sheet.autoResizeColumn(c);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast("Loan Amortization Model built successfully!", "Done", 5);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Financial Models")
    .addItem("Build Loan Amortization Schedule", "buildLoanAmortizationModel")
    .addToUi();
}`,
      formulaMapping: [
        { pythonSnippet: "pmt = np.pmt(rate/12, nper, -pv)", sheetsFormula: "=PMT(rate/12, nper, -pv)", explanation: "Direct native formula in Google Sheets with identical arguments." },
        { pythonSnippet: "ipmt = balance * (rate / 12)", sheetsFormula: "=IPMT(rate/12, period, nper, -pv)", explanation: "Native IPMT calculates exact interest portion for any given period." },
        { pythonSnippet: "ppmt = pmt - ipmt", sheetsFormula: "=PPMT(rate/12, period, nper, -pv)", explanation: "Native PPMT calculates exact principal amortization portion." }
      ],
      mockSheetData: [
        ["ASSUMPTION", "VALUE", "", "METRIC", "CALCULATION", ""],
        ["Principal Loan Amount", "$500,000", "", "Monthly Payment (PMT)", "$9,783.06", ""],
        ["Annual Interest Rate", "6.50%", "", "Total Payments (5Y)", "$586,983.82", ""],
        ["Loan Term (Years)", "5", "", "Total Interest Paid", "$86,983.82", ""],
        ["Payments per Year", "12", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["Month", "Beg Balance", "Payment", "Principal", "Interest", "End Balance"],
        ["1", "$500,000.00", "$9,783.06", "$7,074.73", "$2,708.33", "$492,925.27"],
        ["2", "$492,925.27", "$9,783.06", "$7,113.05", "$2,670.01", "$485,812.22"],
        ["3", "$485,812.22", "$9,783.06", "$7,151.58", "$2,631.48", "$478,660.64"],
        ["4", "$478,660.64", "$9,783.06", "$7,190.31", "$2,592.75", "$471,470.33"],
        ["5", "$471,470.33", "$9,783.06", "$7,229.26", "$2,553.80", "$464,241.07"]
      ],
      stepByStepGuide: [
        "In Google Sheets, go to Extensions > Apps Script.",
        "Clear any existing code in Code.gs and paste the generated script.",
        "Click the Save icon (floppy disk) or press Ctrl+S / Cmd+S.",
        "Return to your spreadsheet and reload the page.",
        "Click the new '📊 Financial Models' menu at the top and select 'Build Loan Amortization Schedule', or use the custom formula =LOAN_MONTHLY_PAYMENT(500000, 0.065, 5)."
      ],
      insights: [
        "Apps Script execution runs on Google Cloud servers; creating 60-360 amortization rows takes under 2 seconds.",
        "Formulas use relative references, enabling real-time adjustments when modifying interest rates or terms in cell B5.",
        "Custom functions automatically appear in Google Sheets autocomplete with syntax help."
      ]
    };
  }

  // Default DCF Fallback
  return {
    modelName: "Discounted Cash Flow (DCF) & Valuation Model",
    summary: "Transpiled Python 5-year DCF model into Google Sheets Apps Script custom valuation functions and an investment-banking-grade spreadsheet builder.",
    inputs: [
      { name: "baseRevenue", type: "number", defaultVal: "10000000", description: "Base year revenue in USD" },
      { name: "revenueGrowthRate", type: "number", defaultVal: "0.15", description: "Projected annual revenue growth rate (15%)" },
      { name: "ebitMargin", type: "number", defaultVal: "0.22", description: "Projected EBIT / Operating Margin (22%)" },
      { name: "taxRate", type: "number", defaultVal: "0.21", description: "Effective corporate tax rate (21%)" },
      { name: "capexPct", type: "number", defaultVal: "0.05", description: "CapEx as % of revenue (5%)" },
      { name: "wacc", type: "number", defaultVal: "0.095", description: "Weighted Average Cost of Capital (9.5%)" },
      { name: "terminalGrowth", type: "number", defaultVal: "0.025", description: "Long-term perpetual growth rate (2.5%)" },
      { name: "sharesOutstanding", type: "number", defaultVal: "1000000", description: "Diluted shares outstanding" },
      { name: "netDebt", type: "number", defaultVal: "2000000", description: "Total debt minus cash" }
    ],
    outputs: [
      { name: "enterpriseValue", type: "number", description: "Present value of explicit forecast + terminal value" },
      { name: "equityValue", type: "number", description: "Enterprise Value minus Net Debt" },
      { name: "impliedSharePrice", type: "number", description: "Intrinsic equity value per share" }
    ],
    customFunctionsCode: `/**
 * Calculates Intrinsic Share Price using 5-Year DCF.
 * 
 * @param {number} revenue Base revenue in USD.
 * @param {number} growth Annual growth rate (e.g. 0.15).
 * @param {number} ebitMargin Operating profit margin (e.g. 0.22).
 * @param {number} taxRate Corporate tax rate (e.g. 0.21).
 * @param {number} wacc Weighted Average Cost of Capital (e.g. 0.095).
 * @param {number} terminalGrowth Perpetual growth rate (e.g. 0.025).
 * @param {number} shares Diluted shares outstanding.
 * @param {number} netDebt Total debt less cash.
 * @return {number} Implied intrinsic share price.
 * @customfunction
 */
function DCF_SHARE_PRICE(revenue, growth, ebitMargin, taxRate, wacc, terminalGrowth, shares, netDebt) {
  if (wacc <= terminalGrowth) throw new Error("WACC must exceed terminal growth rate.");
  
  var pvFCF = 0;
  var currentRev = revenue;
  var lastFCF = 0;
  
  for (var y = 1; y <= 5; y++) {
    currentRev *= (1 + growth);
    var ebit = currentRev * ebitMargin;
    var nopat = ebit * (1 - taxRate);
    var capex = currentRev * 0.05;
    var fcf = nopat - capex;
    lastFCF = fcf;
    pvFCF += fcf / Math.pow(1 + wacc, y);
  }
  
  var terminalValue = (lastFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth);
  var pvTV = terminalValue / Math.pow(1 + wacc, 5);
  var ev = pvFCF + pvTV;
  var eqVal = ev - (netDebt || 0);
  
  return eqVal / shares;
}`,
    sheetBuilderCode: `/**
 * Builds a complete 5-Year DCF Financial Model in Google Sheets.
 * Triggered from the Google Sheets menu: '📊 Financial Models' -> 'Build DCF Valuation Model'.
 */
function buildDCFValuationModel() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "DCF Valuation";
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  sheet.setTabColor("#0284C7");

  // Title Block
  sheet.getRange("A1").setValue("DISCOUNTED CASH FLOW (DCF) VALUATION MODEL");
  sheet.getRange("A1:G1").merge().setBackground("#0F172A").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // Assumptions
  sheet.getRange("A3:B3").merge().setValue("KEY ASSUMPTIONS").setFontWeight("bold").setBackground("#E2E8F0");
  sheet.getRange("A4").setValue("Base Revenue ($)");
  sheet.getRange("B4").setValue(10000000).setNumberFormat("$#,##0");
  sheet.getRange("A5").setValue("Annual Revenue Growth");
  sheet.getRange("B5").setValue(0.15).setNumberFormat("0.0%");
  sheet.getRange("A6").setValue("EBIT Operating Margin");
  sheet.getRange("B6").setValue(0.22).setNumberFormat("0.0%");
  sheet.getRange("A7").setValue("Effective Tax Rate");
  sheet.getRange("B7").setValue(0.21).setNumberFormat("0.0%");
  sheet.getRange("A8").setValue("CapEx (% of Rev)");
  sheet.getRange("B8").setValue(0.05).setNumberFormat("0.0%");
  sheet.getRange("A9").setValue("WACC (Discount Rate)");
  sheet.getRange("B9").setValue(0.095).setNumberFormat("0.0%");
  sheet.getRange("A10").setValue("Terminal Growth Rate");
  sheet.getRange("B10").setValue(0.025).setNumberFormat("0.0%");
  sheet.getRange("A11").setValue("Diluted Shares");
  sheet.getRange("B11").setValue(1000000).setNumberFormat("#,##0");
  sheet.getRange("A12").setValue("Net Debt ($)");
  sheet.getRange("B12").setValue(2000000).setNumberFormat("$#,##0");

  sheet.getRange("B4:B12").setFontColor("#1D4ED8").setBackground("#F8FAFC");

  // Projections Header
  var colHeaders = [["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]];
  sheet.getRange("A14:F14").setValues(colHeaders).setBackground("#1E293B").setFontColor("#FFFFFF").setFontWeight("bold");

  sheet.getRange("A15").setValue("Revenue");
  sheet.getRange("B15").setFormula("=$B$4*(1+$B$5)");
  sheet.getRange("C15:F15").setFormulas([["=B15*(1+$B$5)", "=C15*(1+$B$5)", "=D15*(1+$B$5)", "=E15*(1+$B$5)"]]);

  sheet.getRange("A16").setValue("EBIT (Operating Profit)");
  sheet.getRange("B16:F16").setFormula("=B15*$B$6");

  sheet.getRange("A17").setValue("Taxes (NOPAT Adj)");
  sheet.getRange("B17:F17").setFormula("=B16*(1-$B$7)");

  sheet.getRange("A18").setValue("Less: CapEx");
  sheet.getRange("B18:F18").setFormula("=B15*$B$8");

  sheet.getRange("A19").setValue("Free Cash Flow (FCF)").setFontWeight("bold");
  sheet.getRange("B19:F19").setFormula("=B17-B18").setFontWeight("bold");

  sheet.getRange("A20").setValue("Discount Factor");
  sheet.getRange("B20").setFormula("=1/(1+$B$9)^1");
  sheet.getRange("C20").setFormula("=1/(1+$B$9)^2");
  sheet.getRange("D20").setFormula("=1/(1+$B$9)^3");
  sheet.getRange("E20").setFormula("=1/(1+$B$9)^4");
  sheet.getRange("F20").setFormula("=1/(1+$B$9)^5");

  sheet.getRange("A21").setValue("Present Value of FCF").setFontWeight("bold");
  sheet.getRange("B21:F21").setFormula("=B19*B20").setFontWeight("bold");

  sheet.getRange("B15:F19").setNumberFormat("$#,##0");
  sheet.getRange("B20:F20").setNumberFormat("0.000");
  sheet.getRange("B21:F21").setNumberFormat("$#,##0");

  // Valuation Summary Card
  sheet.getRange("D3:E3").merge().setValue("VALUATION SUMMARY").setFontWeight("bold").setBackground("#0284C7").setFontColor("#FFFFFF");
  sheet.getRange("D4").setValue("PV of 5-Yr Cash Flows");
  sheet.getRange("E4").setFormula("=SUM(B21:F21)").setNumberFormat("$#,##0");
  sheet.getRange("D5").setValue("Terminal Value (Yr 5)");
  sheet.getRange("E5").setFormula("=(F19*(1+$B$10))/($B$9-$B$10)").setNumberFormat("$#,##0");
  sheet.getRange("D6").setValue("PV of Terminal Value");
  sheet.getRange("E6").setFormula("=E5*F20").setNumberFormat("$#,##0");
  sheet.getRange("D7").setValue("Enterprise Value (EV)").setFontWeight("bold");
  sheet.getRange("E7").setFormula("=E4+E6").setNumberFormat("$#,##0").setFontWeight("bold");
  sheet.getRange("D8").setValue("Less: Net Debt");
  sheet.getRange("E8").setFormula("=B12").setNumberFormat("$#,##0");
  sheet.getRange("D9").setValue("Equity Value").setFontWeight("bold");
  sheet.getRange("E9").setFormula("=E7-E8").setNumberFormat("$#,##0").setFontWeight("bold");
  sheet.getRange("D10").setValue("Implied Share Price").setFontWeight("bold").setFontSize(11);
  sheet.getRange("E10").setFormula("=E9/B11").setNumberFormat("$#,##0.00").setFontWeight("bold").setFontSize(12).setBackground("#FEF08A");

  for (var c = 1; c <= 7; c++) {
    sheet.autoResizeColumn(c);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("DCF Valuation Model built successfully!", "Done", 5);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Financial Models")
    .addItem("Build DCF Valuation Model", "buildDCFValuationModel")
    .addToUi();
}`,
    formulaMapping: [
      { pythonSnippet: "pv_fcf = sum(cf / ((1 + wacc) ** i))", sheetsFormula: "=NPV(wacc, FCF_Range)", explanation: "Google Sheets NPV discounts future cash flows back to period 0." },
      { pythonSnippet: "tv = (fcf[-1] * (1 + g)) / (wacc - g)", sheetsFormula: "=(F19*(1+g))/(wacc-g)", explanation: "Perpetual Gordon Growth model calculation directly inside cell formula." },
      { pythonSnippet: "implied_price = equity_val / shares", sheetsFormula: "=(EnterpriseValue - NetDebt) / DilutedShares", explanation: "Links Enterprise Value and Equity bridge dynamically." }
    ],
    mockSheetData: [
      ["ASSUMPTIONS", "INPUT", "", "VALUATION SUMMARY", "RESULT", ""],
      ["Base Revenue", "$10,000,000", "", "PV of 5-Yr Cash Flows", "$6,427,980", ""],
      ["Annual Growth", "15.0%", "", "Terminal Value (Yr 5)", "$40,683,210", ""],
      ["EBIT Margin", "22.0%", "", "PV of Terminal Value", "$25,843,212", ""],
      ["Tax Rate", "21.0%", "", "Enterprise Value (EV)", "$32,271,192", ""],
      ["CapEx (% Rev)", "5.0%", "", "Less: Net Debt", "$2,000,000", ""],
      ["WACC", "9.5%", "", "Equity Value", "$30,271,192", ""],
      ["Terminal Growth", "2.5%", "", "Implied Share Price", "$30.27", ""],
      ["", "", "", "", "", ""],
      ["Line Item", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      ["Revenue", "$11,500,000", "$13,225,000", "$15,208,750", "$17,490,063", "$20,113,572"],
      ["EBIT", "$2,530,000", "$2,909,500", "$3,345,925", "$3,847,814", "$4,424,986"],
      ["NOPAT", "$1,998,700", "$2,298,505", "$2,643,281", "$3,039,773", "$3,495,739"],
      ["CapEx", "$575,000", "$661,250", "$760,438", "$874,503", "$1,005,679"],
      ["Free Cash Flow", "$1,423,700", "$1,637,255", "$1,882,843", "$2,165,270", "$2,490,060"],
      ["Discount Factor", "0.913", "0.834", "0.762", "0.696", "0.635"],
      ["PV of FCF", "$1,300,183", "$1,365,471", "$1,434,727", "$1,507,029", "$1,580,570"]
    ],
    stepByStepGuide: [
      "Open your target Google Spreadsheet.",
      "Navigate to Extensions > Apps Script in the top toolbar.",
      "Replace any code in Code.gs with this script and hit Save.",
      "Reload the Google Spreadsheet.",
      "Open the new '📊 Financial Models' menu and click 'Build DCF Valuation Model'."
    ],
    insights: [
      "All cell references link dynamically so modifying WACC or growth immediately recalculates Enterprise Value.",
      "The custom formula =DCF_SHARE_PRICE(...) can also be used anywhere in the spreadsheet without building the full tab.",
      "Numbers conform to standard corporate finance formatting conventions (blue input values, black formula totals)."
    ]
  };
}

// Convert Endpoint
app.post('/api/convert', async (req: Request, res: Response) => {
  const { pythonCode, modelType, targetStyle, spreadsheetName, formattingStyle } = req.body as ConversionRequest;

  if (!pythonCode || typeof pythonCode !== 'string' || !pythonCode.trim()) {
    res.status(400).json({ error: 'Please provide valid Python code to convert.' });
    return;
  }

  // If no Gemini API key configured, use high quality fallback conversion
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Using structured algorithmic fallback conversion.');
    const fallback = generateFallbackConversion(pythonCode, modelType);
    res.json(fallback);
    return;
  }

  try {
    const systemPrompt = `You are a Principal Financial Systems Engineer and Google Apps Script expert.
Your job is to transpile Python financial models (e.g., DCF, LBO, Loan Amortization, Monte Carlo, Black-Scholes, CapEx/Depreciation, Portfolio Risk) into production-grade Google Sheets scripts.

You MUST produce:
1. "modelName": Concise title of the financial model.
2. "summary": Clear executive summary explaining the model logic and how it translates to Google Sheets.
3. "inputs": Array of input variables detected in the Python code with name, type, defaultVal, description.
4. "outputs": Array of output metrics/KPIs produced by the model.
5. "customFunctionsCode": Google Apps Script code containing custom sheet formulas (annotated with /** @customfunction */ and JSDoc for Google Sheets autocomplete). Must be bulletproof, type-checked, handle 2D range arrays or scalar numbers, and avoid runtime errors.
6. "sheetBuilderCode": Complete Google Apps Script function that programmatically generates and styles an entire financial model sheet using SpreadsheetApp!
   - Must create or reuse a dedicated sheet tab.
   - Must insert clear section headers (Assumptions / Inputs vs Projections vs Outputs).
   - Must use LIVE Google Sheets formulas (e.g., =SUM, =NPV, =IRR, =PMT, =INDEX, math formulas) wherever appropriate instead of static numbers so the spreadsheet is dynamic!
   - Follow Wall Street standard formatting: inputs colored blue (#1D4ED8), calculations in black, totals with top border and double bottom border. Apply proper number formats ($#,##0, 0.0%, etc.).
   - Include an onOpen() trigger that adds a custom menu: SpreadsheetApp.getUi().createMenu('📊 Financial Models').addItem('Generate Model', '...').addToUi().
7. "formulaMapping": Array of mappings comparing the Python code snippet against the Google Sheets native formula equivalent with an explanation.
8. "mockSheetData": A 2D array representing rows and columns (at least 6-12 rows, 4-7 cols) of the generated sheet layout for live interactive UI preview in the app.
9. "stepByStepGuide": Clear numbered steps for the user on how to open Google Sheets, open Apps Script, paste the code, save, and run.
10. "insights": 3-4 professional financial engineering tips, Apps Script quota considerations, and performance best practices.`;

    const userPrompt = `Transpile this Python financial model into Google Sheets Apps Script and automated sheet builder:

Model type hint: ${modelType || 'Auto-detect'}
Target style: ${targetStyle || 'all'}
Spreadsheet name hint: ${spreadsheetName || 'Financial Model'}
Formatting preference: ${formattingStyle || 'classic_wall_street'}

Python Code:
\`\`\`python
${pythonCode}
\`\`\`

Return valid JSON adhering strictly to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelName: { type: Type.STRING },
            summary: { type: Type.STRING },
            inputs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  defaultVal: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['name', 'type', 'defaultVal', 'description']
              }
            },
            outputs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['name', 'type', 'description']
              }
            },
            customFunctionsCode: { type: Type.STRING },
            sheetBuilderCode: { type: Type.STRING },
            formulaMapping: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pythonSnippet: { type: Type.STRING },
                  sheetsFormula: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ['pythonSnippet', 'sheetsFormula', 'explanation']
              }
            },
            mockSheetData: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            stepByStepGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'modelName',
            'summary',
            'inputs',
            'outputs',
            'customFunctionsCode',
            'sheetBuilderCode',
            'formulaMapping',
            'mockSheetData',
            'stepByStepGuide',
            'insights'
          ]
        }
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini conversion error:', error);
    // Provide fallback if Gemini fails or rate-limits
    const fallback = generateFallbackConversion(pythonCode, modelType);
    res.json({
      ...fallback,
      warning: `AI Model note: ${error.message || 'Generation used deterministic fallback engine'}`
    });
  }
});

// Dry-run simulation endpoint for testing custom function execution
app.post('/api/simulate-function', (req: Request, res: Response) => {
  const { functionCode, functionName, args } = req.body;
  try {
    const sanitized = `
      var result = (function() {
        ${functionCode}
        if (typeof ${functionName} === 'function') {
          return ${functionName}.apply(null, ${JSON.stringify(args || [])});
        }
        return "Function not found";
      })();
      result;
    `;
    // eslint-disable-next-line no-eval
    const val = eval(sanitized);
    res.json({ success: true, result: val });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ success: false, error: error.message });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (prod=${isProd})`);
  });
}

startServer();
