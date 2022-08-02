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
  getService,
  updateService,
  insertService,
  deleteService,
  postImage,
} from "../../api";
import { Toolbar } from "@material-ui/core";
import EditStamdata from "./EditStamdata";
import PejlingMeasurements from "./PejlingMeasurements";
import MaalepunktForm from "../../components/MaalepunktForm";
import CaptureBearing from "./CaptureBearing";
import { StamdataContext } from "../Stamdata/StamdataContext";
import moment from "moment";
import MaalepunktTable from "./MaalepunktTable";
import TilsynForm from "../../components/TilsynForm";
import TilsynTable from "../../components/TilsynTable";
import StationImages from "./StationImages";
import { useLocation } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

export default function Station({
  stationId,
  setShowForm,
  open,
  formToShow,
  setFormToShow,
}) {
  const [pejlingData, setPejlingData] = useState({
    gid: -1,
    timeofmeas: new Date(),
    measurement: 0,
    useforcorrection: 0,
    comment: "",
  });

  let location = useLocation();

  const [
    ,
    ,
    formData,
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
    startdate: new Date(),
    enddate: new Date("2099-01-01"),
    elevation: 0,
    mp_description: "",
  });

  const [serviceData, setServiceData] = useState({
    gid: -1,
    dato: new Date(),
    batteriskift: false,
    tilsyn: false,
    kommentar: "",
  });

  //const [first, setfirst] = useState(second);

  const [updated, setUpdated] = useState(new Date());
  const [measurements, setMeasurements] = useState([]);
  const [watlevmp, setWatlevmp] = useState([]);
  const [services, setServices] = useState([]);
  const [dynamic, setDynamic] = useState([]);
  const [control, setcontrol] = useState([]);
  const [canEdit] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [isWaterlevel, setIsWaterlevel] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isFlow, setIsFlow] = useState(false);

  useEffect(() => {
    if (watlevmp.length > 0) {
      const elev = watlevmp.filter((e2) => {
        return (
          moment(pejlingData.timeofmeas) >= moment(e2.startdate) &&
          moment(pejlingData.timeofmeas) < moment(e2.enddate)
        );
      })[0].elevation;

      let dynamicDate = pejlingData.timeofmeas;
      let dynamicMeas = elev - pejlingData.measurement;
      setDynamic([dynamicDate, dynamicMeas]);
    }
  }, [pejlingData, watlevmp]);

  useEffect(() => {
    console.log(stationId);
    if (stationId !== -1 && stationId !== null) {
      getStamdataByStation(stationId).then((res) => {
        //let st = res.data.data.find((s) => s.ts_id === props.stationId);
        console.log(res);
        setIsWaterlevel(res.data.data.tstype_id === 1);
        setIsFlow(res.data.data.tstype_id === 2);
        setIsCalculated(res.data.data.calculated);
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
      const serv = getService(stationId);
      console.log(formData);
      Promise.all([mp, meas, serv]).then((responses) => {
        const measures = responses[1].data.result;
        const mps = responses[0].data.result;
        const services = responses[2].data.result;
        setMeasurements(measures);
        setWatlevmp(mps);
        setServices(services);

        if (mps.length > 0) {
          setcontrol(
            measures.map((e) => {
              const elev = mps.filter((e2) => {
                return (
                  e.timeofmeas >= e2.startdate && e.timeofmeas < e2.enddate
                );
              })[0].elevation;

              return {
                ...e,
                waterlevel: e.measurement ? elev - e.measurement : null,
              };
            })
          );
        } else {
          setcontrol(
            measures.map((elem) => {
              return { ...elem, waterlevel: elem.measurement };
            })
          );
        }
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
      timeofmeas: moment().format("YYYY-MM-DD HH:mm:ss"),
      measurement: 0,
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
      startdate: moment().format("YYYY-MM-DD HH:mm:ss"),
      enddate: moment("2099-01-01").format("YYYY-MM-DD HH:mm:ss"),
      elevation: 0,
      mp_description: "",
    });

    setFormToShow("ADDMAALEPUNKT");
  };

  const changeServiceData = (field, value) => {
    setServiceData({
      ...serviceData,
      [field]: value,
    });
    console.log(serviceData);
  };

  const resetServiceData = () => {
    setServiceData({
      gid: -1,
      dato: moment().format("YYYY-MM-DD HH:mm:ss"),
      batteriskift: false,
      tilsyn: false,
      kommentar: "",
    });
  };

  const handleMpCancel = () => {
    resetMpData();
    setFormToShow(null);
  };

  const handlePejlingSubmit = () => {
    setFormToShow(null);
    const method =
      pejlingData.gid !== -1 ? updateMeasurement : insertMeasurement;
    const userId = sessionStorage.getItem("user");
    const payload = {
      ...pejlingData,
      userid: userId,
      isWaterlevel: isWaterlevel,
    };
    var _date = Date.parse(payload.timeofmeas);
    console.log("time before parse: ", payload.timeofmeas);
    console.log("time after parse: ", _date);
    payload.timeofmeas = moment(payload.timeofmeas).format(
      "YYYY-MM-DD HH:mm:ss"
    );
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
    payload.startdate = moment(payload.startdate).format("YYYY-MM-DD HH:mm:ss");
    payload.enddate = moment(payload.enddate).format("YYYY-MM-DD HH:mm:ss");
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

  const handleServiceSubmit = () => {
    // setFormToShow("ADDTILSYN");
    const method = serviceData.gid !== -1 ? updateService : insertService;
    const userId = sessionStorage.getItem("user");
    const payload = {
      ...serviceData,
      batteriskift: serviceData.batteriskift.toString(),
      tilsyn: serviceData.tilsyn.toString(),
      userid: userId,
    };
    var _date = Date.parse(payload.dato);
    console.log("time before parse: ", payload.dato);
    console.log("time after parse: ", _date);
    payload.dato = moment(payload.dato).format("YYYY-MM-DD HH:mm:ss");
    method(sessionStorage.getItem("session_id"), stationId, payload).then(
      (res) => {
        resetServiceData();
        setUpdated(new Date());
      }
    );
  };

  const handleEdit = (type) => {
    if (type === "watlevmp") {
      return (data) => {
        // data.startdate = formatedTimestamp(new Date(data.startdate));
        // data.enddate = formatedTimestamp(new Date(data.enddate));
        setMpData(data); // Fill form data on Edit
        setFormToShow("ADDMAALEPUNKT"); // update to use state machine
        // setUpdated(new Date());
      };
    } else if (type === "service") {
      return (data) => {
        data.dato = data.dato.replace(" ", "T").substr(0, 19);
        setServiceData(data);
        console.log("hej" + data);
        setFormToShow("ADDTILSYN");
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
    } else if (type === "service") {
      return (gid) => {
        deleteService(
          sessionStorage.getItem("session_id"),
          stationId,
          gid
        ).then((res) => {
          resetServiceData();
          setUpdated(new Date());
        });
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
      {formToShow !== "ADDPEJLING" ? (
        <BearingGraph
          stationId={stationId}
          updated={updated}
          measurements={control}
        />
      ) : (
        <BearingGraph
          stationId={stationId}
          updated={updated}
          measurements={control}
          dynamicMeasurement={dynamic}
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
          isWaterlevel={isWaterlevel}
          isFlow={isFlow}
        />
      )}
      {formToShow === "RET_STAMDATA" && !isCalculated && (
        <EditStamdata setFormToShow={setFormToShow} stationId={stationId} />
      )}
      {formToShow === "ADDMAALEPUNKT" && isWaterlevel && (
        <MaalepunktForm
          formData={mpData}
          changeFormData={changeMpData}
          handleSubmit={handleMpSubmit}
          resetFormData={resetMpData}
          handleCancel={handleMpCancel}
          canEdit={canEdit}
        ></MaalepunktForm>
      )}
      {formToShow === "ADDMAALEPUNKT" && isWaterlevel && (
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
      {formToShow === "ADDTILSYN" && !isCalculated && (
        <TilsynForm
          formData={serviceData}
          changeFormData={changeServiceData}
          handleSubmit={handleServiceSubmit}
          resetFormData={() => setFormToShow(null)}
        ></TilsynForm>
      )}
      {formToShow === "ADDTILSYN" && (
        <TilsynTable
          services={services}
          handleEdit={handleEdit("service")}
          handleDelete={handleDelete("service")}
          canEdit={canEdit}
        ></TilsynTable>
      )}
      {formToShow === "CAMERA" && (
        <StationImages locationId={location.pathname.split("/")[2]} />
      )}
      <ActionArea
        open={open}
        stationId={stationId}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
        isWaterlevel={isWaterlevel}
        isCalculated={isCalculated}
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
