import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
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

export class DataTableHeader extends Component {
    shouldComponentUpdate(nextProps) {
        const { columns } = this.props;
        const { columns: nextColumns } = nextProps;
        return _.isEqual(columns, nextColumns);
    }

    getAlignmentForColumn = column => {
        const { rich: { numeric = false } = {} } = column || { rich: {} };

        return numeric ? 'right' : 'left';
    };

    getAlignment = (parentHeader, allColumns) => {
        const matchingColumns = allColumns.filter(c => c.parentHeaderName && c.parentHeaderName === parentHeader);
        if (matchingColumns.length > 1) {
            return 'left';
        }
        return this.getAlignmentForColumn(matchingColumns && matchingColumns[0]);
    };

    shouldShowField = (parentHeader, index, allColumns) => {
        // get start position of parent header
        const startIndex = _.indexOf(
            allColumns.map(c => c.parentHeaderName),
            parentHeader
        );
        return index === startIndex;
    };

    renderParentHeader = () => {
        const { columns, classes, rowHeight } = this.props;

        const calcColumns = columns.map((c, i) => ({
            ...c,
            showField: this.shouldShowField(c.parentHeaderName, i, columns),
            align: this.getAlignment(c.parentHeaderName, columns)
        }));

        return (
            <>
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {calcColumns.map(({ field, parentHeaderName, align, showField = true }, index) => (
                        <TableCell
                            onContextMenu={this.handleCellContextMenu}
                            component="div"
                            align={align}
                            variant="head"
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            key={field}
                            padding="none"
                            style={{
                                width: index === 0 ? '20px' : undefined
                            }}>
                            {showField && <div className={classes.tableCellHeadDiv}>{parentHeaderName}</div>}
                        </TableCell>
                    ))}
                </div>
            </>
        );
    };

    handleCellContextMenu = event => {
        event.preventDefault();
        const { onContextTableHeader } = this.props;
        onContextTableHeader({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4
        });
    };

    render() {
        const { classes, columns, rowHeight } = this.props;
        const hasParentHeader = columns.filter(c => c.parentHeaderName).length > 0;
        return (
            <>
                {hasParentHeader && this.renderParentHeader()}
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {columns.map(c => (
                        <TableCell
                            onContextMenu={this.handleCellContextMenu}
                            variant="head"
                            component="div"
                            align={this.getAlignmentForColumn(c)}
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
    }
}

export default withStyles(styles)(DataTableHeader);
