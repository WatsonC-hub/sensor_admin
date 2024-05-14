import {AddCircle, EditRounded, Straighten, PlaylistAddCheck, StraightenRounded, PhotoLibraryRounded, AddAPhotoRounded, ConstructionRounded} from '@mui/icons-material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import React, {useState} from 'react';
import CustomBottomNavigation from '../../../components/BottomNavigation'

const bottomNavStyle = {
  borderRadius: 5,
  margin: '7px',
  boxShadow: '3px 3px 3px grey',
  backgroundColor: 'secondary.main',
  width: '100px',
  height: '58px',
};

const borderGrey = {
  ...bottomNavStyle,
  backgroundColor: '#9E9E9E',
};

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit'
}

function BottomNav({setFormToShow, canEdit}) {
  return (
    <BottomNavigation
      sx={{
        backgroundColor: 'primary.main',
        width: 'auto',
        height: 'auto',
        boxShadow: '0 3px 5px 2px rgba(115,115,115,255)',
        position: 'sticky',
        bottom: '0',
        zIndex: 1,
      }}
      value={-1}
      showLabels
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        // disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow('ADDPEJLING');
        }}
      />
      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Målepunkter"
        onClick={() => {
          setFormToShow('ADDMAALEPUNKT');
        }}
        icon={<Straighten />}
      />
      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Billeder"
        showLabel={true}
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow('CAMERA');
        }}
      />
      {canEdit && (
        <BottomNavigationAction
          sx={borderGrey}
          // disabled={!canEdit}
          label="Stamdata"
          showLabel={true}
          icon={<EditRounded />}
          onClick={() => {
            setFormToShow('STAMDATA');
          }}
        />
      )}
    </BottomNavigation>
  );
}

export default function ActionArea({setShowData, formToShow, setFormToShow, canEdit, fileInputRef}) {

  const [value, setValue] = useState('ADDPEJLING')

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setShowData(newValue);
    if(formToShow !== null){
      setFormToShow('')
    }
  }

  const pejlingItem = { fabText: 'Tilføj pejling', fabIcon: <AddCircle /> }
  const målepunktItem = { fabText: 'Tilføj målepunkt', fabIcon: <StraightenRounded /> }
  const billedeItem = { fabText: 'Tilføj billede', fabIcon: <AddAPhotoRounded /> }
  // const stamdataItem = { fabText: 'Rediger stamdata', fabIcon: <ConstructionRounded /> }

  const navigationItems = [
    { text: 'Pejling', value:'ADDPEJLING',  icon: <AddCircle />, color: navIconStyle(value === 'ADDPEJLING'), fabItem: pejlingItem, },
    { text: 'Målepunkter', value:'ADDMAALEPUNKT',  icon: <StraightenRounded />, color: navIconStyle(value === 'ADDMAALEPUNKT'), fabItem: målepunktItem, },
    { text: 'Billeder', value:'CAMERA',  icon: <PhotoLibraryRounded />, color: navIconStyle(value === 'CAMERA'), fabItem: billedeItem, },
    { text: 'Stamdata', value:'STAMDATA',  icon: <ConstructionRounded />, color: navIconStyle(value === 'STAMDATA'), }
  ];

  return <CustomBottomNavigation showData={value} setFormToShow={setFormToShow} setShowData={setShowData} onChange={handleChange} items={navigationItems} canEdit={canEdit} fileInputRef={fileInputRef} />

  // return <BottomNav formToShow={formToShow} setFormToShow={setFormToShow} canEdit={canEdit} />;
}
