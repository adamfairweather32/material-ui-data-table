import {
  getDuplicates,
  validateColumns,
  isValidChar,
  getBlinkDirectionColour,
  isNumPad,
  isValidDate,
  translateKeyCodeToChar,
  getFormattedCurrencyValue,
  createCellId,
  filterRow,
  getColumnType,
  getUpdatedRows,
  stableSort,
  getSorting,
  getCellIdFromTarget,
  getReadonlyDisplayValue,
  getPreparedColumns
} from "./helpers";
import { NUMERIC_TYPE, CURRENCY_TYPE, ID_FIELD_PREFIX } from "../constants";

describe("getPreparedColumns", () => {
  it("should filter out columns that are hidden", () => {
    const columns = [
      {
        field: "foo",
        hidden: true
      },
      {
        field: "bar"
      }
    ];
    expect(getPreparedColumns(columns)).toEqual([{ field: "bar", index: 0 }]);
  });
  it("should filter out columns that are included in visibility list and set to not visible", () => {
    const columns = [
      {
        field: "foo"
      },
      {
        field: "bar"
      }
    ];
    const visibilities = [
      { field: "foo", headerName: "Foo Name", visible: false }
    ];
    expect(getPreparedColumns(columns, visibilities)).toEqual([
      { field: "bar", index: 0 }
    ]);
  });
  it("should prepare basic column collection", () => {
    const columns = [
      {
        field: "foo"
      },
      {
        field: "bar"
      }
    ];
    expect(getPreparedColumns(columns)).toEqual([
      { field: "foo", index: 0 },
      { field: "bar", index: 1 }
    ]);
  });
  it("should enrich auto complete columns with a map", () => {
    const columns = [
      {
        field: "bar",
        rich: {
          autoComplete: {
            options: [
              { label: "Bar Label", value: "bar" },
              { label: "Other Label", value: "other" }
            ]
          }
        }
      }
    ];
    const prepared = getPreparedColumns(columns)[0];
    expect(prepared.rich.autoComplete.options["bar"]).toEqual({
      label: "Bar Label",
      value: "bar"
    });
  });
});

describe("getReadonlyDisplayValue", () => {
  it("should throw if no column provided", () => {
    expect(() => getReadonlyDisplayValue("foo")).toThrow(
      "column parameter not provided"
    );
    expect(() => getReadonlyDisplayValue("foo", null)).toThrow(
      "column parameter not provided"
    );
    expect(() => getReadonlyDisplayValue("foo", undefined)).toThrow(
      "column parameter not provided"
    );
  });
  it("should return value if not autocomplete or date column", () => {
    expect(getReadonlyDisplayValue("foo", {})).toEqual("foo");
    expect(getReadonlyDisplayValue("foo", { rich: {} })).toEqual("foo");
    expect(
      getReadonlyDisplayValue("foo", { rich: { autoComplete: {} } })
    ).toEqual("foo");
    expect(
      getReadonlyDisplayValue("foo", {
        rich: { autoComplete: { options: [] } }
      })
    ).toEqual("foo");
    expect(
      getReadonlyDisplayValue("foo", {
        rich: { date: {} }
      })
    ).toEqual("foo");
    expect(
      getReadonlyDisplayValue("foo", {
        rich: { date: { format: "" } }
      })
    ).toEqual("foo");
  });
  it("should return autocomplete label", () => {
    const column = {
      rich: {
        autoComplete: {
          options: [
            {
              label: "foo display value",
              value: "foo"
            }
          ]
        }
      }
    };
    const preparedColumns = getPreparedColumns([column]);
    expect(getReadonlyDisplayValue("foo", preparedColumns[0])).toEqual(
      "foo display value"
    );
  });
  it("should return original value if no matching autocomplete option", () => {
    expect(
      getReadonlyDisplayValue("bar", {
        rich: {
          autoComplete: {
            options: [
              {
                label: "foo display value",
                value: "foo"
              }
            ]
          }
        }
      })
    ).toEqual("bar");
  });
  it("should return formatted date if format string provided", () => {
    expect(
      getReadonlyDisplayValue("12/10/2019", {
        rich: {
          date: {
            format: "yyyy-MM-dd"
          }
        }
      })
    ).toEqual("2019-12-10");
  });
  it("should return original value when not a date or date format string is invalid", () => {
    expect(
      getReadonlyDisplayValue("foobar", {
        rich: {
          date: {
            format: "yyyy-MM-dd"
          }
        }
      })
    ).toEqual("foobar");
    expect(
      getReadonlyDisplayValue("12/10/2019", {
        rich: {
          date: {
            format: "foobar"
          }
        }
      })
    ).toEqual("12/10/2019");
  });
});

describe("getCellIdFromTarget", () => {
  it("should get cell id straight from attribute", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => id
    };
    expect(getCellIdFromTarget(htmlElement)).toEqual(id);
  });
  it("should get cell id from children", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => null,
      children: [
        {
          getAttribute: () => id
        }
      ]
    };
    expect(getCellIdFromTarget(htmlElement)).toEqual(id);
  });
  it("should get cell id from children's children", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => null,
      children: [
        {
          getAttribute: () => null,
          children: [
            {
              getAttribute: () => id
            }
          ]
        }
      ]
    };
    expect(getCellIdFromTarget(htmlElement)).toEqual(id);
  });
  it("should return null when depth is exhausted", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => null,
      children: [
        {
          getAttribute: () => null,
          children: [
            {
              getAttribute: () => null,
              children: [
                {
                  getAttribute: () => id
                }
              ]
            }
          ]
        }
      ]
    };
    expect(getCellIdFromTarget(htmlElement, 1)).toEqual(null);
  });
  it("should get cell id from parent", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => null,
      parentElement: {
        getAttribute: () => id
      }
    };
    expect(getCellIdFromTarget(htmlElement)).toEqual(id);
  });
  it("should get cell id from parent's child", () => {
    const id = `${ID_FIELD_PREFIX}-1-foo`;
    const htmlElement = {
      getAttribute: () => null,
      parentElement: {
        getAttribute: () => null,
        children: [
          {
            getAttribute: () => id
          }
        ]
      }
    };
    expect(getCellIdFromTarget(htmlElement)).toEqual(id);
  });
});

describe("sorting", () => {
  it("should sort string fields in ascending order", () => {
    const rows = [
      {
        firstName: "Maynard"
      },
      {
        firstName: "Adam"
      },
      {
        firstName: "Danny"
      }
    ];
    const columns = [{ field: "firstName" }];
    expect(stableSort(rows, columns, getSorting("desc", "firstName"))).toEqual([
      { firstName: "Maynard" },
      { firstName: "Danny" },
      { firstName: "Adam" }
    ]);
  });
  it("should sort string fields in descending order", () => {
    const rows = [
      {
        firstName: "Maynard"
      },
      {
        firstName: "Adam"
      },
      {
        firstName: "Danny"
      }
    ];
    const columns = [{ field: "firstName" }];
    expect(stableSort(rows, columns, getSorting("asc", "firstName"))).toEqual([
      { firstName: "Adam" },
      { firstName: "Danny" },
      { firstName: "Maynard" }
    ]);
  });
  it("should sort numerical in ascending order", () => {
    const rows = [
      {
        cost: 20
      },
      {
        cost: 10
      },
      {
        cost: 30
      }
    ];
    const columns = [{ field: "cost" }];
    expect(stableSort(rows, columns, getSorting("asc", "cost"))).toEqual([
      { cost: 10 },
      { cost: 20 },
      { cost: 30 }
    ]);
  });
  it("should sort numerical in descending order", () => {
    const rows = [
      {
        cost: 20
      },
      {
        cost: 10
      },
      {
        cost: 30
      }
    ];
    const columns = [{ field: "cost" }];
    expect(stableSort(rows, columns, getSorting("desc", "cost"))).toEqual([
      { cost: 30 },
      { cost: 20 },
      { cost: 10 }
    ]);
  });
  it("should sort dates in ascending order", () => {
    const rows = [
      {
        date: "2019-10-11"
      },
      {
        date: "2019-10-12"
      },
      {
        date: "2019-10-10"
      }
    ];
    const columns = [{ field: "date" }];
    expect(stableSort(rows, columns, getSorting("asc", "date"))).toEqual([
      {
        date: "2019-10-10"
      },
      {
        date: "2019-10-11"
      },
      {
        date: "2019-10-12"
      }
    ]);
  });
  it("should sort dates in descending order", () => {
    const rows = [
      {
        date: "2019-10-11"
      },
      {
        date: "2019-10-12"
      },
      {
        date: "2019-10-10"
      }
    ];
    const columns = [{ field: "date" }];
    expect(stableSort(rows, columns, getSorting("desc", "date"))).toEqual([
      {
        date: "2019-10-12"
      },
      {
        date: "2019-10-11"
      },
      {
        date: "2019-10-10"
      }
    ]);
  });
});

describe("getUpdatedRows", () => {
  it("should return empty row set if no rows defined", () => {
    expect(getUpdatedRows("bar", { foo: "fee" }, "foo")).toEqual(undefined);
    expect(getUpdatedRows("bar", { foo: "fee" }, "foo", null)).toEqual(null);
    expect(getUpdatedRows("bar", { foo: "fee" }, "foo", [])).toEqual([]);
  });
  //this should never happen because there are validators that stop us getting
  //this far. I don't want a check to ensure that every row has an id field
  //as it's unnecessary
  it("should throw if no id field available", () => {
    const originalRows = [{ foo: "fee", doh: "ray" }];
    const newRow = { foo: "bar", doh: "ray" };
    expect(() => getUpdatedRows("ray", newRow, "foo", originalRows)).toThrow(
      "index of changed row could not be located in collection"
    );
  });
  it("should throw if id cannot be found in original row set", () => {
    const originalRows = [{ id: 1, foo: "fee" }, { id: 2, foo: "bar" }];
    const newRow = { id: 3, foo: "ray" };
    expect(() => getUpdatedRows("ray", newRow, "foo", originalRows)).toThrow(
      "index of changed row could not be located in collection"
    );
  });
  it("should return updated row", () => {
    const originalRows = [{ id: 1, foo: "fee", doh: "ray" }];
    const newRow = { id: 1, foo: "bar", doh: "ray" };
    const updatedRows = [{ id: 1, foo: "bar", doh: "ray" }];
    expect(getUpdatedRows("bar", newRow, "foo", originalRows)).toEqual(
      updatedRows
    );
  });
  it("should return updated row using row comparator", () => {
    const originalRows = [{ someOtherId: 1, foo: "fee", doh: "ray" }];
    const newRow = { someOtherId: 1, foo: "bar", doh: "ray" };
    const updatedRows = [{ someOtherId: 1, foo: "bar", doh: "ray" }];
    expect(
      getUpdatedRows(
        "bar",
        newRow,
        "foo",
        originalRows,
        (r1, r2) => r1.someOtherId === r2.someOtherId
      )
    ).toEqual(updatedRows);
  });
  it("should return updated rows", () => {
    const originalRows = [
      { id: 1, foo: "fee", doh: "ray" },
      { id: 2, foo: "blee", doh: "bloo" }
    ];
    const newRow = { id: 1, foo: "bar", doh: "ray" };
    const updatedRows = [
      { doh: "ray", foo: "bar", id: 1 },
      { doh: "bloo", foo: "blee", id: 2 }
    ];
    expect(getUpdatedRows("bar", newRow, "foo", originalRows)).toEqual(
      updatedRows
    );
  });
});

describe("getColumnType", () => {
  it("should get combo type", () => {
    expect(
      getColumnType({ rich: { autoComplete: { options: ["foo"] } } })
    ).toEqual("combo");
  });
  it("should get date type", () => {
    expect(getColumnType({ rich: { date: {} } })).toEqual("date");
  });
  it("should default to text type", () => {
    expect(getColumnType({})).toEqual("text");
    expect(getColumnType({ foo: "bar" })).toEqual("text");
    expect(getColumnType({ rich: {} })).toEqual("text");
    expect(getColumnType({ rich: { autoComplete: {} } })).toEqual("text");
    expect(getColumnType({ rich: { autoComplete: { options: [] } } })).toEqual(
      "text"
    );
  });
});

describe("getBlinkDirectionColour", () => {
  it("should provide correct blink colour or null", () => {
    expect(getBlinkDirectionColour(10, 9)).toEqual("blue");
    expect(getBlinkDirectionColour(10, 10)).toEqual(null);
    expect(getBlinkDirectionColour(9, 10)).toEqual("red");
    expect(getBlinkDirectionColour(9)).toEqual(null);
    expect(getBlinkDirectionColour()).toEqual(null);
    expect(getBlinkDirectionColour("foo", "foo")).toEqual(null);
  });
});

describe("createCellId", () => {
  it("should create cell id", () => {
    expect(createCellId("foo", "bar")).toEqual("field-foo-bar");
  });
});

describe("filterRow", () => {
  it("should find search string in row using wildcard match", () => {
    const row = { field1: "football", field2: "boots 123", field3: 4 };
    const columns = [
      { field: "field1" },
      { field: "field2" },
      { field: "field3" }
    ];
    expect(filterRow(row, columns, "foo")).toEqual(true);
    expect(filterRow(row, columns, "ba")).toEqual(true);
    expect(filterRow(row, columns, "all")).toEqual(true);
    expect(filterRow(row, columns, "FOO")).toEqual(true);
    expect(filterRow(row, columns, "BA")).toEqual(true);
    expect(filterRow(row, columns, "ALL")).toEqual(true);
    expect(filterRow(row, columns, "1")).toEqual(true);
    expect(filterRow(row, columns, "3")).toEqual(true);
    expect(filterRow(row, columns, "2")).toEqual(true);
    expect(filterRow(row, columns, "123")).toEqual(true);
    expect(filterRow(row, columns, "4")).toEqual(true);
    expect(filterRow(row, columns, 4)).toEqual(true);
  });
  it("should not find search string in row", () => {
    const row = { field1: "football", field2: "boots" };
    const columns = [{ field: "field1" }, { field: "field2" }];
    expect(filterRow(row, columns, "bar")).toEqual(false);
  });
  it("should return row if search text is blank", () => {
    const row = { field1: "football", field2: "boots" };
    const columns = [{ field: "field1" }, { field: "field2" }];
    expect(filterRow(row, columns, "")).toEqual(true);
    expect(filterRow(row, columns)).toEqual(true);
  });
  it("should be able to search lookup labels and not their values", () => {
    const row = { field1: "bar", field2: "boots" };
    const columns = [
      {
        field: "field1",
        rich: {
          autoComplete: {
            options: [{ label: "foo", value: "bar" }]
          }
        }
      },
      { field: "field2" }
    ];
    expect(filterRow(row, columns, "foo")).toEqual(true);
    expect(filterRow(row, columns, "bar")).toEqual(false);
  });
});

describe("isNumPad", () => {
  it("should return true when number pad", () => {
    expect(isNumPad(96)).toEqual(true);
    expect(isNumPad(105)).toEqual(true);
  });
  it("should return false when not number pad", () => {
    expect(isNumPad(95)).toEqual(false);
    expect(isNumPad(106)).toEqual(false);
  });
});

describe("isValidDate", () => {
  it("should return true when in valid date", () => {
    expect(isValidDate("2019-10-12")).toEqual(true);
    expect(isValidDate("12/10/2019")).toEqual(true);
  });
  it("should return false when not valid date", () => {
    expect(isValidDate("foo")).toEqual(false);
  });
});

describe("translateKeyCodeToChar", () => {
  it("should translate key code character", () => {
    expect(translateKeyCodeToChar("96")).toEqual("0");
    expect(translateKeyCodeToChar(96)).toEqual("0");
    expect(translateKeyCodeToChar("95")).toEqual("_");
    expect(translateKeyCodeToChar("106")).toEqual("j");
    expect(translateKeyCodeToChar("189")).toEqual("½");
    expect(translateKeyCodeToChar("190")).toEqual("¾");
  });
});

describe("getFormattedCurrencyValue", () => {
  it("should format value to currency with thousands separators and without symbol", () => {
    expect(getFormattedCurrencyValue(10000)).toEqual("10,000");
  });
  it("should format value to currency with thousands separators and symbol", () => {
    expect(getFormattedCurrencyValue(10000, true)).toEqual("£10,000");
  });
  it("should format negative value with brackets ", () => {
    expect(getFormattedCurrencyValue(-10000, false)).toEqual("(10,000)");
    expect(getFormattedCurrencyValue(-10000, true)).toEqual("(£10,000)");
  });
  it("should format decimal numbers to N decimal places ", () => {
    expect(getFormattedCurrencyValue(1.2356, true)).toEqual("£1.24");
    expect(getFormattedCurrencyValue(1.2356, false)).toEqual("1.24");
    expect(getFormattedCurrencyValue(-1.2356, true)).toEqual("(£1.24)");
    expect(getFormattedCurrencyValue(-1.2356, false)).toEqual("(1.24)");
    expect(getFormattedCurrencyValue(10000.2356, true)).toEqual("£10,000.24");
    expect(getFormattedCurrencyValue(10000.2356, false)).toEqual("10,000.24");
    expect(getFormattedCurrencyValue(-10000.2356, true)).toEqual(
      "(£10,000.24)"
    );
    expect(getFormattedCurrencyValue(-10000.2356, false)).toEqual(
      "(10,000.24)"
    );
  });
});

describe("isValidChar", () => {
  it("should return true when valid alpha numeric character", () => {
    expect(isValidChar("a")).toEqual(true);
    expect(isValidChar("A")).toEqual(true);
    expect(isValidChar(1)).toEqual(true);
    expect(isValidChar("1")).toEqual(true);
  });

  it("should return false when not a valid alpha numeric character", () => {
    expect(isValidChar(".")).toEqual(false);
  });

  it("should accept - and . when numeric only", () => {
    expect(isValidChar(".", NUMERIC_TYPE)).toEqual(true);
    expect(isValidChar("-", NUMERIC_TYPE)).toEqual(true);
    expect(isValidChar(".", CURRENCY_TYPE)).toEqual(true);
    expect(isValidChar("-", CURRENCY_TYPE)).toEqual(true);
  });
});

describe("validateColumns", () => {
  it("should not throw when columns are valid", () => {
    expect(() =>
      validateColumns([
        {
          field: "id"
        },
        {
          field: "foo"
        },
        {
          field: "bar"
        }
      ])
    ).not.toThrow();
  });
  it("should throw when no columns specified", () => {
    expect(() => validateColumns()).toThrow("No columns provided!");
    expect(() => validateColumns([])).toThrow("No columns provided!");
  });
  it("should throw when columns don't contain field property", () => {
    expect(() =>
      validateColumns([
        {
          foo: "foo"
        },
        {
          bar: "foo"
        }
      ])
    ).toThrow("columns must all include a field property");
    expect(() =>
      validateColumns([
        {
          field: "foo"
        },
        {
          bar: "foo"
        }
      ])
    ).toThrow("columns must all include a field property");
  });
  it("should throw when no id field specified", () => {
    expect(() =>
      validateColumns([
        {
          field: "foo"
        },
        {
          field: "bar"
        }
      ])
    ).toThrow("columns must include an id field");
  });
  it("should throw when trying to use reserved fields", () => {
    expect(() =>
      validateColumns(
        [
          {
            field: "id"
          },
          {
            field: "foo"
          },
          {
            field: "bar"
          }
        ],
        ["foo"]
      )
    ).toThrow("The following columns are reserved: foo");
  });
  it("should throw when duplicate columns are found", () => {
    expect(() =>
      validateColumns([
        {
          field: "id"
        },
        {
          field: "foo"
        },
        {
          field: "foo"
        }
      ])
    ).toThrow("The following columns appear more than once: foo");
  });
  it("should throw when parent header name is provided but not on all fields", () => {
    expect(() =>
      validateColumns([
        {
          field: "id",
          hidden: true
        },
        {
          field: "foo",
          parentHeaderName: "General"
        },
        {
          field: "bar"
        }
      ])
    ).toThrow(
      "parentHeaderName field must be set on ALL columns if it is provided"
    );
  });
  it("should not throw when parent header name is not provided on a hidden column", () => {
    expect(() =>
      validateColumns([
        {
          field: "id",
          hidden: true
        },
        {
          field: "foo",
          parentHeaderName: "General"
        },
        {
          field: "bar",
          parentHeaderName: "General"
        }
      ])
    ).not.toThrow();
  });
});

describe("getDuplicates", () => {
  it("should not return duplicates", () => {
    expect(
      getDuplicates(
        [
          {
            field: "foo"
          },
          {
            field: "bar"
          }
        ],
        f => f.field
      )
    ).toEqual([]);
  });
  it("should return duplicates", () => {
    expect(
      getDuplicates(
        [
          {
            field: "foo"
          },
          {
            field: "bar"
          },
          {
            field: "foo"
          }
        ],
        f => f.field
      )
    ).toEqual(["foo"]);
  });
  it("should return duplicates with default key selector if none provided", () => {
    expect(getDuplicates(["foo", "bar", "foo"])).toEqual(["foo"]);
  });
});
