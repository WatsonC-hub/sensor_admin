import {DataToShow} from './types';

let mapToken: string;

export const isProduction = import.meta.env.PROD;

if (isProduction) {
  mapToken =
    'pk.eyJ1Ijoib2xlbXVuY2giLCJhIjoiY2xma3cxbnFmMGYyNzN5bWpvb2Rjd2VuMyJ9.HSp-vSdF0i1uCSeUoCkwcA';
} else {
  mapToken =
    'pk.eyJ1Ijoib2xlbXVuY2giLCJhIjoiY20zbjE0eWN6MTV5aDJxcXo3aXFpZ2kzYyJ9.UVPpejPboVyzBKCYupxOxw';
}

export const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

export const mapboxToken = mapToken;

export const correction_map: Record<number, string> = {
  0: 'Kontrol',
  1: 'Korrektion fremadrettet',
  2: 'Korrektion frem og tilbage til start af tidsserie',
  3: 'Lineær',
  4: 'Korrektion frem og tilbage til udstyr',
  5: 'Korrektion frem og tilbage til niveau spring',
  6: 'Korrektion frem og tilbage til forrige pejling',
};

export const appBarHeight = '64px';
export const alertHeight = '80px';

export const setGraphHeight = (matches: boolean) => {
  return matches ? '300px' : '500px';
};

export const qaHistorySkeletonHeight = '40px';

const calculateContentHeight = (pixelToSubtract: number) => {
  return `calc(100dvh - ${pixelToSubtract}px)`;
};

export const setTableBoxStyle = (pixelToSubtract: number) => {
  const sx = {
    display: 'flex',
    flexDirection: 'column',
    height: calculateContentHeight(pixelToSubtract),
    minHeight: '500px',
  };
  return sx;
};

export const renderDetailStyle = {
  border: 'none',
  backgroundColor: 'grey.300',
  mt: -7.7,
  pt: 7,
  px: 2,
  mx: -2,
  transition: 'transform 0.2s',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  borderBottomLeftRadius: '15px',
  borderBottomRightRadius: '15px',
};

export const initialContactData = {
  id: '',
  navn: '',
  telefonnummer: null,
  email: '',
  contact_role: undefined,
  comment: '',
  user_id: null,
  contact_type: undefined,
  notify_required: false,
};

export const initialLocationAccessData = {
  id: -1,
  navn: '',
  type: '',
  contact_id: undefined,
  placering: '',
  koden: '',
  kommentar: '',
};

export const httpStatusDescriptions = {
  '200': 'OK - Anmodningen lykkedes',
  '201': 'Oprettet - Ressource blev oprettet',
  '204': 'Ingen indhold - Ingen indhold at sende',
  '400': 'Ugyldig anmodning - Tjek dine data',
  '401': 'Kunne ikke autentificere - Tjek dine loginoplysninger',
  '403': 'Du har ikke rettigheder til denne ressource',
  '404': 'Ressource blev ikke fundet',
  '422': 'Data kunne ikke valideres korrekt',
  '500': 'Intern serverfejl - Noget gik galt på serveren',
  '502': 'Forkert svar fra serveren',
  '503': 'Service utilgængelig - Serveren er midlertidigt nede',
  '504': 'Forbindelsen tog for lang tid',
};

export const defaultDataToShow: DataToShow = {
  Algoritmer: false,
  Kontrolmålinger: true,
  Godkendt: false,
  Nedbør: false,
  'Horisontale linjer': false,
  'Korrigerede spring': false,
  'Valide værdier': false,
  'Fjernet data': false,
  Rådata: false,
  Jupiter: true,
  'Alarm linjer': false,
};
