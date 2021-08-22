import React, { useEffect, useState, useRef } from "react";
import HistoricMeasurements from "./HistoricMeasurements";
import MobileMeasurements from "./MobileMeasurements";
import BearingGraph from "./BearingGraph";
import ActionArea from "./ActionArea";
import PejlingForm from "../../components/PejlingForm";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurements,
} from "../../api";
import { Toolbar } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import EditStamdata from "./EditStamdata";
import PejlingMeasurements from "./PejlingMeasurements";
import CaptureBearing from "./CaptureBearing";
import { format } from "date-fns";

function formatedTimestamp(d) {
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date} ${time}`;
}

export default function Station({
  stationId,
  showForm,
  setShowForm,
  open,
  formToShow,
  setFormToShow,
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    disttowatertable_m: 0,
    useforcorrection: 0,
    comment: "",
  });

  const [updated, setUpdated] = useState(new Date());
  const [measurements, setMeasurements] = useState([]);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    getMeasurements(stationId, sessionStorage.getItem("session_id")).then(
      (res) => {
        setMeasurements(res.data.result);
        //setCanEdit(res.data.can_edit);
      }
    );
  }, [updated, stationId]);

  const changeFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // const formatedTimestamp = (d) => {
  //   //let _date = moment(d, "yyyy-MM-dd");
  //   if (!isValid(d)) {
  //     //console.log("date not valid: ", d);
  //     return;
  //   }
  //   //console.log("date is valid");
  //   const date = d.toISOString().split("T")[0];
  //   const time = d.toTimeString().split(" ")[0];
  //   return `${date} ${time}`;
  // };

  const resetFormData = () => {
    setFormData({
      gid: -1,
      timeofmeas: formatedTimestamp(new Date()),
      disttowatertable_m: 0,
      useforcorrection: 0,
      comment: "",
    });

    setFormToShow(null);
  };

  const isPut = () => formData.gid !== -1;
  const showGraph =
    stationId !== -1 && (formToShow === null || formToShow === "ADDPEJLING");
  const showMeasurements = formToShow === null || formToShow === "ADDPEJLING";

  const handleSubmit = (stationId) => {
    setFormToShow(null);
    const method = isPut() ? updateMeasurement : insertMeasurement;
    const userId = sessionStorage.getItem("user");
    const payload = { ...formData, userid: userId };
    var _date = Date.parse(payload.timeofmeas);
    console.log("time before parse: ", payload.timeofmeas);
    console.log("time after parse: ", _date);
    payload.timeofmeas = formatedTimestamp(new Date(_date));
    method(sessionStorage.getItem("session_id"), stationId, payload).then(
      (res) => {
        resetFormData();
        setUpdated(new Date());
      }
    );
  };

  const handleEdit = (data) => {
    data.timeofmeas = data.timeofmeas.replace(" ", "T").substr(0, 19);
    setFormData(data); // Fill form data on Edit
    setFormToShow("ADDPEJLING"); // update to use state machine
    setUpdated(new Date());
    //window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = (gid) => {
    deleteMeasurement(
      sessionStorage.getItem("session_id"),
      stationId,
      gid
    ).then((res) => {
      resetFormData();
      setUpdated(new Date());
    });
  };

  return (
    // <>
    <div>
      {showGraph && <BearingGraph stationId={stationId} />}
      <Grid item xs={12}></Grid>
      <Grid item xs={12}></Grid>
      {formToShow === "ADDPEJLING" && (
        <PejlingForm
          stationId={stationId}
          setShowForm={setShowForm}
          formData={formData}
          changeFormData={changeFormData}
          handleSubmit={handleSubmit}
          resetFormData={resetFormData}
          canEdit={canEdit}
        />
      )}
      {formToShow === "RET_STAMDATA" && (
        <EditStamdata setFormToShow={setFormToShow} />
      )}
      {formToShow === "TAG_BILLEDE" && (
        <CaptureBearing setFormToShow={setFormToShow} />
      )}
      {showMeasurements && (
        <PejlingMeasurements
          measurements={measurements}
          updated={updated}
          stationId={stationId}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          canEdit={canEdit}
        />
      )}
      <Toolbar />
      <ActionArea
        open={open}
        stationId={stationId}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
      />
    </div>
    // </>
  );
}
