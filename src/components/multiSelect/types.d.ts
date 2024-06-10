export type Option = {
  title: string;
  value: string;
};

export type MultiSelectProps = {
  options: Option[];
  value: Option[];
  onChange: (event: React.ChangeEvent<object>, value: Option[]) => void;
};
