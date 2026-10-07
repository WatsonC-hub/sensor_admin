export const button_sx = (isActive: boolean) => ({
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderColor: 'primary.main',
  color: isActive ? 'primary.contrastText' : 'primary.main',
  '&:hover': {
    color: 'white',
    backgroundColor: isActive ? 'primary.dark' : 'primary.light',
  },
});
