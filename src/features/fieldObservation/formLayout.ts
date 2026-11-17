import type {TextFieldProps} from '@mui/material';

/**
 * Compact form layout for the feltobservation form, which is mostly filled in on a phone.
 */

/**
 * FormInput without its reserved space below the field: the helper text (an error, say) flows
 * under the field and only takes room when there is one. Spread into a FormInput.
 */
export const compactInput = (slotProps?: TextFieldProps['slotProps']) => ({
  size: 'small' as const,
  margin: 'none' as const,
  sx: {pb: 0},
  slotProps: {...slotProps, formHelperText: {sx: {position: 'static', mt: 0.25}}},
});

/** A wrapping row of inputs; each child sets its share of the row with `flex`. */
export const fieldRowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  columnGap: 1,
  rowGap: 1.5,
} as const;
