import React, { forwardRef } from 'react';
import DataTableAutoCompleteEditor from './DataTableAutoCompleEditor';
import StyledOutlinedInput from '../styled/StyledOutlinedInput';

const DataTableEditor = ({
    id,
    value,
    row,
    column,
    error,
    warning,
    onCellChange,
    onCommit,
    onCancel,
    inputRef,
    editor,
    onBlur
}) => {
    const { type } = editor || {};

    switch (type) {
        case 'autocomplete': {
            return (
                <DataTableAutoCompleteEditor
                    id={id}
                    value={value}
                    row={row}
                    column={column}
                    error={error}
                    warning={warning}
                    onCellChange={onCellChange}
                    onCommit={onCommit}
                    onCancel={onCancel}
                    onBlur={onBlur}
                    inputRef={inputRef}
                />
            );
        }
        default: {
            return <StyledOutlinedInput id={id} onBlur={onBlur} variant="outlined" inputRef={inputRef} />;
        }
    }
};

export default forwardRef((props, ref) => <DataTableEditor {...props} inputRef={ref} />);
