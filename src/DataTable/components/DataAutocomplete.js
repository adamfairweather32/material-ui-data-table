import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import StyledAutocomplete from "./StyledAutocomplete";
import { StyledTextFieldNoBorder } from "./StyledTextField";
import {
  isValidChar,
  markCellIsEditing,
  removeCellIsEditing,
  removeTextSelection
} from "../helpers/helpers";

import {
  ESC,
  ENTER,
  ALPHA_NUMERIC_TYPE,
  DELETE,
  WARNING_COLOUR
} from "../constants";

const useStyles = makeStyles(theme => ({
  option: {
    fontSize: 15,
    "& > span": {
      marginRight: 10,
      fontSize: 18
    }
  },
  autocompleteWrapper: {
    display: "flex"
  },
  autocompleteRoot: {
    width: props => props.width,
    flex: "1"
  }
}));

const DataAutocomplete = ({
  id,
  value,
  row,
  column,
  error,
  warning,
  onCellChange,
  onCommit,
  onCancel
}) => {
  const {
    rich: {
      width = null,
      editable = false,
      autoComplete = {
        free: false
      }
    },
    clearable = false,
    field
  } = column;

  const classes = useStyles({ width });

  const [editing, setEditing] = useState(false);
  const [enterEditing, setEnterEditing] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);

  const inputProps = {
    readOnly: !editing || !editable
  };

  const canAcceptValue = () => {
    return free || (value !== "" && autoComplete.options[value]);
  };

  useEffect(() => {
    //if menu has been forced closed but the
    //inner value is blank then reset to previous value
    if (!focused && !canAcceptValue()) {
      exitEditMode(true);
    }
  }, [focused]);

  const enterEditMode = () => {
    setEnterEditing(true);
    setEditing(true);
    markCellIsEditing(id);
  };

  const exitEditMode = (cancel = false) => {
    setEditing(false);
    setEnterEditing(false);
    removeCellIsEditing(id);
    cancel ? onCancel() : onCommit();
  };

  const commitChange = () => {
    if (editing) {
      const cancel = !canAcceptValue();
      exitEditMode(cancel);
    }
  };

  const cancelChange = () => {
    removeTextSelection();
    exitEditMode(true);
  };

  const handleChange = e => {
    onCellChange(e.target.value, row, field);
  };

  const handleAutocompleteChange = (e, item) => {
    if (item && item.value) {
      const { value } = item;
      setEditing(false);
      setEnterEditing(false);
      removeCellIsEditing(id);
      onCellChange(value, row, field, true);
    }
  };

  const handleKeyPress = e => {
    if (enterEditing) {
      const char = String.fromCharCode(e.which);
      onCellChange(char, row, field);
      setEnterEditing(false);
    }
  };

  const handleKeyDown = e => {
    if (!editable) {
      return;
    }
    if (e.keyCode === ESC) {
      cancelChange();
    }
    if (!editing && clearable && value && e.keyCode === DELETE) {
      onCellChange("", row, column.field, true);
    }
    if (
      !editing &&
      e.keyCode !== DELETE &&
      isValidChar(String.fromCharCode(e.keyCode), ALPHA_NUMERIC_TYPE)
    ) {
      enterEditMode();
    }
    if (editing && e.keyCode === ENTER) {
      commitChange();
    }
  };

  const handleBlur = e => {
    setFocused(false);
    setEditing(false);
  };

  const handleFocus = e => {
    removeTextSelection();
    setFocused(true);
  };

  const handleDropdownClick = e => {
    const isDropdownClick =
      e.target.tagName &&
      (e.target.tagName.toUpperCase() === "PATH" ||
        e.target.tagName.toUpperCase() === "SVG");

    if (isDropdownClick) {
      inputRef.current.focus();
      if (!editing) {
        enterEditMode();
      } else {
        exitEditMode();
      }
    }
  };

  const stylingProps = {
    style: {}
  };

  if (warning && !error) {
    stylingProps.style = {
      ...stylingProps.style,
      backgroundColor: WARNING_COLOUR
    };
  }
  const { free, options } = autoComplete;
  const openMenu = focused && editing;
  const option = options[value];

  return (
    <div className={classes.autocompleteWrapper}>
      <StyledAutocomplete
        id={id}
        freeSolo={free}
        value={option || value}
        className={classes.autocompleteRoot}
        onChange={handleAutocompleteChange}
        readOnly
        options={options}
        open={openMenu}
        onClick={handleDropdownClick}
        classes={{
          option: classes.option
        }}
        getOptionLabel={option => option.label || option}
        renderOption={option => {
          const { customLabelBuilder, label, value } = option;
          if (customLabelBuilder) {
            return <>{customLabelBuilder(option)}</>;
          }
          return <>{label || value}</>;
        }}
        disableClearable
        renderInput={params => (
          <StyledTextFieldNoBorder
            {...params}
            error={!!error}
            title={error || warning || (option && option.label)}
            variant="outlined"
            inputRef={inputRef}
            fullWidth
            onChange={free ? handleChange : undefined}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            onFocus={handleFocus}
            inputProps={{
              ...inputProps,
              ...params.inputProps,
              autoComplete: "disabled",
              style: {
                textOverflow: "ellipsis"
              },
              ...stylingProps
            }}
          />
        )}
      />
    </div>
  );
};

export default DataAutocomplete;
