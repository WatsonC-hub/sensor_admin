import {Project} from '~/features/stamdata/api/useLocationProject';
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
    nyOpsætning: boolean;
  };
  notificationTypes: number[];
  groups: Group[];
  itineraries: SimpleItinerary[];
  projects: Project[];
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
    nyOpsætning: false,
  },
  notificationTypes: [],
  groups: [],
  itineraries: [],
  projects: [],
});

export {defaultMapFilter};
export type {Filter};
