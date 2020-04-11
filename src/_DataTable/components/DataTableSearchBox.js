import React, { useState } from "react";
import StyledTextField from "./StyledTextField";
import { ESC, SEARCH_DEBOUNCE_DELAY_SECS } from "../constants";

let timer = null;

const DataTableSearchBox = ({ onSearchTextChanged }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchKeyDown = e => {
    if (e.keyCode === ESC) {
      clearTimeout(timer);
      setSearchText("");
      timer = setTimeout(() => triggerChange(""), SEARCH_DEBOUNCE_DELAY_SECS);
    }
  };

  const triggerChange = searchText => {
    onSearchTextChanged(searchText);
  };

  const handleSearchChange = e => {
    clearTimeout(timer);
    const val = e.target.value;
    setSearchText(e.target.value);
    timer = setTimeout(() => triggerChange(val), SEARCH_DEBOUNCE_DELAY_SECS);
  };

  return (
    <>
      <StyledTextField
        variant="outlined"
        value={searchText}
        placeholder="Search..."
        onKeyDown={handleSearchKeyDown}
        onChange={handleSearchChange}
      />
    </>
  );
};

export default DataTableSearchBox;
