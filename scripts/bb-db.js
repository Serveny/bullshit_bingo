'use strict';
const debug = require('debug')('wb'),
  { Client } = require('pg'),
  dbCfg = require('config').db,
  client = new Client({
    user: dbCfg.username,
    host: dbCfg.host,
    database: dbCfg.database,
    password: dbCfg.password,
    port: dbCfg.port,
  });

client.connect(err => {
  if (err) {
    console.error('connection error (1)', err.stack);
    throw err;
  }
  console.log('Connected to Database');
});

class dbTable {
  constructor(tableName, columnNames, idField) {
    this.tableName = tableName;
    this.columnNames = columnNames;
    this.idField = idField;
    this.fullName = `"${dbCfg.schemata}"."${this.tableName}"`;
  }

  createFilterStmt(filter) {
    let stmt = '';
    let data = [];
    let paramCount = 0;
    for (let i = 0; i < filter.length; i++) {
      if (Array.isArray(filter[i])) {
        // Check if column exists in model
        if (
          this.columnNames.find(columnName => {
            return columnName === filter[i][0];
          }) != null
        ) {
          debug(filter[i], Array.isArray(filter[i]));
          const stmtVal = dbFormat(filter[i], this.tableName, ++paramCount);
          stmt += stmtVal[0];
          data.push(stmtVal[1]);
        } else {
          debug(`[Error] Field ${columnName} not in database`);
        }
      } else {
        stmt += ` ${filter[i]} `;
      }
    }
    return { stmt: stmt, data: data };
  }

  getRowById(rowId) {
    let _self = this;
    return new Promise((resolve) => {
      const stmt = `SELECT * FROM ${_self.fullName} WHERE ${
        _self.idField
      } = ? LIMIT 1`;
      debug(`[getRowById] ${stmt}`);
      client.query(stmt, rowId, (err, res) => {
        if (err) {
          error(err);
        }
        resolve(res);
      });
    });
  }

  // filter = [[ valueName, operator, value], ...]
  getRowsByValue(filter) {
    let _self = this;
    return new Promise((resolve) => {
      const filterData = _self.createFilterStmt(filter);
      let stmt = `SELECT * FROM ${_self.fullName} WHERE ${filterData.stmt};`;
      debug(`[getRowsByValue] ${stmt}`, filterData.data);
      client.query(stmt, filterData.data, (err, res) => {
        if (err) {
          error(err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }

  // filter = [[ valueName, operator, value], ...]
  countRowsByValue(filter) {
    let _self = this;
    return new Promise((resolve) => {
      const filterData = _self.createFilterStmt(filter);
      let stmt = `SELECT COUNT(*) FROM ${_self.fullName} WHERE ${
        filterData.stmt
      };`;
      debug(`[countRowsByValue] ${stmt}`, filterData.data);
      client.query(stmt, filterData.data, (err, res) => {
        if (err) {
          error(err);
          resolve([]);
        }
        resolve(res[0]['COUNT(*)']);
      });
    });
  }

  getRandomRowsByValue(filterArr, limitNum) {
    let _self = this;
    return new Promise((resolve) => {
      const filterData = _self.createFilterStmt(filterArr);
      let stmt = `SELECT * FROM ${_self.fullName} `;
      stmt += filterData != null ? `WHERE ${filterData.stmt} ` : '';
      stmt += `ORDER BY random() LIMIT ${limitNum};`;
      debug(`[getRandomRowByValue] ${stmt}`, filterData.data);
      client.query(stmt, filterData.data, (err, res) => {
        if (err) {
          debug('[Error]', err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }

  // values = { valueName: value, ... }
  updateRow(id, values) {
    let _self = this;
    return new Promise((resolve) => {
      let stmt = `UPDATE ${_self.fullName} SET `;
      let data = [];
      for (const valName in values) {
        if (
          _self.columnNames.find(columnName => {
            return columnName === valName;
          }) !== -1
        ) {
          stmt += `${valName} = '?',`;
          data.push(values[valName]);
        } else {
          throw new Error(`Field ${valName} not in database`);
        }
      }
      stmt = stmt.slice(0, -1);
      stmt += ` WHERE ${_self.idField} = '?'`;

      data.push(id);
      debug(`[updateRow] ${stmt}`);
      client.query(stmt, data, (err, res) => {
        if (err) {
          debug('[Error]', err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }

  // values = { columnName: value, ... }
  createRow(valuesObj) {
    let _self = this;
    return new Promise((resolve) => {
      let colNames = '';
      let questionMarks = '';
      let dataArr = [];
      for (const colName in valuesObj) {
        colNames += '`' + colName + '`,';
        questionMarks += `?,`;
        dataArr.push(valuesObj[colName]);
      }

      colNames = colNames.slice(0, -1);
      questionMarks = questionMarks.slice(0, -1);

      let stmt = `INSERT INTO ${
        _self.fullName
      }(${colNames}) VALUES(${questionMarks});`;
      debug(`[createRow] ${stmt}`, dataArr);
      client.query(stmt, dataArr, (err, res) => {
        if (err) {
          debug('[Error]', err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }

  deleteRow(rowId) {
    const _self = this;
    return new Promise(resolve => {
      let stmt = `DELETE FROM ${_self.fullName} WHERE id = '?'`;

      debug(`[deleteRow] ${stmt}`);
      client.query(stmt, [rowId], (err, res) => {
        if (err) {
          debug('[Error]', err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }

  query(stmt) {
    return new Promise(resolve => {
      debug(`[query] ${stmt}`);
      client.query(stmt, (err, res) => {
        if (err) {
          debug('[Error]', err);
          resolve([]);
        }
        resolve(res);
      });
    });
  }
}

// #region Model
exports.word = new dbTable(
  'word',
  [
    'wordText',
    'wordCountGuessed',
    'wordCountUsed',
    'createdAt',
    'changedAt',
    'wordFlagUseForAutofill'
  ],
  'wordId'
);
// #endregion

// #region Format-Converter
const dbFormat = (filterI, tableName, paramCount) => {
  let stmt = '';
  let val = '';

  if (filterI[2] instanceof Date) {
    // Date
    stmt = `DATE(${tableName}."${filterI[0]}") ${filterI[1]} $${paramCount}`;
    val = dateToMysql(filterI[2]);
  } else if (typeof filterI[2] === 'boolean') {
    // Boolean
    stmt = `${tableName}."${filterI[0]}" ${filterI[1]} $${paramCount}`;
    val = filterI[2];
  } else if (typeof filterI[2] === 'string') {
    // String
    stmt = `${tableName}."${filterI[0]}" ${filterI[1]} BINARY $${paramCount}`;
    val = filterI[2];
  } else {
    // Normal
    stmt = `${tableName}."${filterI[0]}" ${filterI[1]} $${paramCount}`;
    val = filterI[2];
  }
  return [stmt, val];
};

const twoDigits = (d) => {
  if (0 <= d && d < 10) return '0' + d.toString();
  if (-10 < d && d < 0) return '-0' + (-1 * d).toString();
  return d.toString();
};

const dateToMysql = (date) => {
  return (
    date.getUTCFullYear() +
    '-' +
    twoDigits(1 + date.getUTCMonth()) +
    '-' +
    twoDigits(date.getUTCDate()) +
    ' ' +
    twoDigits(date.getUTCHours()) +
    ':' +
    twoDigits(date.getUTCMinutes()) +
    ':' +
    twoDigits(date.getUTCSeconds())
  );
};

exports.dbFormat = dbFormat;
// #endregion
