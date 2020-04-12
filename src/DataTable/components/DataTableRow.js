import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';

import DataTableField from './DataTableField';
import { createCellId } from '../helpers/helpers';

const styles = () => ({
    tableCell: {
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem'
    }
});

const DataTableRow = ({ classes, tableId, columns, rows, rowIndex, focusedId, handleCellClick }) => {
    const renderRow = () =>
        columns.map((column, i) => {
            const row = rows[rowIndex];
            const rowId = row.id;
            const { field } = column;
            const key = createCellId(tableId, rowId, field);
            const value = rows[rowIndex][field];
            const container = document.getElementById(`${tableId}-table`);
            const cols = container ? container.querySelectorAll('div.MuiTableCell-head') : [];

            const currentColWidth = cols[i] ? cols[i].getBoundingClientRect().width : 0;

            return (
                <TableCell
                    component="div"
                    variant="body"
                    key={key}
                    padding="none"
                    style={{
                        width: `${currentColWidth}px`,
                        display: 'inline-block'
                    }}
                    className={clsx(classes.tableCell)}
                    onClick={handleCellClick}>
                    <DataTableField id={key} value={value} focusedId={focusedId} />
                </TableCell>
            );
        });

    return renderRow();
};

export default withStyles(styles)(DataTableRow);
