import React, { memo } from "react";
import { withStyles } from "@material-ui/core/styles";
import StyledInput from "./StyledInput";

const styles = theme => ({
  readOnlyDiv: {
    padding: "5px"
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
    <StyledInput inputProps={inputProps} id={id} value={value} autoFocus />
  );
};

const propsAreEqual = (prev, next) => {
  return prev.value === next.value && prev.focused === next.focused;
};

export const MemoizedDataTableField = memo(
  withStyles(styles)(DataTableField),
  propsAreEqual
);

export default withStyles(styles)(DataTableField);
