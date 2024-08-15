import type {Group} from '~/types';

type Inderterminate = boolean | 'indeterminate';

interface Filter {
  freeText?: string;
  borehole: {
    hasControlProgram: Inderterminate;
  };
  sensor: {
    showInactive: boolean;
    isCustomerService: Inderterminate;
  };
  groups: Group[];
}

const defaultMapFilter: Filter = {
  freeText: '',
  borehole: {
    hasControlProgram: 'indeterminate',
  },
  sensor: {
    showInactive: false,
    isCustomerService: 'indeterminate',
  },
  groups: [],
};

export {defaultMapFilter};
export type {Inderterminate, Filter};
