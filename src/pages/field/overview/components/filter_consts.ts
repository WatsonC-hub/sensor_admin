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
};

export {defaultMapFilter};
export type {Inderterminate, Filter};
