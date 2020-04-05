import React, { useState } from "react";
import { format } from "date-fns";
import InputMask from "react-input-mask";
import InputAdornment from "@material-ui/core/InputAdornment";
import EventIcon from "@material-ui/icons/Event";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import { StyledOutlinedInputNoBorder } from "./StyledOutlinedInput";
import StyledFormControl from "./StyledFormControl";
import { Calendar } from "@material-ui/pickers";
import {
  DATE_FORMAT_MASK,
  DATE_REGEX,
  ESC,
  DATE_FORMAT,
  NUMERIC_TYPE,
  ENTER,
  DELETE,
  WARNING_COLOUR
} from "../constants";
import {
  isValidChar,
  isNumPad,
  markCellIsEditing,
  removeCellIsEditing,
  isValidDate,
  setCaretPosition
} from "../helpers/helpers";

const TextMaskWithInputMask = props => (
  <InputMask
    {...props}
    mask={DATE_FORMAT_MASK}
    style={{ textOverflow: "ellipsis" }}
  />
);

const DataDatePicker = ({
  id,
  value,
  row,
  column,
  error,
  warning,
  range: { from, to } = {},
  onCellChange,
  onCommit,
  onCancel
}) => {
  const {
    rich: {
      editable = false,
      date: { format: formatString }
    },
    clearable = false,
    field
  } = column;

  const [editing, setEditing] = useState(false);
  const [enterEditing, setEnterEditing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const fromDate = from && isValidDate(from) ? new Date(from) : null;
  const toDate = to && isValidDate(to) ? new Date(to) : null;

  const inputProps = {
    readOnly: !editing || !editable
  };

  const isWithinAcceptedDateRange = value => {
    if (fromDate && toDate) {
      const date = new Date(value);
      return fromDate <= date && date <= toDate;
    }
    return true;
  };

  const canAcceptValue = () =>
    value &&
    isValidDate(value) &&
    DATE_REGEX.test(value) &&
    isWithinAcceptedDateRange(value);

  const getAnchorElement = () => {
    return document.getElementById(id);
  };

  const enterEditMode = () => {
    setEditing(true);
    setEnterEditing(true);
    markCellIsEditing(id);
  };

  const exitEditMode = cancel => {
    setEditing(false);
    cancel ? onCancel() : onCommit();
    removeCellIsEditing(id);
  };

  const commitChange = () => {
    if (editing) {
      const cancel = !canAcceptValue();
      exitEditMode(cancel);
    }
  };

  const cancelChange = () => {
    exitEditMode(true);
  };

  const handleCalendarChange = (date, _) => {
    setEditing(false);
    setShowCalendar(false);
    onCellChange(format(date, DATE_FORMAT), row, field, true);
  };

  const handleKeyPress = e => {
    if (enterEditing) {
      setCaretPosition(document.getElementById(id), 0);
      setEnterEditing(false);
    }
  };

  const handleChange = event => {
    onCellChange(event.target.value, row, column.field);
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
    let keyCode = isNumPad(e.keyCode) ? e.keyCode - 48 : e.keyCode;
    if (
      !editing &&
      e.keyCode !== DELETE &&
      isValidChar(String.fromCharCode(keyCode), NUMERIC_TYPE)
    ) {
      enterEditMode();
    }
    if (editing && e.keyCode === ENTER) {
      commitChange();
    }
  };

  const handleShowCalendar = e => {
    setShowCalendar(true);
  };

  const handleClose = e => {
    setShowCalendar(false);
  };

  const handleDoubleClick = e => {
    if (!editing) {
      enterEditMode();
    }
  };

  const handleBlur = e => {
    const cancel = !canAcceptValue();
    if (cancel) {
      cancelChange();
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

  return (
    <div>
      <StyledFormControl>
        <StyledOutlinedInputNoBorder
          id={id}
          error={!!error}
          title={error || warning || value}
          value={
            !editing && isValidDate(value)
              ? format(new Date(value), formatString)
              : value
          }
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyPress={handleKeyPress}
          onDoubleClick={handleDoubleClick}
          onBlur={handleBlur}
          inputComponent={TextMaskWithInputMask}
          inputProps={{ ...inputProps, ...stylingProps }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleShowCalendar}>
                <EventIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </StyledFormControl>
      <Popover
        open={showCalendar}
        anchorEl={getAnchorElement()}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Calendar
          date={isValidDate(value) ? new Date(value) : new Date()}
          onChange={handleCalendarChange}
          allowKeyboardControl
        />
      </Popover>
    </div>
  );
};

export default DataDatePicker;
