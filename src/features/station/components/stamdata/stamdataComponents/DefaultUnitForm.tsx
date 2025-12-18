import {Grid2} from '@mui/material';
import StamdataUnit from '../StamdataUnit';
import useBreakpoints from '~/hooks/useBreakpoints';

const DefaultUnitForm = () => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid2 container spacing={1}>
      <Grid2 size={isMobile ? 12 : 5.5}>
        <StamdataUnit.CalypsoID />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 5.5}>
        <StamdataUnit.SensorID />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 5.5}>
        <StamdataUnit.StartDate />
      </Grid2>
    </Grid2>
  );
};

export default DefaultUnitForm;
