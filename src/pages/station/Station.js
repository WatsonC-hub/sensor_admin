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
  insertMp,
  updateMp,
} from "../../api";
import { Toolbar } from "@material-ui/core";
import EditStamdata from "./EditStamdata";
import PejlingMeasurements from "./PejlingMeasurements";
import MaalepunktForm from "../../components/MaalepunktForm";
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
  const [pejlingData, setPejlingData] = useState({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    disttowatertable_m: 0,
    useforcorrection: 0,
    comment: "",
  });

  const [mpData, setMpData] = useState({
    gid: -1,
    startdate: formatedTimestamp(new Date()),
    enddate: formatedTimestamp(new Date("2099-01-01")),
    elevation: 0,
    mp_description: 0,
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

  const changePejlingData = (field, value) => {
    setPejlingData({
      ...pejlingData,
      [field]: value,
    });
  };

  const resetPejlingData = () => {
    setPejlingData({
      gid: -1,
      timeofmeas: formatedTimestamp(new Date()),
      disttowatertable_m: 0,
      useforcorrection: 0,
      comment: "",
    });

    setFormToShow(null);
  };

  const changeMpData = (field, value) => {
    setMpData({
      ...mpData,
      [field]: value,
    });
  };

  const resetMpData = () => {
    setMpData({
      gid: -1,
      startdate: formatedTimestamp(new Date()),
      enddate: formatedTimestamp(new Date("2099-01-01")),
      elevation: 0,
      mp_description: "",
    });

    setFormToShow(null);
  };

  const isPut = () => pejlingData.gid !== -1;
  // const showGraph =
  //   stationId !== -1 && (formToShow === null || formToShow === "ADDPEJLING");
  // const showMeasurements = formToShow === null || formToShow === "ADDPEJLING";
  console.log(stationId);

  const handlePejlingSubmit = (stationId) => {
    setFormToShow(null);
    const method = isPut() ? updateMeasurement : insertMeasurement;
    const userId = sessionStorage.getItem("user");
    const payload = { ...pejlingData, userid: userId };
    var _date = Date.parse(payload.timeofmeas);
    console.log("time before parse: ", payload.timeofmeas);
    console.log("time after parse: ", _date);
    payload.timeofmeas = formatedTimestamp(new Date(_date));
    method(sessionStorage.getItem("session_id"), stationId, payload).then(
      (res) => {
        resetPejlingData();
        setUpdated(new Date());
      }
    );
  };

  const handleMpSubmit = () => {
    setFormToShow(null);
    const method = mpData.gid !== -1 ? updateMp : insertMp;
    const userId = sessionStorage.getItem("user");
    const payload = { ...mpData, userid: userId };
    var _date = Date.parse(payload.startdate);
    console.log("time before parse: ", payload.startdate);
    console.log("time after parse: ", _date);
    payload.startdate = formatedTimestamp(new Date(_date));
    method(sessionStorage.getItem("session_id"), stationId, payload).then(
      (res) => {
        resetMpData();
        setUpdated(new Date());
      }
    );
  };

  const handleEdit = (data) => {
    data.timeofmeas = data.timeofmeas.replace(" ", "T").substr(0, 19);
    setPejlingData(data); // Fill form data on Edit
    setFormToShow("ADDPEJLING"); // update to use state machine
    setUpdated(new Date());
  };

  const handleDelete = (gid) => {
    deleteMeasurement(
      sessionStorage.getItem("session_id"),
      stationId,
      gid
    ).then((res) => {
      resetPejlingData();
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
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          resetFormData={resetPejlingData}
          canEdit={canEdit}
        />
      )}
      {formToShow === "RET_STAMDATA" && (
        <StamdataProvider>
          <EditStamdata setFormToShow={setFormToShow} stationId={stationId} />
        </StamdataProvider>
      )}
      {formToShow === "ADDMAALEPUNKT" && (
        <MaalepunktForm
          stationId={stationId}
          setShowForm={setShowForm}
          formData={mpData}
          changeFormData={changeMpData}
          handleSubmit={handleMpSubmit}
          resetFormData={resetMpData}
          canEdit={canEdit}
        />
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
