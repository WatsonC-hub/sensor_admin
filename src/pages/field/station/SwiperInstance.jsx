import {AppBar, Tab, Tabs} from '@mui/material';
import {useEffect, useState} from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

import 'swiper/css';
import {Swiper} from 'swiper/react';
function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}
const SwiperInstance = ({children}) => {
  const {isTouch} = useBreakpoints();
  const [value, setValue] = useState(0);
  const [swiper, setSwiper] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (swiper && event) {
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;
      swiper.slideTo(newValue);
    }
  };

  useEffect(() => {
    if (swiper) {
      // swiper.slideTo(0, 0, false);
      swiper.activeIndex = 0;
    }
  }, [swiper]);

  if (swiper) {
    swiper.allowSlidePrev = isTouch;
    swiper.allowSlideNext = isTouch;
  }
  return (
    <>
      <AppBar position="static" color="default" style={{marginBottom: '1%'}}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Udstyr" {...a11yProps(0)} />
          <Tab label="Lokalitet" {...a11yProps(1)} />
          <Tab label="Station" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <Swiper
        initialSlide={2}
        onSwiper={(swiper) => {
          setSwiper((prev) => {
            setValue(0);
            swiper.slideTo(0, 0, false);
            return swiper;
          });
        }}
        onSlideChange={(swiper) => handleChange(null, swiper.activeIndex)}
      >
        {children}
      </Swiper>
    </>
  );
};

export default SwiperInstance;
