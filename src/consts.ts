export const mapboxToken: string =
  'pk.eyJ1Ijoib2xlbXVuY2giLCJhIjoiY2xma3ZxMDhmMGV3bDNzbHE1YTZneGFtMSJ9.-IVlITKrk0DjTghXVnlGiQ';

export const boreholeColors: Record<
  number,
  {
    color: string;
    text: string;
  }
> = {
  1: {
    color: '#66bb6a',
    text: 'Nyligt pejlet',
  },
  2: {
    color: '#FFFF00',
    text: 'Skal snart pejles',
  },
  3: {
    color: '#FF6C00',
    text: 'Pejleinterval overskredet',
  },
  0: {
    color: '#3388ff',
    text: 'OK',
  },
};

export const qaNotifications = [12, 13, 75, 76];

// Colors ['#d32f2f', '#ff8c2e', '#ffb13f', '#4caf50', '#9F2B68', '#334FFF']
export const sensorColors: Record<
  number,
  {
    color: string;
    text: string;
  }
> = {
  3: {
    color: '#d32f2f',
    text: 'Kritisk',
  },
  2: {
    color: '#ff832b',
    text: 'Advarsel',
  },
  1: {
    color: '#f1c21b',
    text: 'Info',
  },
  0: {
    color: '#4caf50',
    text: 'OK',
  },
  '-1': {
    color: '#9F2B68',
    text: 'Ukendt',
  },
};

export const correction_map: Record<number, string> = {
  0: 'Kontrol',
  1: 'Korrektion fremadrettet',
  2: 'Korrektion frem og tilbage til start af tidsserie',
  3: 'Lineær',
  4: 'Korrektion frem og tilbage til udstyr',
  5: 'Korrektion frem og tilbage til niveau spring',
  6: 'Korrektion frem og tilbage til forrige spring',
};

export const appBarHeight = '64px';
export const alertHeight = '80px';

export const setGraphHeight = (matches: boolean) => {
  return matches ? '300px' : '500px';
};

export const qaHistorySkeletonHeight = '40px';

export const tabsHeight = '48px';

export const calculateContentHeight = (pixelToSubtract: number) => {
  return `calc(100vh - ${pixelToSubtract}px)`;
};

export const setTableBoxStyle = (pixelToSubtract: number) => {
  const sx = {
    display: 'flex',
    flexDirection: 'column',
    height: calculateContentHeight(pixelToSubtract),
    minHeight: '300px',
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
