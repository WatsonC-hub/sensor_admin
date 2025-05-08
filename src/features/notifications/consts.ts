export enum BoreHoleFlagEnum {
  OK = 1,
  SOON = 2,
  EXCEEDED = 3,
  UNKNOWN = 0,
}

export const boreholeColors: Record<
  BoreHoleFlagEnum,
  {
    color: string;
    text: string;
  }
> = {
  [BoreHoleFlagEnum.OK]: {
    color: '#088924',
    text: 'OK',
  },
  [BoreHoleFlagEnum.SOON]: {
    color: '#f7da00',
    text: 'Skal snart pejles',
  },
  [BoreHoleFlagEnum.EXCEEDED]: {
    color: '#FF9115',
    text: 'Pejleinterval overskredet',
  },
  [BoreHoleFlagEnum.UNKNOWN]: {
    color: '#088924',
    text: 'OK',
  },
};

export enum FlagEnum {
  CRITICAL = 3,
  WARNING = 2,
  INFO = 1,
  OK = 0,
}

export enum NotificationEnum {
  INACTIVE = 'inactive',
  NO_UNIT = 'no_unit',
  SINGLE_MEASUREMENT = 'single_measurement',
}

// Colors ['#d32f2f', '#ff8c2e', '#ffb13f', '#4caf50', '#9F2B68', '#334FFF']
export const sensorColors: Record<
  FlagEnum | NotificationEnum,
  {
    color: string;
    text: string;
    sortOrder: number;
  }
> = {
  [FlagEnum.CRITICAL]: {
    color: '#d32f2f',
    text: 'Kritisk',
    sortOrder: 0,
  },
  [FlagEnum.WARNING]: {
    color: '#FF9115',
    text: 'Advarsel',
    sortOrder: 1,
  },
  [FlagEnum.INFO]: {
    color: '#f7da00',
    text: 'Info',
    sortOrder: 2,
  },
  [FlagEnum.OK]: {
    color: '#088924',
    text: 'OK',
    sortOrder: 4,
  },
  [NotificationEnum.INACTIVE]: {
    color: '#C0C0C0',
    text: 'Inaktiv',
    sortOrder: 5,
  },
  [NotificationEnum.NO_UNIT]: {
    color: '#70C8FF',
    text: 'Ny opsætning',
    sortOrder: 3,
  },
  [NotificationEnum.SINGLE_MEASUREMENT]: {
    color: '#AFFFAD',
    text: 'Enkeltmåling',
    sortOrder: 99,
  },
};

export const getMaxColor = (colors: string[]) => {
  const colorOrder: Record<string, number> = {};

  Object.values(sensorColors).forEach((color) => {
    colorOrder[color.color] = color.sortOrder;
  });

  const sortedColors = colors.sort((a, b) => {
    return (colorOrder[a] || 0) - (colorOrder[b] || 0);
  });

  return sortedColors[0] || sensorColors[FlagEnum.OK].color;
};

/*1	Batteriskift
2	Data mangler på graf
3	Lavt iltindhold
4	>5 null værdier seneste 12 timer
12	Plateau
42	Sender ikke
108	Fejl i tidsstempler
141	Delta funktion overskredet
174	Delta funktion overskredet
207	Kontrolmåling */

export enum NotificationIDEnum {
  UNKNOWN = 0,
  BATTERY_CHANGE = 1,
  MISSING_DATA = 2,
  LOW_OXYGEN = 3,
  NULL_VALUES = 4,
  ABNORMAL_EVENT = 9,
  PLATEAU = 12,
  NOT_SENDING = 42,
  TIMESTAMP_ERROR = 108,
  DELTA_FUNCTION_EXCEEDED = 141,
  DELTA_FUNCTION_EXCEEDED_2 = 174,
  CONTROL_MEASUREMENT = 207,
}
