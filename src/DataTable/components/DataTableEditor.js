import React, { forwardRef } from 'react';
import DataTableAutoCompleteEditor from './editors/DataTableAutoCompleteEditor';
import DataTableAutoDateEditor from './editors/DataTableDateEditor';
import DataTableTextEditor from './editors/DataTableTextEditor';

import { getColumnType } from '../helpers/helpers';
import { COMBO_TYPE, DATE_TYPE } from '../constants';

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
    onBlur
}) => {
    const type = column && getColumnType(column);
    switch (type) {
        case COMBO_TYPE: {
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
        case DATE_TYPE: {
            return (
                <DataTableAutoDateEditor
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
            return (
                <DataTableTextEditor
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
    }
};

export default forwardRef((props, ref) => <DataTableEditor {...props} inputRef={ref} />);
