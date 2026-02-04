import {Project} from '~/features/stamdata/api/useLocationProject';
import type {Group} from '~/types';

export const locationFilterOptions = [
  {name: 'Fejlfri'},
  {name: 'Tildelt til mig'},
  {name: 'Notifikationer'},
  {name: 'Enkeltmålestationer'},
  {name: 'Inaktive'},
  {name: 'Nyopsætninger'},
  {name: 'Uplanlagte opgaver'},
  {name: 'Uplanlagt feltarbejde'},
] as const;

interface Filter {
  freeText?: string;
  borehole: {
    showHasControlProgram: boolean;
    showNoControlProgram: boolean;
  };
  showService: string;
  notificationTypes: number[];
  locationFilter: (typeof locationFilterOptions)[number]['name'][];
  groups: Group[];
  projects: Project[];
}

const defaultMapFilter = (superUser?: boolean): Required<Filter> => ({
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
        (superUser === true &&
          (option.name === 'Notifikationer' || option.name === 'Nyopsætninger')) ||
        (superUser === false &&
          (option.name === 'Fejlfri' ||
            option.name === 'Enkeltmålestationer' ||
            option.name === 'Notifikationer' ||
            option.name === 'Nyopsætninger'))
    )
    .map((option) => option.name),
  groups: [],
  projects: [],
});

export {defaultMapFilter};
export type {Filter};
