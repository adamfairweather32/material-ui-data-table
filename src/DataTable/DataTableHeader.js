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
    tableCellHeadDiv: {
        paddingLeft: "5px",
    },
    tableRow: {
        display: "table-row",
    }
});

const DataTableHeader = ({ classes, columns, rowHeight }) => {
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
              {columns.map((name, i) => (
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
              {columns.map((name, i) => (
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

  return renderHeader();
};

export default withStyles(styles)(DataTableHeader);
