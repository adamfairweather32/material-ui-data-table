import React, { Component, forwardRef } from 'react';
import StyledOutlinedInput from '../../styled/StyledOutlinedInput';

class DataTableDateEditor extends Component {
    render() {
        const { id, inputRef, onBlur } = this.props;
        return (
            <StyledOutlinedInput
                id={id}
                onBlur={onBlur}
                variant="outlined"
                inputRef={inputRef}
                inputProps={{ autoComplete: 'disabled' }}
            />
        );
    }
}

export default forwardRef((props, ref) => <DataTableDateEditor {...props} inputRef={ref} />);
