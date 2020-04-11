import _ from "lodash";
import {
  HORIZONTAL_DIRECTIONS,
  VERTICAL_DIRECTIONS,
  COMBO_TYPE,
  LEFT_DIR,
  RIGHT_DIR,
  UP_DIR,
  DOWN_DIR,
} from "../constants";
import {
  getColumnType,
  createCellId,
  getDuplicates,
  cellIsEditing,
  focus,
} from "./helpers";

const getRowAndColumnIdentifiers = (id) => {
  if (!id) {
    throw Error("id is empty!");
  }
  const parts = id.split("-");
  if(parts.length !== 4) { 
    throw Error(`${id} is not in expected format`);
  };
  return {
    rowIdentifier: parts[2],
    columnIdentifier: parts[3],
  };
};

const getIncludedKeys = (columns) => {
  const included = columns.map((c) => ({
    field: c.field,
    type: getColumnType(c),
  }));
  const includedKeys = included.map((item, columnIndex) => ({
    key: item.field,
    type: item.type,
    columnIndex,
  }));
  return includedKeys;
};

const getPositionsForId = (rowIndex, keys) =>
  keys.reduce((acc, cur) => {
    const { key, columnIndex, type } = cur;
    return {
      ...acc,
      [key]: {
        columnIndex,
        rowIndex,
        type,
      },
    };
  }, {});

const getIdsForPosition = (tableId, row, keys) =>
  keys.reduce((acc, cur) => {
    const { key, columnIndex } = cur;
    return {
      ...acc,
      [columnIndex]: createCellId(tableId, row.id, key),
    };
  }, {});

const comboIsBeingEdited = (id, type) => {
  if (!type) {
    return false;
  }
  return type === COMBO_TYPE && cellIsEditing(id);
};

const isInRange = (index, length) => index >= 0 && index < length;

const getNewPosition = ({ rowIndex, columnIndex }, direction) => {
  switch (direction) {
    case LEFT_DIR:
      return { rowIndex, columnIndex: columnIndex - 1 };
    case RIGHT_DIR:
      return { rowIndex, columnIndex: columnIndex + 1 };
    case UP_DIR:
      return { rowIndex: rowIndex - 1, columnIndex };
    case DOWN_DIR:
      return { rowIndex: rowIndex + 1, columnIndex };
    default:
      throw Error(`Unknown direction: ${direction}`);
  }
};

export const getGridNavigationMap = (tableId, rows = [], columns) => {
  if (!tableId) {
    throw Error("No tableId provided");
  }
  if (!columns || !columns.length) {
    throw Error("No columns provided");
  }
  const includedKeys = getIncludedKeys(columns);
  const hasId = _.every(
    rows.map((r) => r.id),
    (r) => !!r || r === 0
  );
  if (!hasId) {
    throw Error("One or more rows are missing an id property");
  }
  if (getDuplicates(rows, (r) => r.id).length) {
    throw Error("Duplicate ids found in row collection");
  }
  return rows.reduce(
    (acc, row, rowIndex) => ({
      idToPositionMap: {
        ...acc.idToPositionMap,
        [row.id]: getPositionsForId(rowIndex, includedKeys),
      },
      positionToIdMap: {
        ...acc.positionToIdMap,
        [rowIndex]: getIdsForPosition(tableId, row, includedKeys),
      },
    }),
    {}
  );
};

const move = (direction, directions, currentId, gridNavigationMap) => {
  if (!directions.includes(direction)) {
    throw Error(`direction was not one of the expected values: ${directions}`);
  }
  if (!currentId) {
    return;
  }
  const { rowIdentifier, columnIdentifier } = getRowAndColumnIdentifiers(
    currentId
  );
  const { idToPositionMap, positionToIdMap } = gridNavigationMap;
  const currentCell = idToPositionMap[rowIdentifier][columnIdentifier];
  if (currentCell) {
    if (comboIsBeingEdited(currentId, currentCell.type)) {
      return;
    }
    const { rowIndex, columnIndex } = getNewPosition(currentCell, direction);

    const rowCount = Object.keys(idToPositionMap).length;
    const columnCount = Object.keys(Object.values(idToPositionMap)[0]).length;

    if (isInRange(columnIndex, columnCount) && isInRange(rowIndex, rowCount)) {
      const id = positionToIdMap[rowIndex][columnIndex];
      focus(id);
    } else {
      focus(currentId, true);
    }
  }
};

export const moveHorizontal = (direction, currentId, gridNavigationMap) => {
  move(direction, HORIZONTAL_DIRECTIONS, currentId, gridNavigationMap);
};

export const moveVertical = (direction, currentId, gridNavigationMap) => {
  move(direction, VERTICAL_DIRECTIONS, currentId, gridNavigationMap);
};
