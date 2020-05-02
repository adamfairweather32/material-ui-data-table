import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import clsx from 'clsx';
import { SELECTOR } from '../constants';

const styles = () => ({
    checkBox: {
        padding: '0',
        paddingLeft: '4px'
    },
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
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1
    }
});

const SELECTOR_COL_WIDTH_PX = 45;

export class DataTableHeader extends Component {
    shouldComponentUpdate(nextProps) {
        const { columns = [], order, orderBy, checked, indeterminate } = this.props;
        const {
            columns: nextColumns = [],
            order: nextOrder,
            orderBy: nextOrderBy,
            checked: nextChecked,
            indeterminate: nextIndeterminate
        } = nextProps;
        return (
            order !== nextOrder ||
            orderBy !== nextOrderBy ||
            checked !== nextChecked ||
            indeterminate !== nextIndeterminate ||
            !_.isEqual(
                columns.map(c => c.field),
                nextColumns.map(c => c.field)
            )
        );
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

    handleCellContextMenu = event => {
        event.preventDefault();
        const { onContextTableHeader } = this.props;
        onContextTableHeader({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4
        });
    };

    handleSortClick = property => event => {
        const { onRequestSort } = this.props;
        if (onRequestSort) {
            onRequestSort(event, property);
        }
    };

    handleSelectAllClick = () => {
        const { onSelectAll } = this.props;
        onSelectAll();
    };

    renderHeaderContent = (headerName, field) => {
        const { classes, indeterminate, checked } = this.props;
        const isSelector = field === SELECTOR;
        if (isSelector) {
            return (
                <div className={classes.tableCellHeadDiv}>
                    <Checkbox
                        className={classes.checkBox}
                        indeterminate={indeterminate}
                        checked={checked}
                        onChange={this.handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all' }}
                    />
                </div>
            );
        }
        return <div className={classes.tableCellHeadDiv}>{headerName || field}</div>;
    };

    renderHeaderCell = column => {
        const { classes, rowHeight, order, orderBy, onRequestSort } = this.props;
        const { field, headerName, rich: { sortable } = {} } = column;
        const canSort = sortable && !!onRequestSort;
        return (
            <TableCell
                onContextMenu={this.handleCellContextMenu}
                variant="head"
                component="div"
                align={this.getAlignmentForColumn(column)}
                className={clsx(classes.tableCell, classes.tableCellHead)}
                style={{
                    top: rowHeight
                }}
                key={field}
                sortDirection={orderBy === field ? order : false}
                padding="none">
                {canSort ? (
                    <TableSortLabel active={orderBy === field} direction={order} onClick={this.handleSortClick(field)}>
                        <div className={classes.tableCellHeadDiv}>{headerName || field}</div>
                        {orderBy === field ? (
                            <span className={classes.visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </span>
                        ) : null}
                    </TableSortLabel>
                ) : (
                    this.renderHeaderContent(headerName, field)
                )}
            </TableCell>
        );
    };

    renderParentHeader = () => {
        const { columns, classes, rowHeight } = this.props;

        const calcColumns = columns.map((c, i) => ({
            ...c,
            showField: c.field !== SELECTOR ? this.shouldShowField(c.parentHeaderName, i, columns) : false,
            align: c.field !== SELECTOR ? this.getAlignment(c.parentHeaderName, columns) : undefined
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
                            onContextMenu={this.handleCellContextMenu}
                            component="div"
                            align={align}
                            variant="head"
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            key={field}
                            padding="none"
                            style={{ width: field === SELECTOR ? `${SELECTOR_COL_WIDTH_PX}px` : 'auto' }}>
                            {showField && <div className={classes.tableCellHeadDiv}>{parentHeaderName}</div>}
                        </TableCell>
                    ))}
                </div>
            </>
        );
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
                    {columns.map(this.renderHeaderCell)}
                </div>
            </>
        );
    }
}

export default withStyles(styles)(DataTableHeader);
