import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import {startCase} from 'lodash';
import {parseAsBoolean, useQueryState} from 'nuqs';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {stationPages} from '~/helpers/EnumHelper';
import {useStationPages} from '~/hooks/useStationPages';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

interface ActionAreaProps {
  isCalculated: boolean;
  ts_id: number;
}

export default function ActionArea({isCalculated, ts_id}: ActionAreaProps) {
  const [pageToShow, setPageToShow] = useStationPages();
  const [showForm, setShowForm] = useQueryState('showForm', parseAsBoolean);
  const handleChange = (event: any, newValue: any) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };
  const navigationItems = [];
  if (ts_id !== -1) {
    navigationItems.push(
      {
        text: 'Kontrol',
        value: stationPages.PEJLING,
        icon: <AddCircle />,
        color: navIconStyle(pageToShow === 'pejling'),
      },
      {
        text: startCase(stationPages.TILSYN),
        value: stationPages.TILSYN,
        icon: <PlaylistAddCheck />,
        color: navIconStyle(pageToShow === 'tilsyn'),
        isCalculated: isCalculated,
      }
    );
  } else {
    navigationItems.push({
      text: 'Tidsserie',
      value: stationPages.PEJLING,
      icon: <RuleIcon />,
      color: navIconStyle(pageToShow === 'pejling'),
    });
  }

  navigationItems.push(
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
      isCalculated: isCalculated,
    }
  );

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
    />
  );
}
