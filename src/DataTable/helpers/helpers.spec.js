import {
    getDuplicates,
    validateColumns,
    isValidChar,
    getBlinkDirectionColour,
    isNumPad,
    isValidDate,
    translateKeyCodeToChar,
    getFormattedCurrencyValue,
    createCellId,
    filterRow,
    getColumnType,
    getUpdatedRows,
    getReadonlyDisplayValue,
    getPreparedColumns
} from './helpers';
import { NUMERIC_TYPE, CURRENCY_TYPE } from '../constants';

// TODO: add test for selector
describe('getPreparedColumns', () => {
    it('should filter out columns that are hidden', () => {
        const columns = [
            {
                field: 'foo',
                hidden: true
            },
            {
                field: 'bar'
            }
        ];
        expect(getPreparedColumns(columns, null, { validate: false })).to.deep.equal([{ field: 'bar', index: 0 }]);
    });
    it('should filter out columns that are included in visibility list and set to not visible', () => {
        const columns = [
            {
                field: 'foo'
            },
            {
                field: 'bar'
            }
        ];
        const visibilities = [{ field: 'foo', headerName: 'Foo Name', visible: false }];
        expect(getPreparedColumns(columns, visibilities, { validate: false })).to.deep.equal([
            { field: 'bar', index: 0 }
        ]);
    });
    it('should prepare basic column collection', () => {
        const columns = [
            {
                field: 'foo'
            },
            {
                field: 'bar'
            }
        ];
        expect(getPreparedColumns(columns, null, { validate: false })).to.deep.equal([
            { field: 'foo', index: 0 },
            { field: 'bar', index: 1 }
        ]);
    });
    it('should enrich auto complete columns with a map', () => {
        const columns = [
            {
                field: 'bar',
                rich: {
                    autoComplete: {
                        options: [
                            { label: 'Bar Label', value: 'bar' },
                            { label: 'Other Label', value: 'other' }
                        ]
                    }
                }
            }
        ];
        const prepared = getPreparedColumns(columns, null, { validate: false })[0];
        expect(prepared.rich.autoComplete.options.bar).to.deep.equal({
            label: 'Bar Label',
            value: 'bar'
        });
    });
});

describe('getReadonlyDisplayValue', () => {
    it('should throw if no column provided', () => {
        expect(() => getReadonlyDisplayValue('foo')).to.throw('column parameter not provided');
        expect(() => getReadonlyDisplayValue('foo', null)).to.throw('column parameter not provided');
        expect(() => getReadonlyDisplayValue('foo', undefined)).to.throw('column parameter not provided');
    });
    it('should return value if not autocomplete or date column', () => {
        expect(getReadonlyDisplayValue('foo', {})).to.equal('foo');
        expect(getReadonlyDisplayValue('foo', { rich: {} })).to.equal('foo');
        expect(getReadonlyDisplayValue('foo', { rich: { autoComplete: {} } })).to.equal('foo');
        expect(
            getReadonlyDisplayValue('foo', {
                rich: { autoComplete: { options: [] } }
            })
        ).to.equal('foo');
        expect(
            getReadonlyDisplayValue('foo', {
                rich: { date: {} }
            })
        ).to.equal('foo');
        expect(
            getReadonlyDisplayValue('foo', {
                rich: { date: { format: '' } }
            })
        ).to.equal('foo');
    });
    it('should return autocomplete label', () => {
        const column = {
            rich: {
                autoComplete: {
                    options: [
                        {
                            label: 'foo display value',
                            value: 'foo'
                        }
                    ]
                }
            }
        };
        const preparedColumns = getPreparedColumns([column], null, { validate: false });
        expect(getReadonlyDisplayValue('foo', preparedColumns[0])).to.equal('foo display value');
    });
    it('should return original value if no matching autocomplete option', () => {
        expect(
            getReadonlyDisplayValue('bar', {
                rich: {
                    autoComplete: {
                        options: [
                            {
                                label: 'foo display value',
                                value: 'foo'
                            }
                        ]
                    }
                }
            })
        ).to.equal('bar');
    });
    it('should return formatted date if format string provided', () => {
        expect(
            getReadonlyDisplayValue('12/10/2019', {
                rich: {
                    date: {
                        format: 'yyyy-MM-dd'
                    }
                }
            })
        ).to.equal('2019-12-10');
    });
    it('should return original value when not a date or date format string is invalid', () => {
        expect(
            getReadonlyDisplayValue('foobar', {
                rich: {
                    date: {
                        format: 'yyyy-MM-dd'
                    }
                }
            })
        ).to.equal('foobar');
        expect(
            getReadonlyDisplayValue('12/10/2019', {
                rich: {
                    date: {
                        format: 'foobar'
                    }
                }
            })
        ).to.equal('12/10/2019');
    });
});

describe('getUpdatedRows', () => {
    it('should return empty row set if no rows defined', () => {
        expect(getUpdatedRows('bar', { foo: 'fee' }, 'foo')).to.equal(undefined);
        expect(getUpdatedRows('bar', { foo: 'fee' }, 'foo', null)).to.equal(null);
        expect(getUpdatedRows('bar', { foo: 'fee' }, 'foo', [])).to.deep.equal([]);
    });
    // this should never happen because there are validators that stop us getting
    // this far. I don't want a check to ensure that every row has an id field
    // as it's unnecessary
    it('should throw if no id field available', () => {
        const originalRows = [{ foo: 'fee', doh: 'ray' }];
        const newRow = { foo: 'bar', doh: 'ray' };
        expect(() => getUpdatedRows('ray', newRow, 'foo', originalRows)).to.throw(
            'index of changed row could not be located in collection'
        );
    });
    it('should throw if id cannot be found in original row set', () => {
        const originalRows = [
            { id: 1, foo: 'fee' },
            { id: 2, foo: 'bar' }
        ];
        const newRow = { id: 3, foo: 'ray' };
        expect(() => getUpdatedRows('ray', newRow, 'foo', originalRows)).to.throw(
            'index of changed row could not be located in collection'
        );
    });
    it('should return updated row', () => {
        const originalRows = [{ id: 1, foo: 'fee', doh: 'ray' }];
        const newRow = { id: 1, foo: 'bar', doh: 'ray' };
        const updatedRows = [{ id: 1, foo: 'bar', doh: 'ray' }];
        expect(getUpdatedRows('bar', newRow, 'foo', originalRows)).to.deep.equal(updatedRows);
    });
    it('should return updated row using row comparator', () => {
        const originalRows = [{ someOtherId: 1, foo: 'fee', doh: 'ray' }];
        const newRow = { someOtherId: 1, foo: 'bar', doh: 'ray' };
        const updatedRows = [{ someOtherId: 1, foo: 'bar', doh: 'ray' }];
        expect(
            getUpdatedRows('bar', newRow, 'foo', originalRows, (r1, r2) => r1.someOtherId === r2.someOtherId)
        ).to.deep.equal(updatedRows);
    });
    it('should return updated rows', () => {
        const originalRows = [
            { id: 1, foo: 'fee', doh: 'ray' },
            { id: 2, foo: 'blee', doh: 'bloo' }
        ];
        const newRow = { id: 1, foo: 'bar', doh: 'ray' };
        const updatedRows = [
            { doh: 'ray', foo: 'bar', id: 1 },
            { doh: 'bloo', foo: 'blee', id: 2 }
        ];
        expect(getUpdatedRows('bar', newRow, 'foo', originalRows)).to.deep.equal(updatedRows);
    });
});

describe('getColumnType', () => {
    it('should get combo type', () => {
        expect(getColumnType({ rich: { autoComplete: { options: ['foo'] } } })).to.equal('combo');
    });
    it('should get date type', () => {
        expect(getColumnType({ rich: { date: {} } })).to.equal('date');
    });
    it('should default to text type', () => {
        expect(getColumnType({})).to.equal('text');
        expect(getColumnType({ foo: 'bar' })).to.equal('text');
        expect(getColumnType({ rich: {} })).to.equal('text');
        expect(getColumnType({ rich: { autoComplete: {} } })).to.equal('text');
        expect(getColumnType({ rich: { autoComplete: { options: [] } } })).to.equal('text');
    });
});

describe('getBlinkDirectionColour', () => {
    it('should provide correct blink colour or null', () => {
        expect(getBlinkDirectionColour(10, 9)).to.equal('blue');
        expect(getBlinkDirectionColour(10, 10)).to.equal(null);
        expect(getBlinkDirectionColour(9, 10)).to.equal('red');
        expect(getBlinkDirectionColour(9)).to.equal(null);
        expect(getBlinkDirectionColour()).to.equal(null);
        expect(getBlinkDirectionColour('foo', 'foo')).to.equal(null);
    });
});

describe('createCellId', () => {
    it('should create cell id', () => {
        expect(createCellId('footableid', 'foo', 'bar')).to.equal('footableid-field-foo-bar');
    });
});

describe('filterRow', () => {
    it('should find search string in row using wildcard match', () => {
        const row = { field1: 'football', field2: 'boots 123', field3: 4 };
        const columns = [{ field: 'field1' }, { field: 'field2' }, { field: 'field3' }];
        expect(filterRow(row, columns, 'foo')).to.equal(true);
        expect(filterRow(row, columns, 'ba')).to.equal(true);
        expect(filterRow(row, columns, 'all')).to.equal(true);
        expect(filterRow(row, columns, 'FOO')).to.equal(true);
        expect(filterRow(row, columns, 'BA')).to.equal(true);
        expect(filterRow(row, columns, 'ALL')).to.equal(true);
        expect(filterRow(row, columns, '1')).to.equal(true);
        expect(filterRow(row, columns, '3')).to.equal(true);
        expect(filterRow(row, columns, '2')).to.equal(true);
        expect(filterRow(row, columns, '123')).to.equal(true);
        expect(filterRow(row, columns, '4')).to.equal(true);
        expect(filterRow(row, columns, 4)).to.equal(true);
    });
    it('should not find search string in row', () => {
        const row = { field1: 'football', field2: 'boots' };
        const columns = [{ field: 'field1' }, { field: 'field2' }];
        expect(filterRow(row, columns, 'bar')).to.equal(false);
    });
    it('should return row if search text is blank', () => {
        const row = { field1: 'football', field2: 'boots' };
        const columns = [{ field: 'field1' }, { field: 'field2' }];
        expect(filterRow(row, columns, '')).to.equal(true);
        expect(filterRow(row, columns)).to.equal(true);
    });
    it('should be able to search lookup labels and not their values', () => {
        const row = { field1: 'bar', field2: 'boots' };
        const columns = [
            {
                field: 'field1',
                rich: {
                    autoComplete: {
                        options: [{ label: 'foo', value: 'bar' }]
                    }
                }
            },
            { field: 'field2' }
        ];
        expect(filterRow(row, columns, 'foo')).to.equal(true);
        expect(filterRow(row, columns, 'bar')).to.equal(false);
    });
});

describe('isNumPad', () => {
    it('should return true when number pad', () => {
        expect(isNumPad(96)).to.equal(true);
        expect(isNumPad(105)).to.equal(true);
    });
    it('should return false when not number pad', () => {
        expect(isNumPad(95)).to.equal(false);
        expect(isNumPad(106)).to.equal(false);
    });
});

describe('isValidDate', () => {
    it('should return true when in valid date', () => {
        expect(isValidDate('2019-10-12')).to.equal(true);
        expect(isValidDate('12/10/2019')).to.equal(true);
    });
    it('should return false when not valid date', () => {
        expect(isValidDate('foo')).to.equal(false);
    });
});

describe('translateKeyCodeToChar', () => {
    it('should translate key code character', () => {
        expect(translateKeyCodeToChar('96')).to.equal('0');
        expect(translateKeyCodeToChar(96)).to.equal('0');
        expect(translateKeyCodeToChar('95')).to.equal('_');
        expect(translateKeyCodeToChar('106')).to.equal('j');
        expect(translateKeyCodeToChar('189')).to.equal('½');
        expect(translateKeyCodeToChar('190')).to.equal('¾');
    });
});

describe('getFormattedCurrencyValue', () => {
    it('should format value to currency with thousands separators and without symbol', () => {
        expect(getFormattedCurrencyValue(10000)).to.equal('10,000');
    });
    it('should format value to currency with thousands separators and symbol', () => {
        expect(getFormattedCurrencyValue(10000, true)).to.equal('£10,000');
    });
    it('should format negative value with brackets ', () => {
        expect(getFormattedCurrencyValue(-10000, false)).to.equal('(10,000)');
        expect(getFormattedCurrencyValue(-10000, true)).to.equal('(£10,000)');
    });
    it('should format decimal numbers to N decimal places ', () => {
        expect(getFormattedCurrencyValue(1.2356, true)).to.equal('£1.24');
        expect(getFormattedCurrencyValue(1.2356, false)).to.equal('1.24');
        expect(getFormattedCurrencyValue(-1.2356, true)).to.equal('(£1.24)');
        expect(getFormattedCurrencyValue(-1.2356, false)).to.equal('(1.24)');
        expect(getFormattedCurrencyValue(10000.2356, true)).to.equal('£10,000.24');
        expect(getFormattedCurrencyValue(10000.2356, false)).to.equal('10,000.24');
        expect(getFormattedCurrencyValue(-10000.2356, true)).to.equal('(£10,000.24)');
        expect(getFormattedCurrencyValue(-10000.2356, false)).to.equal('(10,000.24)');
    });
});

describe('isValidChar', () => {
    it('should return true when valid alpha numeric character', () => {
        expect(isValidChar('a')).to.equal(true);
        expect(isValidChar('A')).to.equal(true);
        expect(isValidChar(1)).to.equal(true);
        expect(isValidChar('1')).to.equal(true);
    });

    it('should return false when not a valid alpha numeric character', () => {
        expect(isValidChar('.')).to.equal(false);
    });

    it('should accept - and . when numeric only', () => {
        expect(isValidChar('.', NUMERIC_TYPE)).to.equal(true);
        expect(isValidChar('-', NUMERIC_TYPE)).to.equal(true);
        expect(isValidChar('.', CURRENCY_TYPE)).to.equal(true);
        expect(isValidChar('-', CURRENCY_TYPE)).to.equal(true);
    });
});

describe('validateColumns', () => {
    it('should not throw when columns are valid', () => {
        expect(() =>
            validateColumns([
                {
                    field: 'id'
                },
                {
                    field: 'foo'
                },
                {
                    field: 'bar'
                }
            ])
        ).not.to.throw();
    });
    it('should throw when no columns specified', () => {
        expect(() => validateColumns()).to.throw('No columns provided!');
        expect(() => validateColumns([])).to.throw('No columns provided!');
    });
    it("should throw when columns don't contain field property", () => {
        expect(() =>
            validateColumns([
                {
                    foo: 'foo'
                },
                {
                    bar: 'foo'
                }
            ])
        ).to.throw('columns must all include a field property');
        expect(() =>
            validateColumns([
                {
                    field: 'foo'
                },
                {
                    bar: 'foo'
                }
            ])
        ).to.throw('columns must all include a field property');
    });
    it('should throw when no id field specified', () => {
        expect(() =>
            validateColumns([
                {
                    field: 'foo'
                },
                {
                    field: 'bar'
                }
            ])
        ).to.throw('columns must include an id field');
    });
    it('should throw when trying to use reserved fields', () => {
        expect(() =>
            validateColumns(
                [
                    {
                        field: 'id'
                    },
                    {
                        field: 'foo'
                    },
                    {
                        field: 'bar'
                    }
                ],
                ['foo']
            )
        ).to.throw('The following columns are reserved: foo');
    });
    it('should throw when duplicate columns are found', () => {
        expect(() =>
            validateColumns([
                {
                    field: 'id'
                },
                {
                    field: 'foo'
                },
                {
                    field: 'foo'
                }
            ])
        ).to.throw('The following columns appear more than once: foo');
    });
    it('should throw when parent header name is provided but not on all fields', () => {
        expect(() =>
            validateColumns([
                {
                    field: 'id',
                    hidden: true
                },
                {
                    field: 'foo',
                    parentHeaderName: 'General'
                },
                {
                    field: 'bar'
                }
            ])
        ).to.throw('parentHeaderName field must be set on ALL columns if it is provided');
    });
    it('should not throw when parent header name is not provided on a hidden column', () => {
        expect(() =>
            validateColumns([
                {
                    field: 'id',
                    hidden: true
                },
                {
                    field: 'foo',
                    parentHeaderName: 'General'
                },
                {
                    field: 'bar',
                    parentHeaderName: 'General'
                }
            ])
        ).not.to.throw();
    });
});

describe('getDuplicates', () => {
    it('should not return duplicates', () => {
        expect(
            getDuplicates(
                [
                    {
                        field: 'foo'
                    },
                    {
                        field: 'bar'
                    }
                ],
                f => f.field
            )
        ).to.deep.equal([]);
    });
    it('should return duplicates', () => {
        expect(
            getDuplicates(
                [
                    {
                        field: 'foo'
                    },
                    {
                        field: 'bar'
                    },
                    {
                        field: 'foo'
                    }
                ],
                f => f.field
            )
        ).to.deep.equal(['foo']);
    });
    it('should return duplicates with default key selector if none provided', () => {
        expect(getDuplicates(['foo', 'bar', 'foo'])).to.deep.equal(['foo']);
    });
});
