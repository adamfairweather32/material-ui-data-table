import React from "react";
import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import clsx from "clsx";

const styles = () => ({
  tableCell: {
    letterSpacing: "0",
    fontSize: "1rem",
    width: "6rem",
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
  }
});

const DataTableFooter = ({ classes, columns, rowHeight }) => {
  return <div className={classes.tableRow} 
        style={{
        height: rowHeight,
        lineHeight: `${rowHeight}px`,
      }}>
      {columns.map((name, i) => (
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
  </div>;
};

export default withStyles(styles)(DataTableFooter);
