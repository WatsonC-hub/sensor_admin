export const isEmptyObject = (obj: object | undefined): boolean => {
  return obj ? Object.keys(obj).length === 0 && obj.constructor === Object : false;
};
