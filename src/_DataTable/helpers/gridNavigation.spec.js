import {
  moveHorizontal,
  moveVertical,
  getGridNavigationMap
} from "./gridNavigation";
import * as helpersModule from "./helpers";
import { ID_FIELD_PREFIX } from "../constants";
//jest.mock("./helpers"); //NOT SUPPORTED in CodeSandbox!

describe("getGridNavigationMap", () => {
  it("should build expected navigation map", () => {
    const rows = [
      {
        id: 1,
        firstName: "Bob",
        lastName: "Jones",
        occupation: "CARP",
        dateQualified: "2019-10-01"
      },
      {
        id: 2,
        firstName: "Fred",
        lastName: "Grimble",
        occupation: "ELEC",
        dateQualified: "2019-10-11"
      }
    ];
    const columns = [
      {
        field: "firstName"
      },
      {
        field: "lastName"
      },
      {
        field: "occupation",
        rich: {
          autoComplete: {
            options: [
              { label: "Electrician", value: "ELEC" },
              { label: "Carpenter", value: "CARP" }
            ]
          }
        }
      },
      {
        field: "dateQualified",
        rich: { date: {} }
      }
    ];
    expect(getGridNavigationMap(rows, columns)).toEqual({
      idToPositionMap: {
        "1": {
          dateQualified: { columnIndex: 3, rowIndex: 0, type: "date" },
          firstName: { columnIndex: 0, rowIndex: 0, type: "text" },
          lastName: { columnIndex: 1, rowIndex: 0, type: "text" },
          occupation: { columnIndex: 2, rowIndex: 0, type: "combo" }
        },
        "2": {
          dateQualified: { columnIndex: 3, rowIndex: 1, type: "date" },
          firstName: { columnIndex: 0, rowIndex: 1, type: "text" },
          lastName: { columnIndex: 1, rowIndex: 1, type: "text" },
          occupation: { columnIndex: 2, rowIndex: 1, type: "combo" }
        }
      },
      positionToIdMap: {
        "0": {
          "0": "field-1-firstName",
          "1": "field-1-lastName",
          "2": "field-1-occupation",
          "3": "field-1-dateQualified"
        },
        "1": {
          "0": "field-2-firstName",
          "1": "field-2-lastName",
          "2": "field-2-occupation",
          "3": "field-2-dateQualified"
        }
      }
    });
  });

  it("should only use columns specified as part of column list when building map", () => {
    const rows = [
      {
        id: 1,
        firstName: "Bob",
        lastName: "Jones",
        occupation: "CARP",
        dateQualified: "2019-10-01"
      },
      {
        id: 2,
        firstName: "Fred",
        lastName: "Grimble",
        occupation: "ELEC",
        dateQualified: "2019-10-11"
      }
    ];
    const columns = [
      {
        field: "firstName"
      },
      {
        field: "lastName"
      }
    ];
    expect(getGridNavigationMap(rows, columns)).toEqual({
      idToPositionMap: {
        "1": {
          firstName: { columnIndex: 0, rowIndex: 0, type: "text" },
          lastName: { columnIndex: 1, rowIndex: 0, type: "text" }
        },
        "2": {
          firstName: { columnIndex: 0, rowIndex: 1, type: "text" },
          lastName: { columnIndex: 1, rowIndex: 1, type: "text" }
        }
      },
      positionToIdMap: {
        "0": {
          "0": "field-1-firstName",
          "1": "field-1-lastName"
        },
        "1": {
          "0": "field-2-firstName",
          "1": "field-2-lastName"
        }
      }
    });
  });
  it("should reject when no id field provided to build map with", () => {
    const columns = [{ field: "id" }];
    expect(() =>
      getGridNavigationMap([{ foo: "bar" }, { bar: "foo" }], columns)
    ).toThrow("One or more rows are missing an id property");
    expect(() =>
      getGridNavigationMap(
        [{ id: null, foo: "bar" }, { id: null, bar: "foo" }],
        columns
      )
    ).toThrow("One or more rows are missing an id property");
    expect(() =>
      getGridNavigationMap(
        [{ id: undefined, foo: "bar" }, { id: undefined, bar: "foo" }],
        columns
      )
    ).toThrow("One or more rows are missing an id property");
    expect(() =>
      getGridNavigationMap(
        [{ id: 1, foo: "bar" }, { id: null, bar: "foo" }],
        columns
      )
    ).toThrow("One or more rows are missing an id property");
  });
  it("should reject duplicate ids when building map", () => {
    const rows = [{ id: 1, foo: "bar" }, { id: 1, bar: "foo" }];
    const columns = [{ field: "id" }];
    expect(() => getGridNavigationMap(rows, columns)).toThrow(
      "Duplicate ids found in row collection"
    );
  });
  it("should throw when no columns provided", () => {
    expect(() => getGridNavigationMap([])).toThrow("No columns provided");
    expect(() => getGridNavigationMap([], null)).toThrow("No columns provided");
    expect(() => getGridNavigationMap([], undefined)).toThrow(
      "No columns provided"
    );
    expect(() => getGridNavigationMap([], [])).toThrow("No columns provided");
  });
  it("should return empty map when no rows provided", () => {
    const rows = [];
    const columns = [{ field: "firstName" }, { field: "lastName" }];
    expect(getGridNavigationMap(rows, columns)).toEqual({});
  });
});

describe("moveHorizontal and moveVertical", () => {
  it("should throw when invalid direction provided", () => {
    expect(() => moveHorizontal("foo", 1, {})).toThrow(
      "direction was not one of the expected values: left,right"
    );
    expect(() => moveVertical("foo", 1, {})).toThrow(
      "direction was not one of the expected values: up,down"
    );
  });
  it("should move to left end of table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];

    moveHorizontal(
      "left",
      `${ID_FIELD_PREFIX}-1-firstName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-rank");
  });

  it("should move not move left when already at left end of table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveHorizontal(
      "left",
      `${ID_FIELD_PREFIX}-1-rank`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-rank", true);
  });

  it("should move to right end of table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];

    moveHorizontal(
      "right",
      `${ID_FIELD_PREFIX}-1-firstName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-lastName");
  });

  it("should move not move right when already at right end of table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveHorizontal(
      "right",
      `${ID_FIELD_PREFIX}-1-lastName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-lastName", true);
  });

  it("should move down table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveVertical(
      "down",
      `${ID_FIELD_PREFIX}-1-lastName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-2-lastName");
  });

  it("should move up table", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveVertical(
      "up",
      `${ID_FIELD_PREFIX}-2-lastName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-lastName");
  });

  it("should not move up table when already at top", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveVertical(
      "up",
      `${ID_FIELD_PREFIX}-1-lastName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-1-lastName", true);
  });

  it("should not move down table when already at bottom", () => {
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank" },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveVertical(
      "down",
      `${ID_FIELD_PREFIX}-2-lastName`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).toHaveBeenCalledWith("field-2-lastName", true);
  });

  it("should not move down if combo is being edited", () => {
    helpersModule.cellIsEditing = jest.fn(() => true);
    helpersModule.focus = jest.fn(() => {});
    const rows = [
      {
        id: 1,
        rank: "General",
        firstName: "Bob",
        lastName: "Jones"
      },
      {
        id: 2,
        rank: "Sergeant",
        firstName: "James",
        lastName: "Brooks"
      }
    ];
    const columns = [
      { field: "rank", rich: { autoComplete: { options: ["foo"] } } },
      { field: "firstName" },
      { field: "lastName" }
    ];
    moveVertical(
      "down",
      `${ID_FIELD_PREFIX}-1-rank`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).not.toHaveBeenCalled();

    moveVertical(
      "up",
      `${ID_FIELD_PREFIX}-2-rank`,
      getGridNavigationMap(rows, columns)
    );
    expect(helpersModule.focus).not.toHaveBeenCalled();
  });
});
