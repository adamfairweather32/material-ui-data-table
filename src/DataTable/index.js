import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { v4 as uuidv4 } from "uuid";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import DataTableField from "./DataTableField";

const styles = (theme) => ({
  tableHeadComponent: {
    width: "100%",
    display: "table-header-group",
    borderSpacing: 0,
    borderCollapse: "collapse",
  },
  tableComponent: {
    width: "100%",
    display: "table",
    borderSpacing: 0,
    borderCollapse: "collapse",
  },
  tableFooterComponent: {
    display: "table-footer-group",
  },
  tableHead: {
    backgroundColor: "#fafafa",
    color: "#fcfcfc",
  },
  tableCell: {
    letterSpacing: "0",
    fontSize: "1rem",
    width: "6rem",
  },
  tableCellHead: {
    fontSize: "1rem",
    fontWeight: "bold",
    border: "1px solid rgba(224, 224, 224, 1)",
    position: "sticky",
    zIndex: 4,
    backgroundColor: "blue",
    color: "white",
    top: 0,
    "&:last-child": {
      paddingRight: "4px",
    },
  },
  tableCellFoot: {
    fontSize: "1rem",
    fontWeight: "bold",
    border: "1px solid rgba(224, 224, 224, 1)",
    position: "sticky",
    zIndex: 4,
    backgroundColor: "blue",
    color: "white",
    bottom: 0,
    "&:last-child": {
      paddingRight: "4px",
    },
  },
  tableCellHeadDiv: {
    paddingLeft: "5px",
  },
  tableRow: {
    display: "table-row",
  },
  tableRowOdd: {
    backgroundColor: "#EBEAF6",
  },
  tableRowEven: {
    backgroundColor: "#fcfcfc",
  },
});

let timer = null;
const FOCUS_TIMEOUT_MS = 50;
const DataTable = ({ classes, rows, rowHeight, tableHeight }) => {
  const [, setForce] = useState();
  const tableId = useRef(uuidv4());

  const [state, setState] = useState({
    columns: Object.keys(rows[0]),
    tableHeight: rowHeight * rows.length,
    scroll: {
      top: 0,
      index: 0,
      end: Math.ceil((tableHeight * 2) / rowHeight),
    },
    focusedId: null,
  });

  useEffect(() => {
    onScroll({ target: { scrollTop: 0 } });
    // eslint-disable-next-line
  }, []);

  function reportWindowSize() {
    setForce({});
  }

  window.onresize = reportWindowSize;

  //if user presses the down/up arrow key and cell is not visible then
  //set focused cell at top/bottom of grid
  //if user starts typing then scroll back to the cell

  //how do we handle when we have multiple tables? -> possibly need to append
  //an additional id

  const focusPreviousCell = () => {
    const { focusedId } = state;
    if (focusedId) {
      const element = document.getElementById(focusedId);
      if (element) {
        element.focus();
      }
    }
  };

  const onScroll = ({ target }) => {
    const numberOfRows = rows.length;
    const tableHeight = numberOfRows * rowHeight;
    const tableBody = document.getElementById(`${tableId.current}-tbody`);
    const positionInTable = target.scrollTop;

    const tableHeadHeight = document
      .getElementById(`${tableId.current}-thead`)
      .getBoundingClientRect().height;
    const tableFooterHeight = document
      .getElementById(`${tableId.current}-tfoot`)
      .getBoundingClientRect().height;
    const tableContainerHeight = document
      .getElementById(`${tableId.current}-tcontainer`)
      .getBoundingClientRect().height;

    const visibleTableHeight =
      tableContainerHeight - tableHeadHeight - tableFooterHeight;

    const topRowIndex = Math.floor(positionInTable / rowHeight);
    const endRow = topRowIndex + visibleTableHeight / rowHeight;
    tableBody.style.height = tableHeight + "px";

    setState({
      ...state,
      scroll: {
        ...state.scroll,
        index: topRowIndex,
        end: Math.ceil(endRow),
        top: topRowIndex * rowHeight,
      },
    });
    clearTimeout(timer);
    timer = setTimeout(() => focusPreviousCell(), FOCUS_TIMEOUT_MS);
  };

  const handleCellClick = (event) => {
    setState({
      ...state,
      focusedId: event.target.id,
    });
    const element = document.getElementById(event.target.id);
    if (element) {
      element.focus();
    }
  };

  const getCellId = (rowId, columnId) => {
    return `${tableId.current}-field-${rowId}-${columnId}`;
  };

  const generateRow = (columns, rowIndex) =>
    columns.map((column, i) => {
      const row = rows[rowIndex];
      const rowId = row.id;
      const key = getCellId(rowId, column);

      const value = rows[rowIndex][column];
      const cols = document.querySelectorAll("div.MuiTableCell-head");

      const currentColWidth = cols[i]
        ? cols[i].getBoundingClientRect().width
        : 0;

      return (
        <TableCell
          component="div"
          variant="body"
          key={key}
          padding="none"
          style={{
            width: `${currentColWidth}px`,
            display: "inline-block",
          }}
          className={clsx(classes.tableCell)}
          onClick={handleCellClick}
        >
          <DataTableField id={key} value={value} />
        </TableCell>
      );
    });

  const renderBody = () => {
    const columns = state.columns;
    let index = state.scroll.index;
    const items = [];
    const tableElement = document.getElementById(`${tableId.current}-table`);
    const tableWidth = tableElement
      ? tableElement.getBoundingClientRect().width
      : 0;

    do {
      if (index >= rows.length) {
        index = rows.length;
        break;
      }
      items.push(
        <div
          style={{
            top: index * rowHeight,
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
            width: tableWidth,
            position: "absolute",
          }}
          className={clsx(
            classes.tableRow,
            index % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven
          )}
          key={index}
        >
          {generateRow(columns, index)}
        </div>
      );
      index++;
    } while (index < state.scroll.end);

    return items;
  };

  const renderParentHeader = () => {
    return (
      <>
        <div
          className={classes.tableRow}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
              component="div"
              variant="head"
              className={clsx(classes.tableCell, classes.tableCellHead)}
              key={i}
              padding="none"
            >
              <div className={classes.tableCellHeadDiv}>{name}</div>
            </TableCell>
          ))}
        </div>
      </>
    );
  };

  const renderHeader = () => {
    return (
      <>
        {renderParentHeader()}
        <div
          className={classes.tableRow}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
              variant="head"
              component="div"
              className={clsx(classes.tableCell, classes.tableCellHead)}
              style={{
                top: rowHeight,
              }}
              key={i}
              padding="none"
            >
              <div className={classes.tableCellHeadDiv}>{name}</div>
            </TableCell>
          ))}
        </div>
      </>
    );
  };

  const renderFooter = () => {
    return (
      <div
        className={classes.tableRow}
        style={{
          height: rowHeight,
          lineHeight: `${rowHeight}px`,
        }}
      >
        {state.columns.map((name, i) => (
          <TableCell
            component="div"
            variant="footer"
            className={clsx(classes.tableCell, classes.tableCellFoot)}
            key={i}
            padding="none"
          >
            <div className={classes.tableCellHeadDiv}>{name}</div>
          </TableCell>
        ))}
      </div>
    );
  };

  return (
    <>
      <TableContainer
        id={`${tableId.current}-tcontainer`}
        onScroll={onScroll}
        component={Paper}
        style={{
          maxHeight: tableHeight,
          minHeight: "200px",
        }}
      >
        <div id={`${tableId.current}-table`} className={classes.tableComponent}>
          <div
            id={`${tableId.current}-thead`}
            className={clsx(classes.tableHeadComponent, classes.tableHead)}
          >
            {renderHeader()}
          </div>
          <div
            id={`${tableId.current}-tbody`}
            className="tbody"
            style={{
              position: "relative",
            }}
          >
            {renderBody()}
          </div>
          <div
            id={`${tableId.current}-tfoot`}
            className={classes.tableFooterComponent}
          >
            {renderFooter()}
          </div>
        </div>
      </TableContainer>
    </>
  );
};

export default withStyles(styles)(DataTable);
