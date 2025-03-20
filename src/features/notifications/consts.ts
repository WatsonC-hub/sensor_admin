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
    color: '#F9DC00',
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
  UNKNOWN = -1,
}

// Colors ['#d32f2f', '#ff8c2e', '#ffb13f', '#4caf50', '#9F2B68', '#334FFF']
export const sensorColors: Record<
  FlagEnum,
  {
    color: string;
    text: string;
  }
> = {
  [FlagEnum.CRITICAL]: {
    color: '#d32f2f',
    text: 'Kritisk',
  },
  [FlagEnum.WARNING]: {
    color: '#FF9115',
    text: 'Advarsel',
  },
  [FlagEnum.INFO]: {
    color: '#F9DC00',
    text: 'Info',
  },
  [FlagEnum.OK]: {
    color: '#088924',
    text: 'OK',
  },
  [FlagEnum.UNKNOWN]: {
    color: '#9F2B68',
    text: 'Ukendt',
  },
};

export enum LocationTypeEnum {
  SINGLE_MEASUREMENT = 12,
  NEW_SETUP = -1,
}

export const sensorLocationTypeColors: Record<
  LocationTypeEnum,
  {
    color: string;
    text: string;
  }
> = {
  [LocationTypeEnum.SINGLE_MEASUREMENT]: {
    color: '#AFFFAD',
    text: 'Enkeltmåling',
  },
  [LocationTypeEnum.NEW_SETUP]: {
    color: '#70C8FF',
    text: 'Ny opsætning',
  },
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
