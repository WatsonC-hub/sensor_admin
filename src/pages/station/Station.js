import React, { useEffect, useState } from "react";
import BearingGraph from "./BearingGraph";
import ActionArea from "./ActionArea";
import PejlingForm from "../../components/PejlingForm";
import Grid from "@material-ui/core/Grid";
import {
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurements,
} from "../../api";
import { Toolbar } from "@material-ui/core";
import EditStamdata from "./EditStamdata";
import PejlingMeasurements from "./PejlingMeasurements";
import CaptureBearing from "./CaptureBearing";
import { StamdataProvider } from "../Stamdata/StamdataContext";

function formatedTimestamp(d) {
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date} ${time}`;
}

export default function Station({
  stationId,
  setShowForm,
  open,
  formToShow,
  setFormToShow,
}) {
  const [formData, setFormData] = useState({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    disttowatertable_m: 0,
    useforcorrection: 0,
    comment: "",
  });

  const [updated, setUpdated] = useState(new Date());
  const [measurements, setMeasurements] = useState([]);
  const [canEdit] = useState(true);

  useEffect(() => {
    getMeasurements(stationId, sessionStorage.getItem("session_id")).then(
      (res) => {
        setMeasurements(res.data.result);
      }
    );
  }, [stationId]);

  const changeFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

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
  // const showGraph =
  //   stationId !== -1 && (formToShow === null || formToShow === "ADDPEJLING");
  // const showMeasurements = formToShow === null || formToShow === "ADDPEJLING";
  console.log(stationId);

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
      {(formToShow === null || formToShow === "ADDPEJLING") && (
        <BearingGraph stationId={stationId} />
      )}
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
        <StamdataProvider>
          <EditStamdata setFormToShow={setFormToShow} stationId={stationId} />
        </StamdataProvider>
      )}
      {formToShow === "TAG_BILLEDE" && (
        <CaptureBearing setFormToShow={setFormToShow} />
      )}

      {(formToShow === null || formToShow === "ADDPEJLING") && (
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
  );
}
