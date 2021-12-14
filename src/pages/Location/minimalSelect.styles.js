import { deepPurple } from "@material-ui/core/colors";

export default () => ({
  select: {
    minWidth: 200,
    background: "white",
    color: deepPurple[500],
    fontWeight: 200,
    borderStyle: "none",
    borderWidth: 2,
    borderRadius: 6,
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 5,
    boxShadow: "0px 5px 8px -3px rgba(0,0,0,0.14)",
    "&:focus": {
      borderRadius: 6,
      background: "white",
      borderColor: deepPurple[100],
    },
  },
  icon: {
    color: deepPurple[300],
    right: 12,
    position: "absolute",
    userSelect: "none",
    pointerEvents: "none",
  },
  paper: {
    borderRadius: 6,
    marginTop: 8,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    background: "white",
    "& li": {
      fontWeight: 100,
      paddingTop: 2,
      paddingBottom: 2,
    },
    "& li:hover": {
      color: "white",
      background: "rgb(0,120,109)",
    },
    "& li.Mui-selected": {
      color: "white",
      background: "rgb(0,120,109)",
    },
    "& li.Mui-selected:hover": {
      background: "rgb(0,120,109)",
    },
  },
});
