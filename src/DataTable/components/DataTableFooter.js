import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';
import { Badge } from '@material-ui/core';
import { DEFAULT_AGG_TYPE } from '../constants';
import { getFormattedCurrencyValue } from '../helpers/helpers';

const styles = () => ({
    tableCell: {
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
    },
    tableCellFoot: {
        fontSize: '1rem',
        fontWeight: 'bold',
        verticalAlign: 'bottom',
        position: 'sticky',
        paddingLeft: '5px',
        zIndex: 4,
        backgroundColor: '#fcfcfc',
        color: 'black',
        bottom: 0,
        paddingRight: '5px',
        '&:last-child': {
            paddingRight: '5px'
        }
    },
    tableCellDiv: {
        paddingLeft: '5px'
    },
    tableRow: {
        display: 'table-row'
    }
});

export class DataTableFooter extends Component {
    shouldComponentUpdate(nextProps) {
        const { columns } = this.props;
        const { columns: nextColumns } = nextProps;
        return _.isEqual(columns, nextColumns);
    }

    formatTotal = (total, options) => {
        if (_.isEmpty(options)) {
            return total;
        }
        const { currency } = options;
        if (currency) {
            const { showCurrencySymbol } = currency;
            return getFormattedCurrencyValue(total, showCurrencySymbol);
        }
        return total;
    };

    parseValue = value => {
        if (!Number.isNaN(value)) {
            return parseFloat(value);
        }
        return NaN;
    };

    getTotal = column => {
        const { rows } = this.props;

        const {
            field,
            rich,
            total: { type = DEFAULT_AGG_TYPE, predicate = null }
        } = column;

        const filter = predicate || (() => true);

        switch (type) {
            default: {
                return {
                    total: this.formatTotal(_.sum(rows.filter(filter).map(row => this.parseValue(row[field]))), {
                        ...rich
                    }),
                    filtered: !!predicate
                };
            }
        }
    };

    renderTotal = column => {
        const { classes } = this.props;

        if (!column.total) {
            return (
                <TableCell
                    component="div"
                    variant="footer"
                    className={clsx(classes.tableCell, classes.tableCellFoot)}
                    key={column.field}
                    padding="none"
                />
            );
        }
        const { warnNegative } = column;

        const { total, filtered } = this.getTotal(column);

        const cellStyle = {
            color: total && total.includes('(') && warnNegative ? 'red' : 'inherit'
        };

        const title = filtered ? `Filter applied` : undefined;

        const displayTotal = `Total = ${total}`;

        return (
            <TableCell
                component="div"
                variant="footer"
                align="right"
                style={cellStyle}
                className={clsx(classes.tableCell, classes.tableCellFoot)}
                key={column.field}
                padding="none">
                {filtered && (
                    <Badge color="primary" title={title} variant="dot">
                        {displayTotal}
                    </Badge>
                )}
                {!filtered && displayTotal}
            </TableCell>
        );
    };

    render() {
        const { columns, classes, rowHeight } = this.props;

        if (!columns.filter(c => c.total).length) {
            return null;
        }
        return (
            <div
                className={classes.tableRow}
                style={{
                    height: rowHeight,
                    lineHeight: `${rowHeight}px`
                }}>
                {columns.map(c => this.renderTotal(c))}
            </div>
        );
    }
}

export default withStyles(styles)(DataTableFooter);
