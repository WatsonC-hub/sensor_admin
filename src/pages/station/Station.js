import React from "react";
import HistoricMeasurements from "./HistoricMeasurements";
import BearingGraph from "./BearingGraph";
import ActionArea from "./ActionArea";
import PejlingForm from "../../components/PejlingForm";
import Grid from "@material-ui/core/Grid";

export default function Station({ stationId, showForm, setShowForm }) {
  return (
    <>
      <BearingGraph stationId={stationId} />
      <Grid item xs={12}></Grid>
      <Grid item xs={12}></Grid>
      {showForm && <PejlingForm setShowForm={setShowForm} />}
      <HistoricMeasurements stationId={stationId} />
      <ActionArea
        stationId={stationId}
        showForm={showForm}
        setShowForm={setShowForm}
      />
    </>
  );
}
