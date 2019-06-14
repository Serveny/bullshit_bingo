"use strict";
const
    debug = require('debug')('wb'),
    dbCfg = require('config').db,
    mysql = require('mysql2'),
    conDB = mysql.createConnection({
        host: dbCfg.host,
        user: dbCfg.username,
        password: dbCfg.password,
        database: dbCfg.database,
        multipleStatements: false,
    });

class dbTable {
    constructor(tableName, columnNames, idField) {
        this.tableName = tableName;
        this.columnNames = columnNames;
        this.idField = idField;
    }

    createFilterStmt(filter) {
        let stmt = '';
        let data = [];
        for (let i = 0; i < filter.length; i++) {
            if (Array.isArray(filter[i])) {
                 // Check if column exists in model
                if (this.columnNames.find((columnName) => { return columnName === filter[i][0]; }) != null) {
                    debug(filter[i], Array.isArray(filter[i]));
                    const stmtVal = dbFormat(filter[i]);
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
        return new Promise(function(resolve) {
            const stmt = `SELECT * FROM ${dbCfg.database}.${_self.tableName} WHERE ${_self.idField} = ? LIMIT 1`;
            debug(`[getRowById] ${stmt}`);
            conDB.query(stmt, rowId, (err, results) => { 
                if (err) {
                    error(err);
                    
                }
                resolve(results);
            });
        });
    }

    // filter = [[ valueName, operator, value], ...]
    getRowsByValue(filter) {
        let _self = this;
        return new Promise(function(resolve) {
            const filterData = _self.createFilterStmt(filter);
            let stmt = `SELECT * FROM ${dbCfg.database}.${_self.tableName} WHERE ${filterData.stmt};`;
            debug(`[getRowsByValue] ${stmt}`, filterData.data);
            conDB.query(stmt, filterData.data, (err, results) => { 
                if (err) {
                    error(err);
                    resolve([]);
                }
                resolve(results);
            });
        });
    }

    // filter = [[ valueName, operator, value], ...]
    countRowsByValue(filter) {
        let _self = this;
        return new Promise(function(resolve) {
            const filterData = _self.createFilterStmt(filter);
            let stmt = `SELECT COUNT(*) FROM ${dbCfg.database}.${_self.tableName} WHERE ${filterData.stmt};`;
            debug(`[countRowsByValue] ${stmt}`, filterData.data);
            conDB.query(stmt, filterData.data, (err, results) => { 
                if (err) {
                    error(err);
                    resolve([]);
                }
                resolve(results[0]['COUNT(*)']);
            });
        });
    }

    getRandomRowsByValue(filterArr, limitNum) {
        let _self = this;
        return new Promise(function(resolve) {
            const filterData = _self.createFilterStmt(filterArr);
            let stmt = limitNum === 1 ?
                // more efficient
                `SELECT * FROM ${dbCfg.database}.${_self.tableName} AS r1 JOIN (SELECT CEIL(RAND() * (SELECT MAX(${_self.idField}) FROM ${dbCfg.database}.${_self.tableName})) AS id) AS r2 WHERE r1.${_self.idField} >= r2.id AND ${filterData.stmt} ORDER BY r1.${_self.idField} ASC LIMIT 1;` :
                `SELECT * FROM ${dbCfg.database}.${_self.tableName} WHERE ${filterData.stmt} ORDER BY RAND() LIMIT ${limitNum};`;
            debug(`[getRandomRowByValue] ${stmt}`, filterData.data);
            conDB.query(stmt, filterData.data, (err, results) => { 
                if (err) {
                    debug('[Error]', err);
                    resolve([]);
                }
                resolve(results);
            });
        });
    }

    // values = { valueName: value, ... }
    updateRow(id, values) {
        let _self = this;
        return new Promise(function(resolve) {
            let stmt = `UPDATE ${dbCfg.database}.${_self.tableName} SET `;

            for (const valName in values) {
                if (_self.columnNames.find((columnName) => { return columnName === valName; }) !== -1) {
                    stmt += `${valName} = '?',`;
                } else {
                    throw new Error(`Field ${valName} not in database`);
                }
            }
            stmt = stmt.slice(0, -1);
            stmt += ` WHERE id = '?'`;
    
            let data = [];
            for(const val of values) {
                data.push(val);
            }
            data.push(id);
            debug(`[updateRow] ${stmt}`);
            conDB.query(stmt, data, (err, results) => {
                if (err) {
                    debug('[Error]', err);
                    resolve([]);
                }
                resolve(results);
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
            
            let stmt = `INSERT INTO ${dbCfg.database}.${_self.tableName}(${colNames}) VALUES(${questionMarks});`;
            debug(`[createRow] ${stmt}`, dataArr);
            conDB.query(stmt, dataArr, (err, results) => {
                if (err) {
                    debug('[Error]', err);
                    resolve([]);
                }
                resolve(results);
            });
        });
    }

    deleteRow(rowId) {
        const _self = this;
        return new Promise((resolve) => {
            let stmt = `DELETE FROM ${dbCfg.database}.${_self.tableName} WHERE id = '?'`;

            debug(`[deleteRow] ${stmt}`);
            conDB.query(stmt, [rowId], (err, results) => {
                if (err) {
                    debug('[Error]', err);
                    resolve([]);
                }
                resolve(results);
            });
        });
    }
}

// #region Model
exports.word = new dbTable('word', ['wordText', 'wordCountGuessed', 'wordCountUsed', 'createdAt', 'changedAt', 'wordFlagUseForAutofill'], 'wordId');
// #endregion

// #region Format-Converter
const dbFormat = (filterI) => {
    let stmt = '';
    let val = '';

    if (filterI[2] instanceof Date) {
        // Date
        stmt = `DATE(${filterI[0]}) ${filterI[1]} ?`;
        val = dateToMysql(filterI[2]);
    } else if (typeof filterI[2] === 'string') {
        // String
        stmt = `${filterI[0]} ${filterI[1]} BINARY ?`;
        val = filterI[2];
    } else {
        // Normal
        stmt = `${filterI[0]} ${filterI[1]} ?`;
        val = filterI[2];
    }
    return [stmt, val];
};

const twoDigits = (d) => {
    if(0 <= d && d < 10) return '0' + d.toString();
    if(-10 < d && d < 0) return '-0' + (-1*d).toString();
    return d.toString();
}

const dateToMysql = (date) => {
    return date.getUTCFullYear() + '-' + twoDigits(1 + date.getUTCMonth()) + '-' + twoDigits(date.getUTCDate()) + ' ' + twoDigits(date.getUTCHours()) + ':' + twoDigits(date.getUTCMinutes()) + ':' + twoDigits(date.getUTCSeconds());
};

exports.dbFormat = dbFormat;
// #endregion