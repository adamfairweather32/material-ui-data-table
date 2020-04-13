import React, { memo } from 'react';
import StyledOutlinedInput from '../styled/StyledOutlinedInput';

const DataTableField = ({ id, value }) => {
    const inputProps = {
        readOnly: true
    };

    return <StyledOutlinedInput inputProps={inputProps} id={id} value={value} />;
};

const propsAreEqual = (prev, next) => {
    return prev.value === next.value;
};

export const MemoizedDataTableField = memo(DataTableField, propsAreEqual);

export default DataTableField;
