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

    return <StyledOutlinedInput variant="outlined" inputProps={inputProps} id={id} value={value} />;
};

const propsAreEqual = (prev, next) => {
    return prev.value === next.value;
};

export const MemoizedDataTableField = memo(DataTableField, propsAreEqual);

export default DataTableField;
