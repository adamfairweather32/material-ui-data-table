import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { moveHorizontal, moveVertical, getGridNavigationMap, isEditable, getColumn } from './gridNavigation';
import * as helpersModule from './helpers';
import { ID_FIELD_PREFIX } from '../constants';

chai.should();
chai.use(sinonChai);

describe('getGridNavigationMap', () => {
    it('should build expected navigation map', () => {
        const rows = [
            {
                id: 1,
                firstName: 'Bob',
                lastName: 'Jones',
                occupation: 'CARP',
                dateQualified: '2019-10-01'
            },
            {
                id: 2,
                firstName: 'Fred',
                lastName: 'Grimble',
                occupation: 'ELEC',
                dateQualified: '2019-10-11'
            }
        ];
        const columns = [
            {
                field: 'firstName'
            },
            {
                field: 'lastName'
            },
            {
                field: 'occupation',
                rich: {
                    autoComplete: {
                        options: [
                            { label: 'Electrician', value: 'ELEC' },
                            { label: 'Carpenter', value: 'CARP' }
                        ]
                    }
                }
            },
            {
                field: 'dateQualified',
                rich: { date: {} }
            }
        ];
        expect(getGridNavigationMap('footableid', rows, columns)).to.deep.equal({
            idToPositionMap: {
                '1': {
                    dateQualified: { columnIndex: 3, rowIndex: 0, type: 'date' },
                    firstName: { columnIndex: 0, rowIndex: 0, type: 'text' },
                    lastName: { columnIndex: 1, rowIndex: 0, type: 'text' },
                    occupation: { columnIndex: 2, rowIndex: 0, type: 'combo' },
                    visible: false,
                    rowIndex: 0
                },
                '2': {
                    dateQualified: { columnIndex: 3, rowIndex: 1, type: 'date' },
                    firstName: { columnIndex: 0, rowIndex: 1, type: 'text' },
                    lastName: { columnIndex: 1, rowIndex: 1, type: 'text' },
                    occupation: { columnIndex: 2, rowIndex: 1, type: 'combo' },
                    visible: false,
                    rowIndex: 1
                }
            },
            positionToIdMap: {
                '0': {
                    '0': 'footableid-field-1-firstName',
                    '1': 'footableid-field-1-lastName',
                    '2': 'footableid-field-1-occupation',
                    '3': 'footableid-field-1-dateQualified'
                },
                '1': {
                    '0': 'footableid-field-2-firstName',
                    '1': 'footableid-field-2-lastName',
                    '2': 'footableid-field-2-occupation',
                    '3': 'footableid-field-2-dateQualified'
                }
            }
        });
    });

    it('should only use columns specified as part of column list when building map', () => {
        const rows = [
            {
                id: 1,
                firstName: 'Bob',
                lastName: 'Jones',
                occupation: 'CARP',
                dateQualified: '2019-10-01'
            },
            {
                id: 2,
                firstName: 'Fred',
                lastName: 'Grimble',
                occupation: 'ELEC',
                dateQualified: '2019-10-11'
            }
        ];
        const columns = [
            {
                field: 'firstName'
            },
            {
                field: 'lastName'
            }
        ];
        expect(getGridNavigationMap('footableid', rows, columns)).to.deep.equal({
            idToPositionMap: {
                '1': {
                    firstName: { columnIndex: 0, rowIndex: 0, type: 'text' },
                    lastName: { columnIndex: 1, rowIndex: 0, type: 'text' },
                    visible: false,
                    rowIndex: 0
                },
                '2': {
                    firstName: { columnIndex: 0, rowIndex: 1, type: 'text' },
                    lastName: { columnIndex: 1, rowIndex: 1, type: 'text' },
                    visible: false,
                    rowIndex: 1
                }
            },
            positionToIdMap: {
                '0': {
                    '0': 'footableid-field-1-firstName',
                    '1': 'footableid-field-1-lastName'
                },
                '1': {
                    '0': 'footableid-field-2-firstName',
                    '1': 'footableid-field-2-lastName'
                }
            }
        });
    });
    it('should reject when no id field provided to build map with', () => {
        const columns = [{ field: 'id' }];
        expect(() => getGridNavigationMap('footableid', [{ foo: 'bar' }, { bar: 'foo' }], columns)).to.throw(
            'One or more rows are missing an id property'
        );
        expect(() =>
            getGridNavigationMap(
                'footableid',
                [
                    { id: null, foo: 'bar' },
                    { id: null, bar: 'foo' }
                ],
                columns
            )
        ).to.throw('One or more rows are missing an id property');
        expect(() =>
            getGridNavigationMap(
                'footableid',
                [
                    { id: undefined, foo: 'bar' },
                    { id: undefined, bar: 'foo' }
                ],
                columns
            )
        ).to.throw('One or more rows are missing an id property');
        expect(() =>
            getGridNavigationMap(
                'footableid',
                [
                    { id: 1, foo: 'bar' },
                    { id: null, bar: 'foo' }
                ],
                columns
            )
        ).to.throw('One or more rows are missing an id property');
    });
    it('should reject duplicate ids when building map', () => {
        const rows = [
            { id: 1, foo: 'bar' },
            { id: 1, bar: 'foo' }
        ];
        const columns = [{ field: 'id' }];
        expect(() => getGridNavigationMap('footableid', rows, columns)).to.throw(
            'Duplicate ids found in row collection'
        );
    });
    it('should throw when no columns provided', () => {
        expect(() => getGridNavigationMap()).to.throw('No tableId provided');
        expect(() => getGridNavigationMap('footableid', [])).to.throw('No columns provided');
        expect(() => getGridNavigationMap('footableid', [], null)).to.throw('No columns provided');
        expect(() => getGridNavigationMap('footableid', [], undefined)).to.throw('No columns provided');
        expect(() => getGridNavigationMap('footableid', [], [])).to.throw('No columns provided');
    });
    it('should return empty map when no rows provided', () => {
        const rows = [];
        const columns = [{ field: 'firstName' }, { field: 'lastName' }];
        expect(getGridNavigationMap('footableid', rows, columns)).to.deep.equal({});
    });
});

describe('moveHorizontal and moveVertical', () => {
    it('should throw when invalid direction provided', () => {
        expect(() => moveHorizontal('foo', 1, {})).to.throw('direction was not one of the expected values: left,right');
        expect(() => moveVertical('foo', 1, {})).to.throw('direction was not one of the expected values: up,down');
    });
    it('should move to left end of table', () => {
        helpersModule.focus = sinon.fake();
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];

        moveHorizontal(
            'left',
            `footableid-${ID_FIELD_PREFIX}-1-firstName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-rank');
    });

    it('should not move left when already at left end of table', () => {
        helpersModule.focus = sinon.fake();
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveHorizontal(
            'left',
            `footableid-${ID_FIELD_PREFIX}-1-rank`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-rank', true);
    });

    it('should move to right end of table', () => {
        helpersModule.focus = sinon.fake();
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];

        moveHorizontal(
            'right',
            `footableid-${ID_FIELD_PREFIX}-1-firstName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-lastName');
    });

    it('should not move right when already at right end of table', () => {
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveHorizontal(
            'right',
            `footableid-${ID_FIELD_PREFIX}-1-lastName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-lastName', true);
    });

    it('should move down table', () => {
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveVertical(
            'down',
            `footableid-${ID_FIELD_PREFIX}-1-lastName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-2-lastName');
    });

    it('should move up table', () => {
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveVertical(
            'up',
            `footableid-${ID_FIELD_PREFIX}-2-lastName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-lastName');
    });

    it('should not move up table when already at top', () => {
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveVertical(
            'up',
            `footableid-${ID_FIELD_PREFIX}-1-lastName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-1-lastName', true);
    });

    it('should not move down table when already at bottom', () => {
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [{ field: 'rank' }, { field: 'firstName' }, { field: 'lastName' }];
        moveVertical(
            'down',
            `footableid-${ID_FIELD_PREFIX}-2-lastName`,
            getGridNavigationMap('footableid', rows, columns)
        );
        expect(helpersModule.focus).to.have.been.calledWith('footableid-field-2-lastName', true);
    });

    it('should not move down if combo is being edited', () => {
        helpersModule.cellIsEditing = sinon.fake(() => true);
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [
            { field: 'rank', rich: { autoComplete: { options: ['foo'] } } },
            { field: 'firstName' },
            { field: 'lastName' }
        ];
        moveVertical('down', `footableid-${ID_FIELD_PREFIX}-1-rank`, getGridNavigationMap('footableid', rows, columns));
        expect(helpersModule.focus).to.have.been.callCount(1);
        expect(helpersModule.focus).to.have.been.calledWith(`footableid-${ID_FIELD_PREFIX}-1-rank`);
    });

    it('should not move down if combo is being edited', () => {
        helpersModule.cellIsEditing = sinon.fake(() => true);
        helpersModule.focus = sinon.fake(() => {});
        const rows = [
            {
                id: 1,
                rank: 'General',
                firstName: 'Bob',
                lastName: 'Jones'
            },
            {
                id: 2,
                rank: 'Sergeant',
                firstName: 'James',
                lastName: 'Brooks'
            }
        ];
        const columns = [
            { field: 'rank', rich: { autoComplete: { options: ['foo'] } } },
            { field: 'firstName' },
            { field: 'lastName' }
        ];
        moveVertical('up', `footableid-${ID_FIELD_PREFIX}-2-rank`, getGridNavigationMap('footableid', rows, columns));
        expect(helpersModule.focus).to.have.been.callCount(1);
        expect(helpersModule.focus).to.have.been.calledWith(`footableid-${ID_FIELD_PREFIX}-2-rank`);
    });
});

describe('getColumn', () => {
    it('should throw if id not provided', () => {
        expect(() => getColumn()).to.throw('id not provided');
        expect(() => getColumn(undefined)).to.throw('id not provided');
        expect(() => getColumn(null)).to.throw('id not provided');
    });
    it('should throw if columns not provided', () => {
        expect(() => getColumn('footableid-field-1-rank')).to.throw('columns not provided');
        expect(() => getColumn('footableid-field-1-rank', undefined)).to.throw('columns not provided');
        expect(() => getColumn('footableid-field-1-rank', null)).to.throw('columns not provided');
    });
    it('should throw if columns cannot be found', () => {
        const columns = [{ field: 'rank' }];
        expect(() => getColumn('footableid-field-1-foo', columns)).to.throw('column foo could not be found');
    });
    it('should return column', () => {
        const columns = [{ field: 'rank', foo: 'bar' }];
        expect(getColumn('footableid-field-1-rank', columns)).to.equal(columns[0]);
    });
});

describe('isEditable', () => {
    it('should throw if id not provided', () => {
        expect(() => isEditable()).to.throw('id not provided');
        expect(() => isEditable(undefined)).to.throw('id not provided');
        expect(() => isEditable(null)).to.throw('id not provided');
    });
    it('should throw if columns not provided', () => {
        expect(() => isEditable('footableid-field-1-rank')).to.throw('columns not provided');
        expect(() => isEditable('footableid-field-1-rank', undefined)).to.throw('columns not provided');
        expect(() => isEditable('footableid-field-1-rank', null)).to.throw('columns not provided');
    });
    it('should throw if column cannot be found', () => {
        const columns = [{ field: 'rank' }];
        expect(() => isEditable('footableid-field-1-foo', columns)).to.throw('column foo could not be found');
    });
    it('should not be editable when column has no rich property', () => {
        const columns = [{ field: 'rank' }];
        expect(isEditable('footableid-field-1-rank', columns)).to.equal(false);
    });
    it('should not be editable when column has rich property but is not marked as editable', () => {
        expect(isEditable('footableid-field-1-rank', [{ field: 'rank', rich: {} }])).to.equal(false);
        expect(isEditable('footableid-field-1-rank', [{ field: 'rank', rich: { editable: false } }])).to.equal(false);
    });
    it('should be editable when column has rich property but is  marked as editable', () => {
        expect(isEditable('footableid-field-1-rank', [{ field: 'rank', rich: { editable: true } }])).to.equal(true);
    });
});
