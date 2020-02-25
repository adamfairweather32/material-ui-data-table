import React, { useState } from "react";
import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import DataTableField from "./DataTableField";

const styles = theme => ({
  root: {},
  wrapper: {
    display: "flex",
    flexDirection: "column"
  },
  tableWrapper: {
    borderStyle: "none",
    borderCollapse: "collapse",
    display: "table"
  },
  tableContent: {
    overflowY: "scroll",
    borderCollapse: "collapse",
    display: "flex"
  },
  tableHead: {
    backgroundColor: "#fafafa",
    color: "#fcfcfc"
  },
  tableData: {
    color: "#333"
  },
  tableCell: {
    //cursor: "pointer",
    letterSpacing: "0",
    fontSize: "1rem",
    width: "6rem"
  },
  tableCellHead: {
    fontSize: "1rem",
    fontWeight: "bold",
    border: "1px solid rgba(224, 224, 224, 1)",
    "&:last-child": {
      paddingRight: "4px"
    }
  },
  tableCellBodyFocused: {
    outline: theme.palette.primary.main,
    outlineWidth: "2px",
    outlineOffset: "-2px",
    outlineStyle: "solid"
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
  const padding = Math.ceil((tableHeight * 2) / rowHeight);
  const [state, setState] = useState({
    columns: Object.keys(rows[0]),
    tableHeight: rowHeight * rows.length,
    scroll: {
      top: 0,
      index: 0,
      end: Math.ceil((tableHeight * 2) / rowHeight)
    }
  });

  const [focus, setFocus] = useState(null);

  const onScroll = ({ target }) => {
    const scrollTop = target.scrollTop;
    const index = Math.floor(scrollTop / rowHeight);

    setState({
      ...state,
      scroll: {
        ...state.scroll,
        index: index - padding < 0 ? index : index - padding,
        end: index + padding,
        top: (scrollTop / rowHeight) * rowHeight
      }
    });
  };

  const handleCellClick = event => {
    console.log("event.target = ", event.target.id);
    setFocus(event.target.id);
  };

  const getCellId = (rowId, columnId) => {
    return `field-${rowId}-${columnId}`;
  };

  const getRowAndColumnId = cellId => {
    if (cellId) {
      var parts = cellId.split("-");
      return {
        rowId: parts[1],
        columnId: parts[2]
      };
    }
    return null;
  };

  const generateRow = (columns, rowIndex) =>
    columns.map(column => {
      const row = rows[rowIndex];
      const rowId = row.id;

      //get scrolled row index
      //get focused row index
      //if not within visible table then do not focus

      const key = getCellId(rowId, column);
      const isFocused = focus && key === focus;
      return (
        <TableCell
          key={key}
          padding="none"
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

  const generateRows = () => {
    const columns = state.columns;
    let index = state.scroll.index;
    const items = [];

    do {
      if (index >= rows.length) {
        index = rows.length;
        break;
      }

      items.push(
        <TableRow
          style={{
            position: "absolute",
            top: index * rowHeight,
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
            width: "100%",
            display: "inline-table"
          }}
          className={`${
            index % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven
          }`}
          key={index}
        >
          {generateRow(columns, index)}
        </TableRow>
      );
      index++;
    } while (index < state.scroll.end);

    return items;
  };

  return (
    <Paper className={classes.wrapper}>
      <Table className={classes.tableWrapper}>
        <TableHead className={classes.tableHead}>
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
        </TableHead>
      </Table>

      <Table
        className={classes.tableContent}
        style={{
          height:
            tableHeight > state.tableHeight
              ? state.tableHeight + 2
              : tableHeight
        }}
        onScroll={onScroll}
      >
        <TableBody
          style={{
            position: "relative",
            display: "flex",
            height: state.tableHeight,
            maxHeight: state.tableHeight,
            width: "100%"
          }}
        >
          {generateRows()}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default withStyles(styles)(DataTable);
