import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Checkbox } from '@material-ui/core';
import DataTableField from './DataTableField';
import { createCellId } from '../helpers/helpers';
import { SELECTOR } from '../constants';

const styles = () => ({
    checkBox: {
        padding: '0',
        paddingLeft: '10px'
    },
    tableCell: {
        letterSpacing: '0',
        lineHeight: 'normal',
        fontSize: '1rem',
        width: '6rem'
    },
    tableRow: {
        display: 'table-row',
        '&$selected, &$selected:hover': {
            backgroundColor: '#00fffb'
        }
    },
    tableRowOdd: {
        backgroundColor: '#EBEAF6'
    },
    hover: {},
    selected: {}
});

const DataTableRow = ({
    alternate = false,
    classes,
    tableId,
    tracking,
    editorFocused,
    editing,
    columns,
    columnElements,
    selected,
    row,
    rowHeight,
    rowIndex,
    tableWidth,
    onCellDoubleClick,
    onMouseDown,
    onSelectedChanged
}) => {
    const rowId = row.id;

    const handleRowClick = rowId => () => {
        const newValue = !selected;
        onSelectedChanged(rowId, newValue);
    };

    const renderCell = (column, index) => {
        const { field } = column;
        const key = createCellId(tableId, rowId, field);
        const value = row[field];
        const currentColWidth = columnElements[index] ? columnElements[index].getBoundingClientRect().width : 0;
        const labelId = `enhanced-table-checkbox-${rowIndex}`;
        return (
            <TableCell
                component="div"
                key={key}
                variant="body"
                padding="none"
                className={classes.tableCell}
                style={{
                    width: `${currentColWidth}px`,
                    maxHeight: rowHeight
                }}>
                {field !== SELECTOR ? (
                    <DataTableField
                        id={key}
                        tracking={tracking}
                        editing={editing}
                        // editor focus changing state only matters if the current tracked id is this id
                        // as we don't want to needlessly re-render every cell
                        editorFocused={tracking === key && editorFocused}
                        column={column}
                        value={value}
                        rowHeight={rowHeight}
                        onMouseDown={onMouseDown}
                        onDoubleClick={onCellDoubleClick}
                    />
                ) : (
                    <Checkbox
                        className={classes.checkBox}
                        checked={selected}
                        onClick={handleRowClick(rowId)}
                        inputProps={{ 'aria-labelledby': labelId }}
                        style={{ maxHeight: rowHeight }}
                    />
                )}
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
        <TableRow
            hover
            component="div"
            tabIndex={-1}
            aria-checked={selected}
            selected={selected}
            style={style}
            classes={{ hover: classes.hover, selected: classes.selected }}
            className={clsx(
                classes.tableRow,
                rowIndex % 2 === 0 && alternate ? classes.tableRowOdd : classes.tableRow
            )}>
            {columns.map((column, index) => renderCell(column, index))}
        </TableRow>
    );
};

export default withStyles(styles)(DataTableRow);
