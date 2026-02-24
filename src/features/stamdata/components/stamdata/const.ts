import dayjs from 'dayjs';

export const initialWatlevmpData = () => ({
  gid: undefined,
  startdate: dayjs().startOf('minute'),
  elevation: undefined,
  mp_description: '',
});
