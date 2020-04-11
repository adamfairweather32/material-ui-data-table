import React, { memo } from "react";
import { withStyles } from "@material-ui/core/styles";
import StyledOutlinedInput from "../styled/StyledOutlinedInput";

const styles = () => ({
});

const DataTableField = ({ classes, id, value }) => {
  const inputProps = {
    readOnly: true
  };
  return (
    <StyledOutlinedInput
      inputProps={inputProps}
      id={id}
      value={value}
    />
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
