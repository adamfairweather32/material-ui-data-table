import FormControl from "@material-ui/core/FormControl";
import styled from "styled-components";

const StyledFormControl = styled(FormControl)`
  .MuiOutlinedInput-root {
    border-radius: 0px;
  }
  .MuiOutlinedInput-adornedEnd {
    padding-right: 0px;
  }
`;

export default StyledFormControl;
