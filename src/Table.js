// import React, { useEffect, useState } from 'react';
// import { DataGrid } from '@material-ui/data-grid';
// import { makeStyles } from '@material-ui/core/styles';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Paper from '@material-ui/core/Paper';
// import clsx from 'clsx';
// import { getTableData } from './api';

// const columns = [
//     {field: 'stationname', headerName:'Stationsnavn', width:200},
//     {field:'parameter', headerName:'Parameter', width:200},
//     {field:'loc_owner', headerName:'Ejer', width: 200},
//     {
//         field:'alarm',
//         headerName:'Alarm',
//         width:200,
//         cellClassName:(params) =>
//             clsx('sensor-app', {
//                 negative: params.value === '!',
//                 positive: params.value === 'OK'
//             })
//     }
// ];

// const useStyles = makeStyles({
//     root:{
//         '& .sensor-app.negative':{
//             backgroundColor: '#d47483',
//             color: '#1a3e72',
//             fontWeight: '600',
//         },
//         '& .sensor-app.positive': {
//             backgroundColor: 'rgba(157, 255, 118, 0.49)',
//             color: '#1a3e72',
//             fontWeight: '600'
//         }
//     }
// });

// export default function Grid(props){
//     const classes = useStyles();
//     const [data, setData] = useState([]);
//     useEffect(()=>{
//         getTableData()
//         .then(res =>{
//             setData(res.data.features);
//             console.log(res.data.features);
//         });
//     },[]);

//     let rows = data.map((s,index) => {
//         let properties = s.properties;
//         properties.id = index;
//         return properties;
//     });

//     return (
//             <Paper>
//         <div style={{height:1000, width:'100%'}} className={classes.root}>
//             {
//                 data.length > 0
//                         ? <DataGrid rows={rows} columns={columns}  />
//                         : <CircularProgress />
//             }

//         </div>
//             </Paper>
//     );
// }
