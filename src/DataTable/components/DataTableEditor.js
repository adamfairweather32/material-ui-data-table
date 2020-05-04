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
    onActivateEditor,
    onDeactivateEditor,
    onCellChange,
    onCommit,
    onCancel,
    inputRef,
    onBlur
}) => {
    const type = column && getColumnType(column);
    console.log('type = ', type);
    if (!type) {
        return null;
    }
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
                    ref={inputRef}
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
                    ref={inputRef}
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
                    onActivateEditor={onActivateEditor}
                    onDeactivateEditor={onDeactivateEditor}
                    ref={inputRef}
                />
            );
        }
    }
};

export default forwardRef((props, ref) => <DataTableEditor {...props} inputRef={ref} />);
