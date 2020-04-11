import Autocomplete from "@material-ui/lab/Autocomplete";
import styled from "styled-components";

const StyledAutocomplete = styled(Autocomplete)`
  .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] {
    padding: 0px;
  }
  .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]
    .MuiAutocomplete-input {
    padding-top: 5px;
    padding-bottom: 5px;
  }
`;

export default StyledAutocomplete;
