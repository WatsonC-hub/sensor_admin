import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
//import { useMinimalSelectStyles } from '@mui-treasury/styles/select/minimal';
import minimalSelectStyles from "./minimalSelect.styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LocationContext from "../../LocationContext";

// Original design here: https://github.com/siriwatknp/mui-treasury/issues/540
const useMinimalSelectStyles = makeStyles(minimalSelectStyles, {
  name: "MinimalSelect",
});

const MinimalSelect = ({
  locid,
  stationList,
  selectedStation,
  setSelectedItem,
  setCurrStation,
  currentStation,
}) => {
  const [stationId, setStationId] = useState(selectedStation + "");
  const [isOpen, setIsOpen] = useState(true);
  const context = useContext(LocationContext);
  const history = useHistory();

  const handleChange = (event) => {
    // setStationId(event.target.value);
    // console.log("stationId : ", event.target.value);
    // console.log("stationList :", stationList);
    // const station = currentStation(event.target.value, stationList);
    // console.log("currentStation =>", station);
    setSelectedItem(event.target.value);
    // setCurrStation(station);
    history.replace(`/location/${locid}/${event.target.value}`);

    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  React.useEffect(() => {
    setStationId(selectedStation);
  }, [selectedStation]);

  const minimalSelectClasses = useMinimalSelectStyles();

  const iconComponent = (props) => {
    return (
      <ExpandMoreIcon
        className={props.className + " " + minimalSelectClasses.icon}
      />
    );
  };

  // moves the menu below the select input
  const menuProps = {
    classes: {
      paper: minimalSelectClasses.paper,
      list: minimalSelectClasses.list,
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  return (
    <FormControl>
      <Select
        disableUnderline
        classes={{ root: minimalSelectClasses.select }}
        MenuProps={menuProps}
        IconComponent={iconComponent}
        value={stationId}
        onChange={handleChange}
        open={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        {/* <MenuItem value={0}>Principle</MenuItem>
        <MenuItem value={1}>Sketch</MenuItem>
        <MenuItem value={2}>Photoshop</MenuItem>
        <MenuItem value={3}>Framer</MenuItem> */}
        {stationList.map((station, index) => (
          <MenuItem key={index} value={station.stationid}>
            {station.stationname}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MinimalSelect;
