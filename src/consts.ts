import {RangeSelector, RangeSelectorButton, Layout} from 'plotly.js';

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
    minHeight: '500px',
    maxWidth: '1280px',
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
  contact_role: -1,
  comment: '',
  user_id: null,
  contact_type: '-1',
};

export const initialLocationAccessData = {
  id: -1,
  navn: '',
  type: '-1',
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

const selectorOptions: Partial<RangeSelector> = {
  buttons: [
    {
      step: 'day',
      stepmode: 'backward',
      count: 7,
      label: '1 uge',
    },
    {
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1 måned',
    },
    {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1 år',
    },
    {
      step: 'all',
      label: 'Alt',
    },
  ] as Array<Partial<RangeSelectorButton>>,
};

export const desktopLayout: Partial<Layout> = {
  xaxis: {
    domain: [0, 0.97],
    // rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
    showline: true,
  },
  yaxis: {
    title: {
      text: '',
      font: {size: 12},
    },
    showline: true,
  },
  yaxis2: {
    showgrid: false,
    overlaying: 'y',
    side: 'right',
    title: {
      font: {
        size: 12,
      },
    },
  },
  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  margin: {
    // l: 70,
    r: 0,
    // b: 30,
    t: 10,
    pad: 4,
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};

export const mobileLayout: Partial<Layout> = {
  modebar: {
    orientation: 'v',
  },
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date' as Plotly.AxisType,
  },
  yaxis: {
    showline: true,
    title: {
      text: '',
      font: {size: 12},
    },
  },
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  margin: {
    l: 50,
    r: 30,
    b: 40,
    t: 0,
    pad: 4,
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};
