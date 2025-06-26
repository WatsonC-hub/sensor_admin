import type {Group, SimpleItinerary} from '~/types';

interface Filter {
  freeText?: string;
  borehole: {
    showHasControlProgram: boolean;
    showNoControlProgram: boolean;
  };
  sensor: {
    showInactive: boolean;
    showCustomerService: boolean;
    showWatsonCService: boolean;
    isSingleMeasurement: boolean;
    hideLocationsWithoutNotifications: boolean;
  };
  notificationTypes: number[];
  groups: Group[];
  itineraries: SimpleItinerary[];
}

const defaultMapFilter = (superUser: boolean = false): Required<Filter> => ({
  freeText: '',
  borehole: {
    showHasControlProgram: true,
    showNoControlProgram: true,
  },
  sensor: {
    showInactive: false,
    showCustomerService: !superUser,
    showWatsonCService: superUser,
    isSingleMeasurement: false,
    hideLocationsWithoutNotifications: false,
  },
  notificationTypes: [],
  groups: [],
  itineraries: [],
});

export {defaultMapFilter};
export type {Filter};
