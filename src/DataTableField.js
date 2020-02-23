import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { StyledTextFieldNoBorder } from "./StyledTextField";

const styles = theme => ({
  readOnlyDiv: {
    padding: "4px 5px 5px 5px"
  }
});

const DataTableField = ({ classes, id, value, focused }) => {
  if (!focused) {
    return (
      <div id={id} tabIndex={-1} className={classes.readOnlyDiv}>
        {value}
      </div>
    );
  }
  const inputProps = {
    readOnly: true
  };
  return (
    <StyledTextFieldNoBorder
      InputProps={inputProps}
      id={id}
      variant="outlined"
      value={value}
      autoFocus
    />
  );
};

export default withStyles(styles)(DataTableField);
