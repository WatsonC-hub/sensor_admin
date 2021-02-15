import React, { useEffect, useState } from "react";
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

function formatedTimestamp(d) {
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date} ${time}`;
}

export default function Station({ stationId, showForm, setShowForm, open }) {
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

  useEffect(() => {
    getMeasurements(stationId).then((res) => {
      setMeasurements(res.data.features);
    });
  }, [updated, stationId]);

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

    setShowForm(false);
  };

  const isPut = () => formData.gid !== -1;

  const handleSubmit = (stationId) => {
    setShowForm(false);
    const method = isPut() ? updateMeasurement : insertMeasurement;
    method(stationId, formData).then((res) => {
      resetFormData();
      setUpdated(new Date());
    });
  };

  const handleEdit = (data) => {
    setFormData(data); // Fill form data on Edit
    setShowForm(true); // update to use state machine
    setUpdated(new Date());
  };

  const handleDelete = (gid) => {
    deleteMeasurement(gid).then((res) => {
      resetFormData();
      setUpdated(new Date());
    });
  };

  return (
    <>
      <div>
        {stationId !== -1 && <BearingGraph stationId={stationId} />}
        <Grid item xs={12}></Grid>
        <Grid item xs={12}></Grid>
        {showForm && (
          <PejlingForm
            stationId={stationId}
            setShowForm={setShowForm}
            formData={formData}
            changeFormData={changeFormData}
            handleSubmit={handleSubmit}
            resetFormData={resetFormData}
          />
        )}
        {matches ? (
          <MobileMeasurements
            measurements={measurements}
            updated={updated}
            stationId={stationId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ) : (
          <HistoricMeasurements
            measurements={measurements}
            updated={updated}
            stationId={stationId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
        {/* <HistoricMeasurements
          measurements={measurements}
          updated={updated}
          stationId={stationId}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        /> */}
        <Toolbar />
        <ActionArea
          open={open}
          stationId={stationId}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      </div>
    </>
  );
}
