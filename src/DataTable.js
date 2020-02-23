import React, { useState } from "react";
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

  const handleCellFocus = event => {
    //console.log("event.target = ", event.target.id);
    setFocus(event.target.id);
  };

  const getCellId = (rowIndex, columnId) => {
    return `field-${rowIndex}-${columnId}`;
  };

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
            //left: 0,
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
          {columns.map((column, i) => {
            const key = getCellId(index, column);
            return (
              <TableCell
                key={key}
                padding="none"
                className={classes.tableCell}
                onFocus={handleCellFocus}
              >
                <DataTableField
                  id={key}
                  value={rows[index][column]}
                  focused={getCellId(index, column) === focus}
                />
              </TableCell>
            );
          })}
        </TableRow>
      );
      //https://www.reddit.com/r/reactjs/comments/4a7a5u/how_do_you_deal_with_scrolling_issues_jank/
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
