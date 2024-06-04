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

export const correction_map: Record<number, string> = {
  0: 'Kontrol',
  1: 'Korrektion fremadrettet',
  2: 'Korrektion frem og tilbage til start af tidsserie',
  3: 'Lineær',
  4: 'Korrektion frem og tilbage til udstyr',
  5: 'Korrektion frem og tilbage til niveau spring',
  6: 'Korrektion frem og tilbage til forrige spring',
};
