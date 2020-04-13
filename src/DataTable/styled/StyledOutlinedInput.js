import OutlinedInput from '@material-ui/core/OutlinedInput';
import styled from 'styled-components';

const StyledOutlinedInput = styled(OutlinedInput)`
    &.MuiInputBase-root {
        padding-left: 0px;
        display: flex;
    }
    .MuiInputBase-input {
        padding: 0;
    }
    .MuiOutlinedInput-input {
        padding: 5px;
    }
    &.MuiOutlinedInput-root {
        border-radius: 0;
    }
    .MuiOutlinedInput-notchedOutline {
        border-width: 0;
    }
    .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
        border-width: 1px;
    }
    .MuiOutlinedInput-root.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-width: 2px;
    }
`;

export default StyledOutlinedInput;
