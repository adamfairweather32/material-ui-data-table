import InputBase from "@material-ui/core/InputBase";
import styled from "styled-components";

export const StyledInput = styled(InputBase)`
  &.MuiInputBase-root {
    padding-left: 5px;
    display: flex;
  }
  .MuiInputBase-input {
    padding: 0;
  }
`;

export default StyledInput;
