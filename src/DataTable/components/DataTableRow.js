import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';

import DataTableField from './DataTableField';
import { createCellId } from '../helpers/helpers';

const styles = () => ({
    tableCell: {
        display: 'inline-block',
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem'
    },
    tableRow: {
        display: 'table-row'
    },
    tableRowOdd: {
        backgroundColor: '#EBEAF6'
    },
    tableRowEven: {
        backgroundColor: '#fcfcfc'
    }
});

const DataTableRow = ({
    classes,
    tableId,
    columns,
    columnElements,
    row,
    rowHeight,
    rowIndex,
    tableWidth,
    onCellDoubleClick,
    onCellKeyDown,
    onMouseDown,
    onBlur
}) => {
    const rowId = row.id;

    const renderCell = (column, index) => {
        const { field } = column;
        const key = createCellId(tableId, rowId, field);
        const value = row[field];
        const currentColWidth = columnElements[index] ? columnElements[index].getBoundingClientRect().width : 0;

        return (
            <TableCell
                component="div"
                variant="body"
                key={key}
                padding="none"
                className={classes.tableCell}
                style={{
                    width: `${currentColWidth}px`
                }}>
                <DataTableField
                    id={key}
                    column={column}
                    value={value}
                    onMouseDown={onMouseDown}
                    onBlur={onBlur}
                    onDoubleClick={onCellDoubleClick}
                    onKeyDown={onCellKeyDown}
                />
            </TableCell>
        );
    };

    const style = {
        top: rowIndex * rowHeight,
        height: rowHeight,
        lineHeight: `${rowHeight}px`,
        width: tableWidth,
        position: 'absolute'
    };
    return (
        <div
            style={style}
            className={clsx(classes.tableRow, rowIndex % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven)}
            key={rowIndex}>
            {columns.map((column, index) => renderCell(column, index))}
        </div>
    );
};

export default withStyles(styles)(DataTableRow);
