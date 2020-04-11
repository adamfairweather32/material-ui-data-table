import OutlinedInput from "@material-ui/core/OutlinedInput";
import styled from "styled-components";

export const StyledOutlinedInput = styled(OutlinedInput)`
  .MuiOutlinedInput-input {
    padding: 5px;
  }
`;

export const StyledOutlinedInputNoBorder = styled(StyledOutlinedInput)`
  .MuiOutlinedInput-notchedOutline {
    border-width: 0;
  }
  .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
    border-width: 1px;
  }
  .MuiOutlinedInput-root.Mui-error.Mui-focused
    .MuiOutlinedInput-notchedOutline {
    border-width: 2px;
  }
`;

export default StyledOutlinedInput;
