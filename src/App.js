import React, { useState } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Button from '@material-ui/core/Button';
// eslint-disable-next-line
import DataTable from './DataTable/index';
import './styles.css';
import { getUpdatedRows } from './DataTable/helpers/helpers';
import { DATE_FORMAT } from './DataTable/constants';

const SAMPLE_SIZE_MULTIPLIER = 150;

const createData = (id, name, calories, fat, cost, protein, currency, effective) => {
    return {
        id,
        name,
        calories,
        fat,
        cost,
        protein,
        currency,
        currencyFree: currency,
        effective,
        effectiveClearable: effective
    };
};

const random = (max, min) => Math.round(Math.random() * (max - min) + min, 2);

const getRows = () => {
    return [
        createData(1, 'Frozen yoghurt', 159, 6.0, -24, random(1, 60), 'USD', '2019-12-31'),
        createData(2, 'Ice cream sandwich', 237, 9.0, 37, random(1, 60), 'USD', '2019-12-31'),
        createData(3, 'Eclair', 262, 16.0, 24, random(1, 60), 'USD', '2019-12-31'),
        createData(4, 'Cupcake', 305, 3.7, 67, random(1, 60), 'USD', '2019-12-31'),
        createData(5, 'Gingerbread', 356, 16.0, 49, random(1, 60), 'USD', '2019-12-31')
    ];
};

const options = [
    { label: 'United States Dollar', value: 'USD' },
    { label: 'Great British Pound', value: 'GBP' },
    { label: 'Australian Dollar', value: 'AUD' },
    { label: 'Canadian Dollar', value: 'CAD' },
    { label: 'Swiss Franc', value: 'CHF' }
];

const generateRows = (sampleSize = 1) => {
    const coreRows = [];
    let counter = 0;
    while (counter < sampleSize) {
        coreRows.push(...getRows());
        counter += 1;
    }
    return coreRows.map((r, i) => ({ ...r, id: i + 1 }));
};

const initialRows = generateRows(SAMPLE_SIZE_MULTIPLIER);

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(3),
        padding: '5px',
        overflowX: 'auto',
        marginBottom: theme.spacing(2)
    },
    table: {
        minWidth: 650
    }
});

const App = ({ classes }) => {
    const [rows, setRows] = useState(initialRows);

    // we can either provide rules to the data grid or we can provide
    // the rows with the validation rules already applied from Redux
    // and then just let the data grid render them
    const rules = [
        {
            field: 'cost',
            getMessage: value => (value > 60 ? 'This number cannot be greater than 60' : null),
            level: 'warn'
        },
        {
            field: 'cost',
            getMessage: value => (value < 0 ? 'Should be >= £0' : null),
            level: 'error'
        }
    ];

    const columns = [
        {
            field: 'id',
            hidden: true
        },
        {
            field: 'name',
            headerName: 'Name',
            parentHeaderName: 'General',
            rich: {
                sortable: true
            }
        },
        {
            field: 'calories',
            headerName: 'Calories (g)',
            parentHeaderName: 'Detail',
            rich: {
                numeric: true,
                editable: true,
                blink: true
            }
        },
        {
            field: 'fat',
            headerName: 'Fat (g)',
            parentHeaderName: 'Detail',
            rich: {
                numeric: true,
                editable: true
            },
            clearable: true
        },
        {
            field: 'cost',
            headerName: 'Cost (£)',
            parentHeaderName: 'Detail',
            total: { type: 'sum', desc: 'Summing only non-null values', predicate: r => !!r },
            rich: {
                numeric: true,
                currency: { warnNegative: true, showCurrencySymbol: true },
                editable: true
            }
        },
        {
            field: 'protein',
            headerName: 'Protein (g)',
            parentHeaderName: 'Detail',
            rich: {
                numeric: true,
                blink: true
            }
        },
        {
            field: 'currency',
            headerName: 'Currency',
            parentHeaderName: 'Other',
            rich: {
                autoComplete: {
                    options: _.sortBy(options, 'label')
                },
                sortable: true,
                editable: true,
                width: '200px'
            }
        },
        {
            field: 'currencyFree',
            headerName: 'Currency (Free)',
            parentHeaderName: 'Other',
            rich: {
                autoComplete: {
                    options: _.sortBy(options, 'label'),
                    free: true
                },
                sortable: true,
                editable: true,
                width: '200px'
            },
            clearable: true
        },
        {
            field: 'effective',
            headerName: 'Effective',
            parentHeaderName: 'Other',
            rich: {
                date: {
                    format: DATE_FORMAT
                },
                sortable: true,
                editable: true
            }
        },
        {
            field: 'effectiveClearable',
            headerName: 'Effective (Clearable)',
            parentHeaderName: 'Other',
            rich: {
                date: {
                    format: DATE_FORMAT
                },
                sortable: true,
                editable: true
            },
            clearable: true
        }
    ];

    // HIGH

    // TODO: use classes to identify table sub elements
    // TODO: don't seem to have currency formatting on currency cells
    // TODO: need more unit tests around grid navigation
    // TODO: implement other editors
    // TODO: implement cell warnings/errors/blinkers
    // TODO: mark is editing needs to be re-implemented for auto complete
    // TODO: inputRef.current.focus(); needs to be re-implemented in auto complete
    // TODO: if you shrink the table horizontally, text like ice cream sandwich pushes out the alignment
    // TODO: make editing stuff internal to components and then just publish change when it's committed

    // TODO: auto complete editor
    // need to refocus the editor on keydown
    // should always clear the text in the combo when typing
    // be good if we could have a

    // TODO: make table body so that it fits exactly the number of rows given
    // TODO: enable Ctrl Home/End to go to top left/bottom right of table
    // TODO: when we reach the end of the table then cycle to top of adjacent column to right
    // TODO: remove checkboxes and add row headers
    // TODO: should render 1 extra row bigger than visible table area

    // NICE-TO-HAVE
    // TODO: re-focus cell once date picker calendar is closed
    // TODO: column resize (https://github.com/gregnb/mui-datatables/blob/master/src/MUIDataTable.js)
    // TODO: add support for drag and drop rows/columns
    // TODO: add support for copy and paste so we can bulk copy stuff

    const handleEdit = (value, row, field) => {
        // eslint-disable-next-line
        console.log('Handle edit = ', value, row, field);
        setRows(prevRows => getUpdatedRows(value, row, field, prevRows));
    };

    const handleDelete = rowsToDelete => {
        // eslint-disable-next-line
        console.log('Handle delete = ', rowsToDelete);
    };

    const handleAdd = rowToAdd => {
        // eslint-disable-next-line
        console.log('Handle add = ', rowToAdd);
    };

    const handleClick = () => {
        // eslint-disable-next-line
        setRows(generateRows(SAMPLE_SIZE_MULTIPLIER));
    };

    // works ok with 20 but 30 screws up scroll so have to add 10
    // to table height (was originally 20 and 100)
    return (
        <div className="App">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Paper className={classes.paper} square>
                    <DataTable
                        rows={rows}
                        columns={columns}
                        rowHeight={30}
                        tableHeight={210}
                        rules={rules}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showFilter
                        showErrors
                    />
                </Paper>
                <div>
                    <Button variant="contained" color="primary" onClick={handleClick}>
                        Regenerate
                    </Button>
                </div>
            </MuiPickersUtilsProvider>
        </div>
    );
};

export default withStyles(styles)(App);
