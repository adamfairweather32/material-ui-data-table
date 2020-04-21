import React from 'react';
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
    }
});

const DataTableRow = ({
    classes,
    tableId,
    columns,
    columnElements,
    row,
    onCellDoubleClick,
    onCellKeyDown,
    onMouseDown,
    onBlur
}) => {
    const rowId = row.id;

    const renderRow = () =>
        columns.map((column, i) => {
            const { field } = column;
            const key = createCellId(tableId, rowId, field);
            const value = row[field];
            const currentColWidth = columnElements[i] ? columnElements[i].getBoundingClientRect().width : 0;

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
        });

    return renderRow();
};

export default withStyles(styles)(DataTableRow);
