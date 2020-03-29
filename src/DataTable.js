import React, { useState, useEffect } from "react";
import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableFooter from "@material-ui/core/TableFooter";
import TableContainer from "@material-ui/core/TableContainer";
import DataTableField from "./DataTableField";

const styles = theme => ({
  root: {},
  tableWrapper: {
    borderCollapse: "separate"
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
    outlineOffset: "-2px",
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
  tableRowOdd: {
    backgroundColor: "#EBEAF6"
  },
  tableRowEven: {
    backgroundColor: "#fcfcfc"
  }
});

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
    //calculateTableHeight();
    onScroll({ target: { scrollTop: 0}})
  }, []);

  //if user presses the down/up arrow key and cell is not visible then
  //set focused cell at top/bottom of grid
  //if user starts typing then scroll back to the cell
  //lets start  a timer that will invoke a callback after 150ms to manually
  //focus the cell if it is visible within the table. This timer and callback
  //should be setup during a scroll, click or key navigation event. Everything can
  //continue to work with making the cell look active

  //TODO: on reize -> re-render body after 150ms
  //TODO: on initial render -> re-render body

  const onScroll = ({ target }) => {
    const numberOfRows = rows.length; // returned from server
    const tableHeight = numberOfRows * rowHeight;
    const tableBody = document.querySelector(".tbody");
    const positionInTable = target.scrollTop;
        
    const visibleTableHeight =
      document
        .querySelectorAll(".MuiTableContainer-root")[0]
        .getBoundingClientRect().height -
      document.querySelectorAll("thead")[0].getBoundingClientRect().height -
      document.querySelectorAll("tfoot")[0].getBoundingClientRect().height;

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
  };

  const handleCellClick = event => {
    setFocus({
      ...focus,
      id: event.target.id,
      focused: true,
      scrolling: false
    });
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

      const cols = document.querySelectorAll("table thead tr th");

      const currentColWidth = cols[i]
        ? cols[i].getBoundingClientRect().width
        : 0;

      // Get the width of the column at index i.
      // Then set width of tableCell to that column

      return (
        <TableCell
          key={key}
          padding="none"
          style={{
            width: `${currentColWidth}px`,
            display: "inline-block"
          }}
          className={clsx(
            classes.tableCell,
            isFocused ? classes.tableCellBodyFocused : undefined
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
    do {
      if (index >= rows.length) {
        index = rows.length;
        break;
      }
      items.push(
        <tr
          style={{
            top: index * rowHeight,
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
            width: document.querySelector("table")
              ? document.querySelector("table").getBoundingClientRect().width
              : 0, // TODO calculate actual width
            position: "absolute"
          }}
          className={`${
            index % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven
          }`}
          key={index}
        >
          {generateRow(columns, index)}
        </tr>
      );
      index++;
    } while (index < state.scroll.end);

    return items;
  };

  const renderParentHeader = () => {
    return (
      <>
        <TableRow
          className={classes.tableRow}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
              className={clsx(classes.tableCell, classes.tableCellHead)}
              key={i}
              padding="none"
            >
              <div className={classes.tableCellHeadDiv}>{name}</div>
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const renderHeader = () => {
    return (
      <>
        {renderParentHeader()}
        <TableRow
          className={classes.tableRow}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
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
        </TableRow>
      </>
    );
  };

  const renderFooter = () => {
    return (
      <>
        <TableRow
          className={classes.tableRow}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`
          }}
        >
          {state.columns.map((name, i) => (
            <TableCell
              className={clsx(classes.tableCell, classes.tableCellFoot)}
              key={i}
              padding="none"
            >
              <div className={classes.tableCellHeadDiv}>{name}</div>
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  return (
    <>
      <div>{JSON.stringify(state.scroll)}</div>
      <TableContainer
        onScroll={onScroll}
        component={Paper}
        style={{
          maxHeight: tableHeight,
          minHeight: "200px"
        }}
      >
        <Table className={classes.tableWrapper}>
          {/* <div className="height" /> */}
          <TableHead className={classes.tableHead}>{renderHeader()}</TableHead>
          <div
            className="tbody"
            style={{
              position: "relative"
            }}
          >
            {renderBody()}
          </div>
          <TableFooter>{renderFooter()}</TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default withStyles(styles)(DataTable);
