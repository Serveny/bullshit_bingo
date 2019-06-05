"use strict";
const
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

    getRowById(rowId) {
        let _self = this;
        return new Promise(function(resolve, reject) {
            conDB.query(`SELECT * FROM ${dbCfg.database}.${_self.tableName} WHERE ${_self.idField} = ?`, rowId, (err, results) => { 
                if (err) {
                    reject(err.message);
                }
                resolve(results);
            });
        });
    }

    // filter = [[ valueName, operator, value], ...]
    getRowsByValue(filter) {
        let _self = this;
        return new Promise(function(resolve, reject) {
            let stmt = `SELECT * FROM ${dbCfg.database}.${_self.tableName} WHERE `;
            let data = [];

            for (let i = 0; i < filter.length; i++) {
                // Check if column exists in model
                if (_self.columnNames.find((columnName) => { return columnName === filter[i][0]; }) != null) {
                    if (Array.isArray(filter[i])) {
                        const stmtVal = dbFormat(filter[i]);
                        stmt += stmtVal[0];
                        data.push(stmtVal[1]);
                    } else {
                        stmt += ` ${filter[i]} `;
                    }
                } else {
                    throw new Error(`Field ${valName} not in database`);
                }
            }
            stmt += ';';
            conDB.query(stmt, data, (err, results) => { 
                if (err) {
                    reject(err.message);
                }
                resolve(results);
            });
        });
    }

    // values = { valueName: value, ... }
    updateRow(id, values) {
        let _self = this;
        return new Promise(function(resolve, reject) {
            let stmt = `UPDATE ${dbCfg.database}.${_self.tableName} SET `;

            for (const valName in values) {
                if (_self.columnNames.find((columnName) => { return columnName === valName; }) !== -1) {
                    stmt += `${valName} = '?',`;
                } else {
                    throw new Error(`Field ${valName} not in database`);
                }
            }
            stmt.pop();
            stmt += ` WHERE id = '?'`;
    
            let data = [];
            for(const val of values) {
                data.push(val);
            }
            data.push(id);
    
            conDB.query(stmt, data, (err, results) => {
                if (err) {
                    reject(err.message);
                }
                resolve(results);
            });
        });
    }

    createRow(values) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let stmt = `INSERT INTO ${dbCfg.database}.${_self.tableName}(`;
            let questionMarks = '';
    
            if (_self.uuidField != null) {
                stmt += `${_self.uuidField}`;
                questionMarks += `unhex(replace(uuid(),'-',''))`;
            }
    
            if (values != null && values.length > 0) {
                if (_self.uuidField != null) { 
                    stmt += `,`;
                    questionMarks += `,`;
                }
    
                for (let i = 0; i < _self.columnNames.length; i++) {
                    stmt += _self.columnNames[i];
                    questionMarks += `?`;
        
                    if( i < (_self.columnNames.length - 1)) {
                        stmt += ',';
                        questionMarks += ',';
                    }
                }
            }
            
    
            stmt += `) VALUES(${questionMarks});`;
            conDB.query(stmt, values, (err, results, fields) => {
                if (err) {
                    reject(err.message);
                }
                resolve(results);
            });
        });
    }

    deleteRow(rowId) {
        console.log('deleteRow', rowId);
        let stmt = `DELETE FROM ${dbCfg.database}.${this.tableName} WHERE id = '?'`;

        conDB.query(stmt, [rowId], (err, results, fields) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('deleteRowById:', results, fields);
        });
    }
}

// #region Model
exports.word = new dbTable('word', ['wordText', 'wordCountGuessed', 'wordCountUsed', 'createdAt', 'changedAt'], 'wordId');
// #endregion

// #region Format-Converter
const dbFormat = (filterI) => {
    let stmt = '';
    let val = '';

    if (filterI[2] instanceof Date) {
        // Date
        stmt = `DATE(${filterI[0]}) ${filterI[1]} ?`;
        val = dateToMysql(filterI[2]);
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