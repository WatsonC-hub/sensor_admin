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
