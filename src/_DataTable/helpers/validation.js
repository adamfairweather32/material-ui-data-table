import _ from "lodash";
import { getDuplicates } from "./helpers";

const getRuleRuns = (row, rules, rows) => {
  const mappedRules = _.keyBy(rules, r => r.field);
  if (rules) {
    const fields = _.intersection(rules.map(r => r.field), Object.keys(row));
    if (fields.length !== rules.length) {
      console.warn(
        "One or more rule(s) have been ignored. Have they got the correct field names defined?"
      );
    }
    return (
      fields
        .map(field => {
          const value = row[field];
          const rule = mappedRules[field];
          return {
            field,
            message: rule.getMessage(value, rows)
          };
        })
        .filter(r => r.message) || []
    );
  }
  return [];
};

const throwIfDuplicatesFound = rules => {
  if (
    getDuplicates(rules.filter(r => r.level === "warn"), r => r.field).length >
    0
  ) {
    throw new Error(`Duplicate warning rules detected`);
  }
  if (
    getDuplicates(rules.filter(r => r.level === "error"), r => r.field).length >
    0
  ) {
    throw new Error(`Duplicate error rules detected`);
  }
};

const getValidatedRows = (rows = [], rules = []) => {
  if (!rules || !rules.length || !rows || !rows.length) {
    return rows;
  }

  throwIfDuplicatesFound(rules);

  return rows.reduce((acc, row) => {
    const errors = getRuleRuns(
      row,
      rules.filter(r => r.level === "error"),
      rows
    );
    const warnings = getRuleRuns(
      row,
      rules.filter(r => r.level === "warn"),
      rows
    );
    const validations = {
      errors: _.keyBy(errors, e => e.field),
      warnings: _.keyBy(warnings, e => e.field)
    };
    acc.push({
      ...row,
      validations
    });
    return acc;
  }, []);
};

export default getValidatedRows;
