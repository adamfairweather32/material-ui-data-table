import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { v4 as uuidv4 } from "uuid";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import DataTableField from "./components/DataTableField";
import DataTableHeader from "./components/DataTableHeader";
import DataTableFooter from "./components/DataTableFooter";
import DataTableRow from "./components/DataTableRow";
import { createCellId } from "./helpers/helpers";

const styles = () => ({
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
  const tableId = useRef(uuidv4().toString().replace(/-/g, ""));

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
    const calculatedTableHeight = numberOfRows * rowHeight;
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
    tableBody.style.height = `${calculatedTableHeight}px`;

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

  useEffect(() => {
    onScroll({ target: { scrollTop: 0 } });
    // eslint-disable-next-line
  }, []);

  function handleWindowResize() {
    onScroll({ target: { scrollTop: 0 } });
  }

  window.onresize = handleWindowResize;

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

  const renderBody = () => {
    let { scroll: { index } } = state;
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
          key={index}>
          <DataTableRow tableId={tableId.current} columns={state.columns} rows={rows} rowIndex={index} handleCellClick={handleCellClick}/>
        </div>
      );
      index++;
    } while (index < state.scroll.end);

    return items;
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
            <DataTableHeader columns={state.columns} rowHeight={rowHeight}/>
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
          <div id={`${tableId.current}-tfoot`} className={classes.tableFooterComponent}>
            <DataTableFooter columns={state.columns} rowHeight={rowHeight}/>
          </div>
        </div>
      </TableContainer>
    </>
  );
};

export default withStyles(styles)(DataTable);
