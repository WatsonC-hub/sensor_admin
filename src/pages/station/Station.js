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
  getMP,
  deleteMP,
  getStamdataByStation,
} from "../../api";
import { Toolbar } from "@material-ui/core";
import EditStamdata from "./EditStamdata";
import PejlingMeasurements from "./PejlingMeasurements";
import MaalepunktForm from "../../components/MaalepunktForm";
import CaptureBearing from "./CaptureBearing";
import { StamdataContext } from "../Stamdata/StamdataContext";
import MaalepunktTable from "./MaalepunktTable";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

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

  const [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    saveUdstyrFormData,
    saveLocationFormData,
    saveStationFormData,
  ] = React.useContext(StamdataContext);

  const [mpData, setMpData] = useState({
    gid: -1,
    startdate: formatedTimestamp(new Date()),
    enddate: formatedTimestamp(new Date("2099-01-01")),
    elevation: 0,
    mp_description: "",
  });

  const [updated, setUpdated] = useState(new Date());
  const [measurements, setMeasurements] = useState([]);
  const [watlevmp, setWatlevmp] = useState([]);
  const [control, setcontrol] = useState([]);
  const [canEdit] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    console.log(stationId);
    if (stationId !== -1 && stationId !== null) {
      getStamdataByStation(stationId).then((res) => {
        //let st = res.data.data.find((s) => s.ts_id === props.stationId);
        console.log(res);
        if (res.data.success) {
          saveLocationFormData(res.data.data);
          saveUdstyrFormData(res.data.data);
          saveStationFormData(res.data.data);
        }
      });
    }
  }, [stationId]);

  useEffect(() => {
    if (stationId !== -1 && stationId !== null) {
      const mp = getMP(stationId, sessionStorage.getItem("session_id"));
      const meas = getMeasurements(
        stationId,
        sessionStorage.getItem("session_id")
      );
      Promise.all([mp, meas]).then((responses) => {
        const measures = responses[1].data.result;
        const mps = responses[0].data.result;
        setMeasurements(measures);
        setWatlevmp(mps);
        setcontrol(
          measures.map((e) => {
            const elev = mps.filter((e2) => {
              return e.timeofmeas >= e2.startdate && e.timeofmeas < e2.enddate;
            })[0].elevation;

            return {
              ...e,
              waterlevel: e.disttowatertable_m
                ? elev - e.disttowatertable_m
                : null,
            };
          })
        );
      });
    }
  }, [updated, stationId]);

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

    setFormToShow("ADDMAALEPUNKT");
  };

  // console.log(stationId);

  const handlePejlingSubmit = (stationId) => {
    setFormToShow(null);
    const method =
      pejlingData.gid !== -1 ? updateMeasurement : insertMeasurement;
    const userId = sessionStorage.getItem("user");
    const payload = { ...pejlingData, userid: userId };
    var _date = Date.parse(payload.timeofmeas);
    console.log("time before parse: ", payload.timeofmeas);
    console.log("time after parse: ", _date);
    payload.timeofmeas = formatedTimestamp(new Date(_date));
    method(sessionStorage.getItem("session_id"), stationId, payload)
      .then((res) => {
        resetPejlingData();
        setUpdated(new Date());
        setSeverity("success");
        setTimeout(() => {
          handleClickOpen();
        }, 500);
      })
      .catch((error) => {
        setSeverity("error");
        setOpenAlert(true);
      });
  };

  const handleMpSubmit = () => {
    setFormToShow("ADDMAALEPUNKT");
    const method = mpData.gid !== -1 ? updateMp : insertMp;
    const userId = sessionStorage.getItem("user");
    const payload = { ...mpData, userid: userId };
    var _date = Date.parse(payload.startdate);
    console.log("time before parse: ", payload.startdate);
    console.log("time after parse: ", _date);
    payload.startdate = formatedTimestamp(new Date(_date));
    method(sessionStorage.getItem("session_id"), stationId, payload)
      .then((res) => {
        resetMpData();
        setUpdated(new Date());
        setSeverity("success");
        setTimeout(() => {
          handleClickOpen();
        }, 500);
      })
      .catch((error) => {
        setSeverity("error");
        setOpenAlert(true);
      });
  };

  const handleEdit = (type) => {
    if (type === "watlevmp") {
      return (data) => {
        data.startdate = data.startdate.replace(" ", "T").substr(0, 19);
        data.enddate = data.enddate.replace(" ", "T").substr(0, 19);
        setMpData(data); // Fill form data on Edit
        setFormToShow("ADDMAALEPUNKT"); // update to use state machine
        // setUpdated(new Date());
      };
    } else {
      return (data) => {
        console.log(data);
        console.log(watlevmp);
        data.timeofmeas = data.timeofmeas.replace(" ", "T").substr(0, 19);
        setPejlingData(data); // Fill form data on Edit
        setFormToShow("ADDPEJLING"); // update to use state machine
        // setUpdated(new Date());
      };
    }
  };

  const handleDelete = (type) => {
    if (type === "watlevmp") {
      return (gid) => {
        deleteMP(sessionStorage.getItem("session_id"), stationId, gid).then(
          (res) => {
            resetMpData();
            setUpdated(new Date());
          }
        );
      };
    } else {
      return (gid) => {
        deleteMeasurement(
          sessionStorage.getItem("session_id"),
          stationId,
          gid
        ).then((res) => {
          resetPejlingData();
          setUpdated(new Date());
        });
      };
    }
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleCloseSnack = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  const handleClickOpen = () => {
    setOpenAlert(true);
  };

  return (
    // <>
    <div>
      {(formToShow === null || formToShow === "ADDPEJLING") && (
        <BearingGraph
          stationId={stationId}
          updated={updated}
          measurements={control}
        />
      )}
      {formToShow === "ADDPEJLING" && (
        <PejlingForm
          stationId={stationId}
          setShowForm={setShowForm}
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          resetFormData={resetPejlingData}
          canEdit={canEdit}
          mpData={watlevmp}
        />
      )}
      {formToShow === "RET_STAMDATA" && (
        <EditStamdata setFormToShow={setFormToShow} stationId={stationId} />
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
        ></MaalepunktForm>
      )}
      {formToShow === "ADDMAALEPUNKT" && (
        <MaalepunktTable
          watlevmp={watlevmp}
          handleEdit={handleEdit("watlevmp")}
          handleDelete={handleDelete("watlevmp")}
          canEdit={canEdit}
        ></MaalepunktTable>
      )}
      {(formToShow === null || formToShow === "ADDPEJLING") && (
        <PejlingMeasurements
          measurements={measurements}
          handleEdit={handleEdit("pejling")}
          handleDelete={handleDelete("pejling")}
          canEdit={canEdit}
        />
      )}
      <ActionArea
        open={open}
        stationId={stationId}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
      />
      <Snackbar
        open={openAlert}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity={severity}>
          {severity === "success"
            ? "Indberetningen lykkedes"
            : "Indberetningen fejlede"}
        </Alert>
      </Snackbar>
    </div>
  );
}
