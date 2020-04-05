import React, { useState, useRef } from "react";
import { StyledTextFieldNoBorder } from "./StyledTextField";
import "./DataTextField.css";
import {
  isValidChar,
  markCellIsEditing,
  removeCellIsEditing,
  removeTextSelection,
  getFormattedCurrencyValue,
  translateKeyCodeToChar,
  getBlinkDirectionColour,
  setCaretPosition
} from "../helpers/helpers";
import usePrevious from "../hooks/usePrevious";
import {
  ESC,
  CURRENCY_TYPE,
  NUMERIC_TYPE,
  ALPHA_TYPE,
  BLINK_CSS_PREFIX,
  DELETE,
  WARNING_COLOUR,
  ERROR_COLOUR
} from "../constants";

const DataTextField = ({
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
    rich: { numeric = false, editable = false, currency, blink = false },
    clearable = false
  } = column;

  const { warnNegative = true, showCurrencySymbol = true } = currency || {};
  const [editing, setEditing] = useState(false);
  const [clearOnType, setClearOnType] = useState(true);
  const [enterEditing, setEnterEditing] = useState(false);
  const previousValue = usePrevious(value);
  const blinkColour =
    !editing && blink ? getBlinkDirectionColour(value, previousValue) : null;

  const inputRef = useRef(null);

  const inputProps = {
    readOnly: !editing || !editable
  };

  const canAcceptValue = () => {
    if (value === "" && !clearable) {
      return false;
    }
    if (currency || numeric) {
      return !isNaN(value) && !value.toString().endsWith(".");
    }
    return true;
  };

  const setCaretPositionToEnd = () => {
    const length = value ? value.toString().length : 0;
    setCaretPosition(document.getElementById(id), length);
  };

  const enterEditMode = () => {
    setEnterEditing(true);
    setEditing(true);
    markCellIsEditing(id);
  };

  const exitEditMode = () => {
    setEditing(false);
    removeCellIsEditing(id);
  };

  const cancelChange = () => {
    exitEditMode();
    onCancel();
  };

  const commitChange = () => {
    if (editing && canAcceptValue()) {
      exitEditMode();
      onCommit();
    } else {
      cancelChange();
    }
  };

  const parseValue = newValue => {
    if (numeric || currency) {
      if (newValue && !isNaN(newValue)) {
        return newValue;
      }
      if (!clearable) {
        return 0;
      }
    }
    return newValue;
  };

  const formatValue = value =>
    !editing && currency && (value || value === 0)
      ? getFormattedCurrencyValue(value, showCurrencySymbol)
      : value;

  const handleChange = e => {
    const valueToPublish = parseValue(e.target.value);
    onCellChange(valueToPublish, row, column.field);
  };

  const handleKeyPress = e => {
    if (enterEditing) {
      if (value && clearOnType) {
        onCellChange("", row, column.field);
      }
      setClearOnType(true);
      setEnterEditing(false);
    }
  };

  const handleBlur = e => {
    commitChange();
  };

  const getType = () => {
    if (currency) {
      return CURRENCY_TYPE;
    }
    if (numeric) {
      return NUMERIC_TYPE;
    }
    return ALPHA_TYPE;
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
      isValidChar(translateKeyCodeToChar(e.keyCode), getType())
    ) {
      setCaretPositionToEnd();
      enterEditMode();
    }
  };

  const handleFocus = e => {
    if (value) {
      removeTextSelection();
    }
  };

  const handleDoubleClick = e => {
    if (!editing) {
      setClearOnType(false);
      enterEditMode();
    }
  };

  const formattedValue = formatValue(value);

  const stylingProps = {
    style: {
      textAlign: numeric ? "right" : undefined,
      textOverflow: "ellipsis"
    }
  };

  const showNegativeCurrencyWarning =
    warnNegative && formattedValue && formattedValue.toString().includes("(");

  if (!warning && showNegativeCurrencyWarning) {
    stylingProps.style = {
      ...stylingProps.style,
      color: ERROR_COLOUR
    };
  }
  if (warning && !error) {
    stylingProps.style = {
      ...stylingProps.style,
      backgroundColor: WARNING_COLOUR
    };
  }

  return (
    <div>
      <StyledTextFieldNoBorder
        id={id}
        error={!!error}
        className={
          blinkColour ? `${BLINK_CSS_PREFIX}-${blinkColour}` : undefined
        }
        autoComplete="off"
        title={error || warning || formattedValue}
        variant="outlined"
        value={formattedValue}
        onDoubleClick={handleDoubleClick}
        onKeyDown={editable ? handleKeyDown : undefined}
        onKeyPress={editable ? handleKeyPress : undefined}
        onChange={editable ? handleChange : undefined}
        onBlur={editable ? handleBlur : undefined}
        onFocus={handleFocus}
        InputProps={inputProps}
        inputProps={stylingProps}
        inputRef={inputRef}
      />
    </div>
  );
};

export default DataTextField;
