import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import TableBody from "@material-ui/core/TableBody";
import DataTableTotals from "./components/DataTableTotals";
import DataTableHead from "./components/DataTableHead";
import DataTableTopPanel from "./components/DataTableTopPanel";
import { MemoizedDataTableRow } from "./components/DataTableRow";
import { MemoizedAddDeletePanel } from "./components/AddDeletePanel";

import {
  ENTER,
  LEFT,
  RIGHT,
  DOWN,
  UP,
  LEFT_DIR,
  RIGHT_DIR,
  UP_DIR,
  DOWN_DIR
} from "./constants";

import {
  getCellIdFromTarget,
  getSorting,
  stableSort,
  filterRow,
  focus,
  validateColumns,
  clearBlinkers,
  getPreparedColumns
} from "./helpers/helpers";
import {
  getGridNavigationMap,
  moveVertical,
  moveHorizontal
} from "./helpers/gridNavigation";
import getValidatedRows from "./helpers/validation";
import "./styles.css";

const useStyles = makeStyles(theme => ({
  root: {
    display: "grid",
    gridTemplateRows: "80fr auto",
    gridRowGap: "5px"
  },
  paper: {
    marginTop: theme.spacing(3),
    overflowX: "auto",
    marginBottom: theme.spacing(2)
  },
  table: {
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  tableContainer: {
    height: "250px"
  },
  tableHead: {
    backgroundColor: "#f5f7f7"
  },
  tableCellSizeSmall: {
    padding: "2.5px 0 0 2.5px"
  },
  tableCellHead: {
    fontSize: "1rem",
    fontWeight: "bold",
    border: "1px solid rgba(224, 224, 224, 1)",
    paddingRight: "2.5px",
    "&:last-child": {
      paddingRight: "2.5px"
    }
  }
}));

const DataTable = ({
  rows,
  columns,
  onEdit,
  onAdd,
  onDelete,
  showFilter = false,
  showErrors = false,
  rules = []
}) => {
  const activeReference = useRef({});

  const [draftValue, setDraftValue] = useState(null);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visibilities, setVisibilities] = useState(
    columns
      .filter(c => c.headerName)
      .map(({ headerName, field, hidden }) => ({
        headerName,
        field,
        visible: !hidden
      }))
  );

  const classes = useStyles();

  useEffect(() => {
    if (activeReference && activeReference.current) {
      focus(activeReference.current);
    }
  }, [order, orderBy]);

  validateColumns(columns, ["validations"]);

  const preparedColumns = getPreparedColumns(columns, visibilities);

  const getFilteredAndSortedRows = () => {
    return stableSort(
      getValidatedRows(rows, rules).filter(
        r => !showFilter || filterRow(r, preparedColumns, searchText)
      ),
      preparedColumns,
      getSorting(order, orderBy)
    );
  };

  const filteredRows = getFilteredAndSortedRows();

  const errorCount = _.sum(
    _.flatMap(filteredRows, row => (!_.isEmpty(row.validations.errors) ? 1 : 0))
  );

  const gridNavigationMap = getGridNavigationMap(filteredRows, preparedColumns);

  const isIndeterminate = () =>
    selected.length > 0 && selected.length < rows.length;

  const isChecked = () => selected.length === rows.length;

  const handleDelete = () => {
    onDelete(selected);
  };

  const handleAdd = () => {
    //add new row
    //send row to output event handler
    const row = {};
    onAdd(row);
  };

  const handleCellChange = (value, row, column, commit = false) => {
    if (commit) {
      onEdit(value, row, column);
      setDraftValue(null);
    } else {
      setDraftValue({ value, row, column });
    }
  };

  const handleCommit = () => {
    if (draftValue) {
      const { value, row, column } = draftValue;
      onEdit(value, row, column);
      setDraftValue(null);
    }
  };

  const handleCancel = () => {
    setDraftValue(null);
  };

  const handleFocus = e => {
    if (e.target) {
      const id = getCellIdFromTarget(e.target);
      activeReference.current = id || activeReference.current;
    }
  };

  const handleKeyDown = e => {
    if (e.ctrlKey || e.shiftKey) {
      return;
    }
    if (e.keyCode === LEFT) {
      moveHorizontal(LEFT_DIR, activeReference.current, gridNavigationMap);
    } else if (e.keyCode === RIGHT) {
      moveHorizontal(RIGHT_DIR, activeReference.current, gridNavigationMap);
    } else if (e.keyCode === UP) {
      moveVertical(UP_DIR, activeReference.current, gridNavigationMap);
    } else if (e.keyCode === DOWN || e.keyCode === ENTER) {
      moveVertical(DOWN_DIR, activeReference.current, gridNavigationMap);
    }
  };

  const handleRequestSort = (event, property) => {
    clearBlinkers();
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const handleSelectedChanged = (rowId, isSelected) => {
    if (isSelected) {
      setSelected([...selected, rowId]);
    } else {
      selected.splice(selected.indexOf(rowId), 1);
      setSelected([...selected]);
    }
  };

  const handleSelectAllClick = () => {
    if (isIndeterminate()) {
      setSelected([...rows.map(row => row.id)]);
    } else if (isChecked()) {
      setSelected([]);
    } else {
      setSelected([...rows.map(row => row.id)]);
    }
  };

  const handleColumnVisibilityChanged = visibilities => {
    setVisibilities(visibilities);
  };

  const handleSearchTextChanged = searchText => {
    setSearchText(searchText);
  };

  const canAdd = !!onAdd && !!onEdit;
  const canEdit = canAdd;
  const canDelete = !!onDelete && selected.length > 0;
  const shouldCalculateTotals = _.some(preparedColumns, c => c.total);

  if (!canEdit) {
    preparedColumns
      .filter(c => c.rich)
      .forEach(c => {
        c.rich.editable = false;
      });
  }

  const renderTotals = () => {
    return (
      <DataTableTotals
        rows={rows}
        columns={preparedColumns}
        readonlyMode={!canEdit}
      />
    );
  };

  const getOriginalOrDraft = row => {
    if (draftValue && !_.isEmpty(draftValue) && row.id === draftValue.row.id) {
      return {
        ...row,
        [draftValue.column]: draftValue.value
      };
    }
    return row;
  };

  const getErrors = ({ validations: { errors } } = {}) => errors;
  const getWarnings = ({ validations: { warnings } } = {}) => warnings;

  const renderTableBody = () => {
    const tableRows = filteredRows.map((row, index) => (
      <MemoizedDataTableRow
        key={row.id}
        index={index}
        row={getOriginalOrDraft(row)}
        errors={getErrors(row)}
        warnings={getWarnings(row)}
        columns={preparedColumns}
        rowId={row.id}
        onFocus={handleFocus}
        onCellChange={handleCellChange}
        onCommit={handleCommit}
        onCancel={handleCancel}
        editable={canEdit}
        selected={selected.includes(row.id)}
        onSelectedChanged={handleSelectedChanged}
      />
    ));
    return (
      <>
        {tableRows}
        {shouldCalculateTotals && renderTotals()}
      </>
    );
  };

  const checked = isChecked();
  const indeterminate = isIndeterminate();

  return (
    <div className={classes.root}>
      <DataTableTopPanel
        showErrors={showErrors}
        showFilter={showFilter}
        errorCount={errorCount}
        onSearchTextChanged={handleSearchTextChanged}
      />
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader className={classes.table} size="small">
          <DataTableHead
            columns={preparedColumns}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
            onColumnVisibilityChanged={handleColumnVisibilityChanged}
            visibilities={visibilities}
            order={order}
            orderBy={orderBy}
            editable={canEdit}
            checked={checked}
            indeterminate={indeterminate}
          />
          <TableBody onKeyDown={handleKeyDown}>{renderTableBody()}</TableBody>
        </Table>
      </TableContainer>
      {canEdit && (
        <MemoizedAddDeletePanel
          canAdd={canAdd}
          onAddRequested={handleAdd}
          onDeleteRequested={handleDelete}
          canDelete={canDelete}
        />
      )}
    </div>
  );
};

export default DataTable;
