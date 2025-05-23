import moment from 'moment';

export const initialWatlevmpData = () => ({
  gid: undefined,
  startdate: () => moment().format('YYYY-MM-DDTHH:mm'),
  enddate: () => moment('2099-01-01').format('YYYY-MM-DDTHH:mm'),
  elevation: null,
  mp_description: '',
});
