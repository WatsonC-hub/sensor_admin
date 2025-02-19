import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import {startCase} from 'lodash';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {navIconStyle} from '~/consts';
import {stationPages} from '~/helpers/EnumHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useStationList from '~/hooks/query/useStationList';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

export default function ActionArea() {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: ts_list} = useStationList(loc_id);
  const {data: metadata} = useTimeseriesData(ts_id);
  const isCalculated = metadata?.calculated ?? false;
  const [pageToShow, setPageToShow] = useStationPages();
  const [showForm, setShowForm] = useShowFormState();
  const handleChange = (event: any, newValue: any) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };
  const navigationItems = [];
  if (ts_list && ts_list.length > 0) {
    navigationItems.push(
      {
        text: 'Kontrol',
        value: stationPages.PEJLING,
        icon: <AddCircle />,
        color: navIconStyle(pageToShow === stationPages.PEJLING),
      },
      {
        text: startCase(stationPages.TILSYN),
        value: stationPages.TILSYN,
        icon: <PlaylistAddCheck />,
        color: navIconStyle(pageToShow === stationPages.TILSYN),
        isCalculated: isCalculated,
      }
    );
  } else {
    navigationItems.push({
      text: 'Tidsserie',
      value: stationPages.PEJLING,
      icon: <RuleIcon />,
      color: navIconStyle(pageToShow === stationPages.PEJLING),
    });
  }

  navigationItems.push(
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === stationPages.BILLEDER),
    }
    // {
    //   text: startCase(stationPages.STAMDATA),
    //   value: stationPages.STAMDATA,
    //   icon: <ConstructionRounded />,
    //   color: navIconStyle(pageToShow === stationPages.STAMDATA),
    //   isCalculated: isCalculated,
    // }
  );

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
    />
  );
}
