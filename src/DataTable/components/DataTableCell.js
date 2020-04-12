import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import DataTableField from './DataTableField';
import { createCellId } from '../helpers/helpers';

const useStyles = makeStyles(theme => ({
    formControlRoot: {
        '& .MuiFormControl-root': {
            display: 'flex'
        }
    },
    tableCellRoot: {
        borderBottom: '0'
    },
    tableCellSizeSmall: {
        padding: '0',
        '&:last-child': {
            paddingRight: 0,
            borderRight: '1px solid rgba(224, 224, 224, 1)'
        }
    }
}));

const DataTableCell = ({
    tableId,
    row,
    column,
    onCellChange,
    onCommit,
    onCancel,
    value,
    error,
    warning,
    onFocus,
    isHeader,
    reference
}) => {
    const classes = useStyles();

    const renderDataField = () => {
        if (column.rich) {
            return (
                <DataTableField
                        value={value}
                    column={column}
                    row={row}
                    error={error}
                        warning={warning}
                    id={createCellId(tableId, row.id, column.field)}
                        reference={reference}
                    onCellChange={onCellChange}
                        onCommit={onCommit}
                    onCancel={onCancel}
                />
            );
        }
        return value;
    };

    const attributes = isHeader ? { component: 'th', scope: 'row' } : {};
    return (
        <TableCell
                classes={{
                root: classes.tableCellRoot,
                sizeSmall: classes.tableCellSizeSmall
            }}
            className={classes.formControlRoot}
            onFocus={onFocus}
            {...attributes}
                {renderDataField()}
          </TableCell>
    );
};

const propsAreEqual = (prev, next) => {
    return prev.value === next.value;
};

export const MemoizedDataTableCell = memo(DataTableCell, propsAreEqual);

export default DataTableCell;
