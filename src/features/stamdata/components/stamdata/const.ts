import dayjs from 'dayjs';

export const initialWatlevmpData = () => ({
  gid: undefined,
  startdate: dayjs().startOf('minute'),
  enddate: dayjs('2099-01-01'),
  elevation: undefined,
  mp_description: '',
});
