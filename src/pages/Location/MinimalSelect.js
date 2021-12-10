import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import minimalSelectStyles from "./minimalSelect.styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.statid ? false : true);
  const history = useHistory();

  const handleChange = (event) => {
    setSelectedItem(event.target.value);
    history.replace(`/location/${locid}/${event.target.value}`);
    setCurrStation(
      stationList.find((s) => s.ts_id + "" === event.target.value + "")
    );
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  React.useEffect(() => {
    setStationId(selectedStation);
  }, [selectedStation]);

  // useEffect(() => {
  //   currentStation === -1 ? setIsOpen(true) : setIsOpen(false);
  // }, [currentStation]);

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
        {stationList
          .filter((t) => t.ts_name !== null)
          .map((station) => (
            <MenuItem key={station.ts_id} value={station.ts_id}>
              {station.ts_name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default MinimalSelect;
