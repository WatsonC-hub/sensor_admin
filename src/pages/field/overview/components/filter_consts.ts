import {Project} from '~/features/stamdata/api/useLocationProject';
import type {Group, SimpleItinerary} from '~/types';

export const locationFilterOptions = [
  {name: 'fejlfri'},
  {name: 'Tildelt til mig'},
  {name: 'Med notifikationer'},
  {name: 'I drift'},
  {name: 'Inaktive'},
  {name: 'Nyopsætninger'},
  {name: 'Uplanlagte opgaver'},
  {name: 'Uplanlagt feltarbejde'},
];

interface Filter {
  freeText?: string;
  borehole: {
    showHasControlProgram: boolean;
    showNoControlProgram: boolean;
  };
  showService: string;
  notificationTypes: number[];
  locationFilter: string[];
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
  showService: superUser ? 'watsonc' : 'kunde',
  notificationTypes: [],
  locationFilter: locationFilterOptions
    .filter(
      (option) =>
        (superUser && option.name === 'Med notifikationer') || option.name === 'Nyopsætninger'
    )
    .map((option) => option.name),
  groups: [],
  itineraries: [],
  projects: [],
});

export {defaultMapFilter};
export type {Filter};
