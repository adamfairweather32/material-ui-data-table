import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Pluralize from "react-pluralize";
import ErrorIcon from "@material-ui/icons/Error";
import { Typography, Paper } from "@material-ui/core";
import DataTableSearchBox from "./DataTableSearchBox";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  searchBox: {
    marginLeft: "auto",
    alignSelf: "flex-end"
  },
  alertContainer: {
    display: "flex",
    padding: "5px 7px 5px 7px",
    color: "#fff",
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.error.main
  },
  alertIcon: {
    margin: "2px"
  },
  alertLabel: {
    margin: "2px"
  }
}));

const DataTableTopPanel = ({
  showFilter = true,
  showErrors = true,
  errorCount = 0,
  onSearchTextChanged
}) => {
  const classes = useStyles();

  if (!showFilter && !showErrors) {
    return null;
  }
  const showAlert = showErrors && !!errorCount;

  return (
    <div className={classes.root}>
      {showAlert && (
        <Paper className={classes.alertContainer}>
          <ErrorIcon className={classes.alertIcon} />
          <Typography className={classes.alertLabel}>
            <Pluralize singular={"error"} count={errorCount} />
          </Typography>
        </Paper>
      )}
      {showFilter && (
        <div className={classes.searchBox}>
          <DataTableSearchBox onSearchTextChanged={onSearchTextChanged} />
        </div>
      )}
    </div>
  );
};

export default DataTableTopPanel;
