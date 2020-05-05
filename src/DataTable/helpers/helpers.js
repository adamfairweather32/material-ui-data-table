import _ from 'lodash';
import { format } from 'date-fns';
import {
    ID_FIELD_PREFIX,
    COMBO_TYPE,
    TEXT_TYPE,
    DATE_TYPE,
    DATA_EDITING_PREFIX,
    DECIMAL_PLACES,
    REGEX_MAP,
    ALPHA_NUMERIC_TYPE,
    CURRENCY_TYPE,
    BLINK_DIRECTION_POSITIVE,
    BLINK_DIRECTION_NEGATIVE,
    NUMERIC_TYPE,
    RESERVED_COLUMNS,
    SELECTOR
} from '../constants';

const enrich = column => {
    if (column.rich && column.rich.autoComplete && column.rich.autoComplete.options) {
        column.rich.autoComplete.options.forEach(op => {
            // eslint-disable-next-line
      column.rich.autoComplete.options[op.value] = op;
        });
    }
    return column;
};

export const getDuplicates = (items, keySelector) => {
    const func = i => i;
    return _.keys(_.pickBy(_.groupBy(items, keySelector || func), x => x.length > 1));
};

export const validateColumns = (columns, reservedColumns = []) => {
    if (!columns || !columns.length) {
        throw Error(`No columns provided!`);
    }
    const fields = columns.map(c => c.field);

    if (!fields || _.some(fields, f => !f)) {
        throw new Error('columns must all include a field property');
    }

    if (!fields.includes('id')) {
        throw new Error('columns must include an id field');
    }
    const inUseColumns = _.intersection(reservedColumns, fields);
    if (inUseColumns.length) {
        throw new Error(`The following columns are reserved: ${inUseColumns}`);
    }
    const dupes = getDuplicates(fields);

    if (dupes.length > 0) {
        throw new Error(`The following columns appear more than once: ${dupes}`);
    }

    const visibleColumns = columns.filter(c => !c.hidden);
    if (visibleColumns.length) {
        // if parent header is set then all must be set
        const withParentHeaderCount = visibleColumns.filter(c => c.parentHeaderName).length;
        if (withParentHeaderCount && withParentHeaderCount !== visibleColumns.length) {
            throw new Error(`parentHeaderName field must be set on ALL columns if it is provided`);
        }
    }
};

export const getPreparedColumns = (columns, visibilities = [], { editable = false, validate = true }) => {
    if (validate) {
        validateColumns(columns, RESERVED_COLUMNS);
    }
    const hiddenColumns = (visibilities || []).filter(c => !c.visible).map(c => c.field);
    const addSelector = editable && !columns.map(c => c.field).includes(SELECTOR);

    return [addSelector ? { field: SELECTOR } : null, ...columns]
        .filter(c => c && !c.hidden && !hiddenColumns.includes(c.field))
        .map((column, index) => {
            return { ...enrich(column), index };
        });
};

export const getReadonlyDisplayValue = (value, column) => {
    if (!column) {
        throw Error('column parameter not provided');
    }
    const { rich: { date } = {} } = column || { rich: {} };
    const { rich: { autoComplete } = {} } = column || { rich: {} };
    if (value) {
        if (date && date.format) {
            try {
                return format(new Date(value), date.format);
            } catch (err) {
                // eslint-disable-next-line
                console.error(`could not format value: ${value} with format string: ${date.format}`);
                return value;
            }
        }
        if (autoComplete && autoComplete.options && autoComplete.options.length) {
            const option = autoComplete.options[value];
            return (option && option.label) || value;
        }
    }
    return value;
};

export const isValidChar = (char, type = ALPHA_NUMERIC_TYPE) => {
    const validTypes = [CURRENCY_TYPE, NUMERIC_TYPE];
    // TODO: be good to get this working in regex
    if (validTypes.includes(type) && (char === '-' || char === '.')) {
        return true;
    }
    return REGEX_MAP[type].test(char);
};

export const getBlinkDirectionColour = (value, previousValue) => {
    if (!value || !previousValue || typeof value !== 'number' || typeof previousValue !== 'number') {
        return null;
    }
    const adjustedValue = Math.round(value, DECIMAL_PLACES);
    const adjustedPreviousValue = Math.round(previousValue, DECIMAL_PLACES);
    if (adjustedValue === adjustedPreviousValue) {
        return null;
    }
    if (adjustedValue > adjustedPreviousValue) {
        return BLINK_DIRECTION_POSITIVE;
    }
    return BLINK_DIRECTION_NEGATIVE;
};

export const isNumPad = keyCode => keyCode >= 96 && keyCode <= 105;

export const isValidDate = date => new Date(date).toString() !== 'Invalid Date';

export const translateKeyCodeToChar = keyCode => {
    const mappedKeyCode = isNumPad(keyCode) ? keyCode - 48 : keyCode;
    let char;
    if (mappedKeyCode === 189) {
        char = '-';
    } else if (mappedKeyCode === 190) {
        char = '.';
    } else {
        char = String.fromCharCode(mappedKeyCode);
    }
    return char;
};

const formatWithSeparator = num => {
    let formatted = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    const trailingZero = '.00';
    if (formatted && formatted.endsWith(trailingZero)) {
        formatted = formatted.substring(0, formatted.length - trailingZero.length);
    }
    return formatted;
};

export const getFormattedCurrencyValue = (value, showCurrencySymbol = false) => {
    const currencyValue = parseFloat(value);
    if (currencyValue || currencyValue === 0) {
        const rounded = currencyValue.toFixed(DECIMAL_PLACES);
        const isNegative = rounded < 0;
        const absolute = Math.abs(rounded).toString();
        if (isNegative) {
            return `(${showCurrencySymbol ? '£' : ''}${formatWithSeparator(absolute)})`;
        }
        return `${showCurrencySymbol ? '£' : ''}${formatWithSeparator(absolute)}`;
    }
    return value;
};

export const setCaretPosition = (element, position) => {
    if (element.setSelectionRange && position >= 0) {
        element.focus();
        element.setSelectionRange(position, position);
    }
};

const extractValue = (field, row, columns) => {
    if (field && columns) {
        const column = columns.find(c => c.field === field) || {};
        const { rich: { autoComplete } = {} } = column;
        if (autoComplete && autoComplete.options) {
            const option = autoComplete.options.find(o => o.value === row[field]);
            if (!option) {
                throw new Error(`option with value = ${row[field]} could not be found`);
            }
            return option.label;
        }
        return row[field];
    }
    return null;
};

export const filterRow = (row, columns, searchText) => {
    if (!searchText) {
        return true;
    }
    return _.some(Object.keys(row), k => {
        const value = extractValue(k, row, columns);
        return (
            value &&
            value
                .toString()
                .toLowerCase()
                .match(searchText.toString().toLowerCase())
        );
    });
};

export const createCellId = (tableId, rowIdentifier, columnIdentifier) => {
    if (!tableId) {
        throw Error('tableId must be provided');
    }
    if (tableId.includes('-')) {
        throw Error("tableId cannot contain '-'");
    }
    return `${tableId}-${ID_FIELD_PREFIX}-${rowIdentifier}-${columnIdentifier}`;
};

export const getColumnType = column => {
    const { rich } = column;
    if (rich) {
        if (rich.autoComplete && rich.autoComplete.options && rich.autoComplete.options.length) {
            return COMBO_TYPE;
        }
        if (rich.date) {
            return DATE_TYPE;
        }
    }
    return TEXT_TYPE;
};

export const markCellIsEditing = id => {
    const element = document.getElementById(id);
    if (element) {
        element.setAttribute(`${DATA_EDITING_PREFIX}-${id}`, true);
    }
};

export const removeCellIsEditing = id => {
    const element = document.getElementById(id);
    if (element) {
        element.removeAttribute(`${DATA_EDITING_PREFIX}-${id}`);
    }
};

export const cellIsEditing = id => {
    const element = document.getElementById(id);
    // TODO: use a class to suggest presence of editing
    const editing = element && element.getAttribute(`${DATA_EDITING_PREFIX}-${id}`);
    return editing;
};

export const getUpdatedRows = (value, row, key, rows, rowComparator = (r1, r2) => r1.id && r1.id === r2.id) => {
    if (!rows || !rows.length) {
        return rows;
    }
    const index = _.findIndex(rows, r => rowComparator(r, row));
    if (index >= 0) {
        const updatedRows = _.clone(rows);
        const updatedRow = { ...updatedRows[index], [key]: value };
        updatedRows[index] = updatedRow;
        return updatedRows;
    }
    throw Error(
        'index of changed row could not be located in collection. Is id field defined and does the original id still exist?'
    );
};

export const focus = (id, withBlur = false) => {
    if (id) {
        const element = document.getElementById(id);
        if (element) {
            if (withBlur) {
                element.blur();
            }
            element.focus();
        }
    } else {
        // eslint-disable-next-line
    console.error(`Reference with id: ${id} does not exist`);
    }
};

const clearBlinkersByClassName = className => {
    const elements = document.getElementsByClassName(className);
    if (elements) {
        [...elements].forEach(el => {
            el.classList.remove(className);
        });
    }
};

export const clearBlinkers = () => {
    clearBlinkersByClassName(`blink-${BLINK_DIRECTION_POSITIVE}`);
    clearBlinkersByClassName(`blink-${BLINK_DIRECTION_NEGATIVE}`);
};

export const removeTextSelection = () => {
    // remove any text selection when we cancel an edit
    const sel = window.getSelection();
    if (sel) {
        sel.removeAllRanges();
    }
};
