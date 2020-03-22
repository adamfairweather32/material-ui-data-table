import TextField from "@material-ui/core/TextField";
import styled from "styled-components";

export const StyledTextField = styled(TextField)`
  &.MuiFormControl-root {
    display: flex;
  }
  .MuiOutlinedInput-input {
    padding: 5px;
  }
  .MuiOutlinedInput-root {
    border-radius: 0;
  }
`;

export const StyledTextFieldNoBorder = styled(StyledTextField)`
  .MuiOutlinedInput-notchedOutline {
    border-width: 0px;
  }
  .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
    border-width: 1px;
  }
  .MuiOutlinedInput-root.Mui-error.Mui-focused
    .MuiOutlinedInput-notchedOutline {
    border-width: 2px;
  }
`;

export default StyledTextField;
