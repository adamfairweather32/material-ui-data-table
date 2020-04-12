import _ from 'lodash';
import getValidatedRows from './validation';

describe('getValidatedRows', () => {
    it('should return original rows when no rules defined', () => {
        const rows = ['foo'];
        expect(getValidatedRows(rows)).toEqual(rows);
        expect(getValidatedRows(rows, null)).toEqual(rows);
        expect(getValidatedRows(rows, undefined)).toEqual(rows);
        expect(getValidatedRows(rows, [])).toEqual(rows);
    });

    it('should throw error when more than one warning rule defined for same field', () => {
        const rows = ['foo'];
        const rules = [
            {
                field: 'foo',
                level: 'warn'
            },
            {
                field: 'foo',
                level: 'warn'
            },
            {
                field: 'bar',
                level: 'error'
            },
            {
                field: 'bar',
                level: 'warn'
            }
        ];
        expect(() => getValidatedRows(rows, rules)).toThrow('Duplicate warning rules detected');
    });

    it('should throw error when more than one error rule defined for same field', () => {
        const rows = ['foo'];
        const rules = [
            {
                field: 'foo',
                level: 'error'
            },
            {
                field: 'foo',
                level: 'error'
            },
            {
                field: 'bar',
                level: 'error'
            },
            {
                field: 'bar',
                level: 'warn'
            }
        ];
        expect(() => getValidatedRows(rows, rules)).toThrow('Duplicate error rules detected');
    });

    it('should report no rule violations when all rules are valid', () => {
        const rows = [
            {
                foo: 10,
                bar: 10
            }
        ];
        const rules = [
            {
                field: 'foo',
                getMessage: value => {
                    return value > 10 ? 'Value cannot be greater than 10' : null;
                },
                level: 'warn'
            },
            {
                field: 'bar',
                getMessage: value => {
                    return value < 10 ? 'Value cannot be smaller than 10' : null;
                },
                level: 'error'
            }
        ];
        expect(getValidatedRows(rows, rules)).toEqual(
            rows.map(r => ({
                ...r,
                validations: {
                    errors: {},
                    warnings: {}
                }
            }))
        );
    });

    it('should report rule violations when at least one rule is invalid', () => {
        const rows = [
            {
                foo: 11,
                bar: 10
            }
        ];
        const rules = [
            {
                field: 'foo',
                getMessage: value => {
                    return value > 10 ? 'Value cannot be greater than 10' : null;
                },
                level: 'warn'
            },
            {
                field: 'bar',
                getMessage: value => {
                    return value < 10 ? 'Value cannot be smaller than 10' : null;
                },
                level: 'error'
            }
        ];
        expect(getValidatedRows(rows, rules)).toEqual([
            {
                bar: 10,
                foo: 11,
                validations: {
                    errors: {},
                    warnings: {
                        foo: { field: 'foo', message: 'Value cannot be greater than 10' }
                    }
                }
            }
        ]);
    });

    it('should ignore non existent fields in rules object', () => {
        const rows = [
            {
                foo: 11,
                bar: 10,
                coo: 11
            }
        ];
        const rules = [
            {
                field: 'foo',
                getMessage: value => {
                    return value > 10 ? 'Value cannot be greater than 10' : null;
                },
                level: 'warn'
            },
            {
                field: 'bar',
                getMessage: value => {
                    return value < 10 ? 'Value cannot be smaller than 10' : null;
                },
                level: 'error'
            }
        ];
        expect(getValidatedRows(rows, rules)).toEqual([
            {
                bar: 10,
                foo: 11,
                coo: 11,
                validations: {
                    errors: {},
                    warnings: {
                        foo: { field: 'foo', message: 'Value cannot be greater than 10' }
                    }
                }
            }
        ]);
    });

    it('should be able to get context when running rules', () => {
        const rows = [
            {
                foo: 11,
                bar: 10
            },
            {
                foo: 10,
                bar: 10
            }
        ];
        const rules = [
            {
                field: 'foo',
                getMessage: (value, rows) => {
                    return _.sum(rows.map(r => r.foo)) > 20 ? 'Total foo should not be greater than 20' : null;
                },
                level: 'warn'
            },
            {
                field: 'bar',
                getMessage: value => {
                    return value < 10 ? 'Value cannot be smaller than 10' : null;
                },
                level: 'error'
            }
        ];
        expect(getValidatedRows(rows, rules)).toEqual([
            {
                foo: 11,
                bar: 10,
                validations: {
                    errors: {},
                    warnings: {
                        foo: {
                            field: 'foo',
                            message: 'Total foo should not be greater than 20'
                        }
                    }
                }
            },
            {
                foo: 10,
                bar: 10,
                validations: {
                    errors: {},
                    warnings: {
                        foo: {
                            field: 'foo',
                            message: 'Total foo should not be greater than 20'
                        }
                    }
                }
            }
        ]);
    });
});
