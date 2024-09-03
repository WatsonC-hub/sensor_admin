import {Noop} from 'react-hook-form';

export type Ressourcer = {
  id: number;
  navn: string;
  kategori: string;
  tstype_id: Array<number>;
  loctype_id: Array<number>;
  forudvalgt: boolean;
};

export type Option = {
  title: string;
  value: string;
};

export type MultiSelectProps = {
  value: Ressourcer[];
  setValue: (value: Ressourcer[]) => void;
  onBlur: Noop;
};
