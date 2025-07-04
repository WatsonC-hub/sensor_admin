import dayjs from 'dayjs';

export const initialWatlevmpData = () => ({
  gid: undefined,
  startdate: dayjs(),
  enddate: dayjs('2099-01-01'),
  elevation: null,
  mp_description: '',
});
