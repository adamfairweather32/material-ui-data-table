import React, { Component, forwardRef } from 'react';
import StyledOutlinedInput from '../../styled/StyledOutlinedInput';

class DataTableDateEditor extends Component {
    render() {
        const { id, inputRef, onBlur } = this.props;
        console.log(`${id} is rendered as DataTableDateEditor`);
        return <StyledOutlinedInput id={id} onBlur={onBlur} variant="outlined" inputRef={inputRef} />;
    }
}

export default forwardRef((props, ref) => <DataTableDateEditor {...props} inputRef={ref} />);
