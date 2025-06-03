import type {Group, SimpleItinerary} from '~/types';

type Inderterminate = boolean | 'indeterminate';

interface Filter {
  freeText?: string;
  borehole: {
    hasControlProgram: Inderterminate;
  };
  sensor: {
    showInactive: boolean;
    isCustomerService: Inderterminate;
    isSingleMeasurement: boolean;
    hideLocationsWithoutNotifications: boolean;
  };
  groups: Group[];
  itineraries: SimpleItinerary[];
}

const defaultMapFilter: Required<Filter> = {
  freeText: '',
  borehole: {
    hasControlProgram: 'indeterminate',
  },
  sensor: {
    showInactive: false,
    isCustomerService: 'indeterminate',
    isSingleMeasurement: false,
    hideLocationsWithoutNotifications: false,
  },
  groups: [],
  itineraries: [],
};

export {defaultMapFilter};
export type {Filter};
