export const setRoleName = (roleId: number) => {
  switch (roleId) {
    case 1:
      return 'Dataejer';
    case 2:
      return 'Adgangskontakt';
    case 34:
      return 'Installationsansvarlig';
    case 67:
      return 'Alarmkontakt';
    default:
      return '';
  }
};
