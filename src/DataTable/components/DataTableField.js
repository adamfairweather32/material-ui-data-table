import React, { useState, memo } from 'react';
import StyledOutlinedInput from '../styled/StyledOutlinedInput';

const DataTableField = ({ id, value }) => {
    const [focused, setFocused] = useState(false);
    const inputProps = {
        readOnly: true
    };

    const handleFocus = () => {
        setFocused(true);
    };

    const handleBlur = () => {
        setFocused(false);
    };

    if (focused) {
        return (
            <div onBlur={handleBlur} id={id}>
                <StyledOutlinedInput inputProps={inputProps} id={id} value={value} autoFocus />
            </div>
        );
    }
    return (
        <div tabIndex={-1} onFocus={handleFocus} id={id}>
            {value}
        </div>
    );
};

const propsAreEqual = (prev, next) => {
    return prev.value === next.value;
};

export const MemoizedDataTableField = memo(DataTableField, propsAreEqual);

export default DataTableField;
