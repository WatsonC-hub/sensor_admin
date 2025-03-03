import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {startCase} from 'lodash';
import React from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import usePermissions from '~/features/permissions/api/usePermissions';
import {stationPages} from '~/helpers/EnumHelper';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

export default function ActionArea() {
  const {boreholeno} = useAppContext(['boreholeno']);
  const [pageToShow, setPageToShow] = useStationPages();
  const [showForm, setShowForm] = useShowFormState();
  const handleChange = (event: React.ChangeEvent<object>, newValue: any) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };

  const {
    borehole_permission_query: {data: permissions},
  } = usePermissions();

  const navigationItems = [
    {
      text: 'Pejling',
      value: stationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === 'pejling'),
    },
    {
      text: 'Målepunkt',
      value: stationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(pageToShow === 'maalepunkt'),
    },
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === 'billeder'),
    },
    {
      text: startCase(stationPages.STAMDATA),
      value: stationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'stamdata'),
      display: permissions?.borehole_plantids?.boreholenos?.includes(boreholeno),
    },
  ];

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
    />
  );
}
