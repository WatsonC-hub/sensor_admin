import {Project} from '~/features/stamdata/api/useLocationProject';
import type {Group} from '~/types';

export const locationFilterOptions = [
  {name: 'fejlfri'},
  {name: 'Tildelt til mig'},
  {name: 'Notifikationer'},
  {name: 'Enkeltmålestationer'},
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
      (option) => (superUser && option.name === 'Notifikationer') || option.name === 'Nyopsætninger'
    )
    .map((option) => option.name),
  groups: [],
  projects: [],
});

export {defaultMapFilter};
export type {Filter};
