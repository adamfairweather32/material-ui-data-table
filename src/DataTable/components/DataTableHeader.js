import React, { useState, memo } from 'react';
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
        '&:first-child': {
            paddingLeft: '5px',
            paddingRight: '5px',
            borderLeft: '1px solid rgba(224, 224, 224, 1)'
        }
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

    const getAlignmentForColumn = column => {
        const {
            rich: { numeric = false }
        } = column || { rich: {} };

        return numeric ? 'right' : 'left';
    };

    const getAlignment = (parentHeader, allColumns) => {
        const matchingColumns = allColumns.filter(c => c.parentHeaderName && c.parentHeaderName === parentHeader);
        if (matchingColumns.length > 1) {
            return 'left';
        }
        return getAlignmentForColumn(matchingColumns && matchingColumns[0]);
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
                    {columns.map(c => (
                        <TableCell
                            variant="head"
                            component="div"
                            align={getAlignmentForColumn(c)}
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            style={{
                                top: rowHeight
                            }}
                            key={c.field}
                            padding="none">
                            <div className={classes.tableCellHeadDiv}>{c.headerName}</div>
                        </TableCell>
                    ))}
                </div>
            </>
        );
    };

    return renderHeader();
};

const propsAreEqual = (prev, next) => {
    return _.isEqual(prev.columns, next.columns);
};

export const MemoizedDataTableHeader = memo(withStyles(styles)(DataTableHeader), propsAreEqual);

export default withStyles(styles)(DataTableHeader);
