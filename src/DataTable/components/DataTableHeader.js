import React, { useState } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';

const styles = () => ({
    tableCell: {
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem'
    },
    tableCellHead: {
        fontSize: '1rem',
        fontWeight: 'bold',
        verticalAlign: 'middle',
        position: 'sticky',
        zIndex: 4,
        backgroundColor: '#fcfcfc',
        color: 'black',
        top: 0,
        '&:last-child': {
            paddingRight: '4px'
        }
    },
    tableCellHeadDiv: {
        paddingLeft: '5px'
    },
    tableRow: {
        display: 'table-row'
    }
});

const initialState = {
    mouseX: null,
    mouseY: null
};

const DataTableHeader = ({ classes, columns, rowHeight }) => {
    const [menuPosition, setMenuPosition] = useState(initialState);

    const hasParentHeader = columns.filter(c => c.parentHeaderName).length > 0;

    const getAlignment = (parentHeader, allColumns) => {
        const matchingColumns = allColumns.filter(c => c.parentHeaderName && c.parentHeaderName === parentHeader);
        if (matchingColumns.length > 1) {
            return 'left';
        }
        const {
            rich: { numeric = false }
        } = (matchingColumns && matchingColumns[0]) || { rich: {} };

        return numeric ? 'right' : 'left';
    };

    const shouldShowField = (parentHeader, index, allColumns) => {
        // get start position of parent header
        const startIndex = _.indexOf(
            allColumns.map(c => c.parentHeaderName),
            parentHeader
        );
        return index === startIndex;
    };

    const renderParentHeader = () => {
        const calcColumns = columns.map((c, i) => ({
            ...c,
            showField: shouldShowField(c.parentHeaderName, i, columns),
            align: getAlignment(c.parentHeaderName, columns)
        }));

        return (
            <>
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {calcColumns.map(({ field, parentHeaderName, align, showField = true }) => (
                        <TableCell
                            component="div"
                            align={align}
                            variant="head"
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            key={field}
                            padding="none">
                            {showField && <div className={classes.tableCellHeadDiv}>{parentHeaderName}</div>}
                        </TableCell>
                    ))}
                </div>
            </>
        );
    };

    const renderHeader = () => {
        return (
            <>
                {hasParentHeader && renderParentHeader()}
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {columns.map(({ field, headerName }) => (
                        <TableCell
                            variant="head"
                            component="div"
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            style={{
                                top: rowHeight
                            }}
                            key={field}
                            padding="none">
                            <div className={classes.tableCellHeadDiv}>{headerName}</div>
                        </TableCell>
                    ))}
                </div>
            </>
        );
    };

    return renderHeader();
};

export default withStyles(styles)(DataTableHeader);
