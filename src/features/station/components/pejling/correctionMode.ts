export type CorrectionMode = 'hidden' | 'simple_correction' | 'translation' | 'scale';

const CALCULATED_FLOW_FUNCTIONS = new Set(['calculate_Q', 'calculate_Q_multi']);

export const SCALE_CORRECTION_PICK_ON_GRAPH_VALUE = 7;

export const isCalculatedFlow = ({
  isFlow,
  calculate_function,
}: {
  isFlow?: boolean;
  calculate_function?: string | null;
}): boolean => !!isFlow && CALCULATED_FLOW_FUNCTIONS.has(calculate_function ?? '');

export const getCorrectionMode = ({
  correction_type,
  isFlow,
  calculate_function,
  calculated,
}: {
  correction_type: 'scale' | 'translation' | null | undefined;
  isFlow?: boolean;
  calculate_function?: string | null;
  calculated?: boolean;
}): CorrectionMode => {
  const hasCorrectionType = !!correction_type;

  // No correction_type, but a calculated flow timeseries -> simple correction only.
  if (!hasCorrectionType && calculated && isCalculatedFlow({isFlow, calculate_function})) {
    return 'simple_correction';
  }

  if (!hasCorrectionType) return 'hidden';

  // Has correction_type, but is a calculated non-flow timeseries -> hidden.
  if (calculated && !isFlow) return 'hidden';

  return correction_type;
};
