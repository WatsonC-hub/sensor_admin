import React from "react";
import { AddCircle, Straighten } from "@mui/icons-material";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

const bottomNavStyle = {
  borderRadius: 5,
  margin: "7px",
  boxShadow: "3px 3px 3px grey",
  backgroundColor: "secondary.main",
};

const borderGrey = {
  ...bottomNavStyle,
  backgroundColor: "#9E9E9E",
};

function BottomNav({ setFormToShow, canEdit }) {
  return (
    <BottomNavigation
      sx={{
        backgroundColor: "primary.main",
        width: "auto",
        height: "auto",
        margin: "5px",
        boxShadow: "0 3px 5px 2px rgba(115,115,115,255)",
        position: "sticky",
        bottom: "0",
        zIndex: 1,
      }}
      value={-1}
      showLabels
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow("ADDPEJLING");
        }}
      />
      <BottomNavigationAction
        sx={borderGrey}
        disabled={!canEdit}
        label="Indberet målepunkt"
        onClick={() => {
          setFormToShow("ADDMAALEPUNKT");
        }}
        icon={<Straighten />}
      />
      <BottomNavigationAction
        sx={borderGrey}
        disabled={!canEdit}
        label="Billeder"
        showLabel={true}
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow("CAMERA");
        }}
      />
    </BottomNavigation>
  );
}

export default function ActionArea({ formToShow, setFormToShow, canEdit }) {
  return (
    <BottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
    />
  );
}
