import React from 'react';
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
        width: '6rem'
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

const DataTableFooter = ({ classes, rows, columns, rowHeight }) => {
    if (!columns.filter(c => c.total).length) {
        return null;
    }

    const formatTotal = (total, options) => {
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

    const parseValue = value => {
        if (!Number.isNaN(value)) {
            return parseFloat(value);
        }
        return NaN;
    };

    const getTotal = column => {
        const {
            field,
            rich,
            total: { type = DEFAULT_AGG_TYPE, predicate = null }
        } = column;

        const filter = predicate || (() => true);
        switch (type) {
            default: {
                return {
                    total: formatTotal(_.sum(rows.filter(filter).map(row => parseValue(row[field]))), { ...rich }),
                    filtered: !!predicate
                };
            }
        }
    };

    const renderTotal = column => {
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

        const { total, filtered } = getTotal(column);
        const cellStyle = {
            color: total && total.includes('(') && warnNegative ? 'red' : 'inherit',
            textOverflow: 'ellipsis'
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

    return (
        <div
            className={classes.tableRow}
            style={{
                height: rowHeight,
                lineHeight: `${rowHeight}px`
            }}>
            {columns.map(c => renderTotal(c))}
        </div>
    );
};

export default withStyles(styles)(DataTableFooter);
