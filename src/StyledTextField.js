import TextField from "@material-ui/core/TextField";
import styled from "styled-components";

export const StyledTextField = styled(TextField)`
  &.MuiFormControl-root {
    display: flex;
  }
  .MuiOutlinedInput-input {
    padding: 4px 5px 5px 5px;
  }
  .MuiOutlinedInput-root {
    border-radius: 0;
  }
`;

export const StyledTextFieldNoBorder = styled(StyledTextField)`
  /* .PrivateNotchedOutline-root-99 {
    border-width: 0;
  } */
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

export default StyledTextField;
