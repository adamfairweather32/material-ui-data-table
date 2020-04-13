import React, { memo } from 'react';
import StyledOutlinedInput from '../styled/StyledOutlinedInput';

const DataTableField = ({ id, value, column }) => {
    const {
        rich: { numeric = false }
    } = column || { rich: {} };

    const inputProps = {
        readOnly: true,
        style: {
            textAlign: numeric ? 'right' : undefined
        }
    };

    return (
        <div tabIndex={-1} contentEditable id={id} style={{ border: '1px', borderStyle: 'solid', borderColor: 'grey' }}>
            {value}
        </div>
    );
    // return <StyledOutlinedInput variant="outlined" inputProps={inputProps} id={id} value={value} />;
};

const propsAreEqual = (prev, next) => {
    return prev.value === next.value;
};

export const MemoizedDataTableField = memo(DataTableField, propsAreEqual);

export default DataTableField;
