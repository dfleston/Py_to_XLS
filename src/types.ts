export interface ModelInput {
  name: string;
  type: string;
  defaultVal: string;
  description: string;
}

export interface ModelOutput {
  name: string;
  type: string;
  description: string;
}

export interface FormulaMapping {
  pythonSnippet: string;
  sheetsFormula: string;
  explanation: string;
}

export interface ConversionResponse {
  modelName: string;
  summary: string;
  inputs: ModelInput[];
  outputs: ModelOutput[];
  customFunctionsCode: string;
  sheetBuilderCode: string;
  formulaMapping: FormulaMapping[];
  mockSheetData: string[][];
  stepByStepGuide: string[];
  insights: string[];
  warning?: string;
}

export type FormattingStyle = 'classic_wall_street' | 'modern_emerald' | 'minimalist';
export type TargetStyle = 'all' | 'custom_function' | 'sheet_builder';
