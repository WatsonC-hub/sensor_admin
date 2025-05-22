export type Ressourcer = {
  id: number;
  navn: string;
  kategori: string;
  tstype_id: Array<number>;
  loctype_id: Array<number>;
  forudvalgt: boolean;
};

export type MultiSelectProps = {
  value: Ressourcer[];
  setValue: (value: Ressourcer[]) => void;
};
