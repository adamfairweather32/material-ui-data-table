import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import DataTableField from "./DataTableField";

const styles = theme => ({
  root: {},
  tableHeadComponent: {
    width: "100%",
    display: "table-header-group",
    borderSpacing: 0,
    borderCollapse: "collapse"
  },
  tableComponent: {
    width: "100%",
    display: "table",
    borderSpacing: 0,
    borderCollapse: "collapse"
  },
  tableFooterComponent: {
    display: "table-footer-group"
  },
  tableHead: {
    backgroundColor: "#fafafa",
    color: "#fcfcfc"
  },
  tableCell: {
    letterSpacing: "0",
    fontSize: "1rem",
    width: "6rem"
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
      paddingRight: "4px"
    }
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
      paddingRight: "4px"
    }
  },
  tableCellBodyFocused: {
    outline: theme.palette.primary.main,
    outlineWidth: "2px",
    outlineStyle: "solid"
    // "&:focus": {
    //   outline: theme.palette.primary.main,
    //   outlineWidth: "2px",
    //   outlineOffset: "-2px",
    //   outlineStyle: "solid"
    // }
  },
  tableCellHeadDiv: {
    paddingLeft: "5px"
  },
  tableRow: {
    display: "table-row"
  },
  tableRowOdd: {
    backgroundColor: "#EBEAF6"
  },
  tableRowEven: {
    backgroundColor: "#fcfcfc"
  }
});

let timer = null;
const FOCUS_TIMEOUT_MS = 150;

const DataTable = ({ classes, rows, rowHeight, tableHeight }) => {
  const [state, setState] = useState({
    columns: Object.keys(rows[0]),
    tableHeight: rowHeight * rows.length,
    scroll: {
      top: 0,
      index: 0,
      end: Math.ceil((tableHeight * 2) / rowHeight)
    }
  });

  const [focus, setFocus] = useState({
    id: null,
    clicked: false,
    scrolling: false
  });

  useEffect(() => {
    onScroll({ target: { scrollTop: 0}})
    // eslint-disable-next-line
  }, []);

  //if user presses the down/up arrow key and cell is not visible then
  //set focused cell at top/bottom of grid
  //if user starts typing then scroll back to the cell
  //lets start  a timer that will invoke a callback after 150ms to manually
  //focus the cell if it is visible within the table. This timer and callback
  //should be setup during a scroll, click or key navigation event. Everything can
  //continue to work with making the cell look active

  //TODO: on reize -> re-render body after 150ms

  const focusPreviousCell = () => {
    console.log("Focus")
  };

  const onScroll = ({ target }) => {
    const numberOfRows = rows.length; // returned from server
    const tableHeight = numberOfRows * rowHeight;
    const tableBody = document.querySelector(".tbody");
    const positionInTable = target.scrollTop;
        
    const tableHeadHeight = document.getElementById("thead").getBoundingClientRect().height;
    const tableFooterHeight = document.getElementById("tfoot").getBoundingClientRect().height;
    const tableContainerHeight = document.getElementById("tcontainer").getBoundingClientRect().height;

    const visibleTableHeight = tableContainerHeight - tableHeadHeight - tableFooterHeight;

    const topRowIndex = Math.floor(positionInTable / rowHeight);
    const endRow = topRowIndex + visibleTableHeight / rowHeight;
    tableBody.style.height = tableHeight + "px";

    setState({
      ...state,
      scroll: {
        ...state.scroll,
        index: topRowIndex,
        end: Math.ceil(endRow),
        top: topRowIndex * rowHeight
      }
    });
    clearTimeout(timer);
    timer = setTimeout(() => focusPreviousCell(), FOCUS_TIMEOUT_MS)
  };

  const handleCellClick = event => {
    setFocus({
      ...focus,
      id: event.target.id,
      focused: true,
      scrolling: false
    });
    const element = document.getElementById(event.target.id);
    if(element) { 
      element.focus();
    }
  };

  const getCellId = (rowId, columnId) => {
    return `field-${rowId}-${columnId}`;
  };

  const generateRow = (columns, rowIndex) =>
    columns.map((column, i) => {
      const row = rows[rowIndex];
      const rowId = row.id;
      const key = getCellId(rowId, column);
      const { focused, id } = focus;
      const isFocused = id && key === id && focused;

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
            display: "inline-block"
          }}
          className={clsx(
            classes.tableCell
          )}
          onClick={handleCellClick}
        >
          <DataTableField
            id={key}
            value={rows[rowIndex][column]}
            focused={isFocused}
          />
        </TableCell>
      );
    });

  const renderBody = () => {
    const columns = state.columns;
    let index = state.scroll.index;
    const items = [];
    const tableElement = document.getElementById("table");
    const tableWidth = tableElement ? tableElement.getBoundingClientRect().width : 0;

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
            position: "absolute"
          }}
          className={clsx(classes.tableRow, index % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven)}
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
            lineHeight: `${rowHeight}px`
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
            lineHeight: `${rowHeight}px`
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
              variant="head"
              component="div"
              className={clsx(classes.tableCell, classes.tableCellHead)}
              style={{
                top: rowHeight
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
            lineHeight: `${rowHeight}px`
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
      <div>{JSON.stringify(state.scroll)}</div>
      <TableContainer
        id = "tcontainer"
        onScroll={onScroll}
        component={Paper}
        style={{
          maxHeight: tableHeight,
          minHeight: "200px"
        }}
      >
        <div id="table" className={classes.tableComponent}>
          <div id="thead" className={clsx(classes.tableHeadComponent, classes.tableHead)}>{renderHeader()}</div>
          <div
            className="tbody"
            style={{
              position: "relative"
            }}
          >
            {renderBody()}
          </div>
          <div id="tfoot" className={classes.tableFooterComponent}>{renderFooter()}</div>
        </div>
      </TableContainer>
    </>
  );
};

export default withStyles(styles)(DataTable);
