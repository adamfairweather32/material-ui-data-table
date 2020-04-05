import React, { memo } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";

const styles = theme => ({
  root: {
    display: "flex",
    "& > *": {
      marginLeft: theme.spacing(1)
    }
  },
  button: {
    flex: 1,
    maxWidth: "100px",
    margin: "0 5px 0 0"
  }
});

const AddDeletePanel = ({
  classes,
  canAdd,
  onAddRequested,
  canDelete,
  onDeleteRequested
}) => {
  const handleDelete = e => {
    onDeleteRequested();
  };

  const handleAdd = e => {
    onAddRequested();
  };

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        disabled={!canAdd}
        onClick={handleAdd}
        startIcon={<AddCircleIcon />}
      >
        Add
      </Button>
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        disabled={!canDelete}
        onClick={handleDelete}
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>
    </div>
  );
};

const propsAreEqual = (prev, next) => {
  return prev.canAdd === next.canAdd && prev.canDelete === next.canDelete;
};

export const MemoizedAddDeletePanel = memo(
  withStyles(styles)(AddDeletePanel),
  propsAreEqual
);

export default withStyles(styles)(AddDeletePanel);
