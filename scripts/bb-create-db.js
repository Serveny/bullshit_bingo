'use strict';
const events = require('events'),
  { Client } = require('pg'),
  dbCfg = require('config').db,
  client = new Client({
    user: dbCfg.username,
    host: dbCfg.host,
    database: dbCfg.database,
    password: dbCfg.password,
    port: dbCfg.port,
  }),
  event = new events.EventEmitter();

client.connect((err) => {
  if (err) {
    console.error('connection error (1)', err.stack);
    throw err;
  }
  console.log('Connected to Database');
  event.emit('dbConnected');
});

// event.on('dbConnected', () => {
//   client.query(`
//     CREATE DATABASE bullshitbingo_db
//     WITH
//     OWNER = bullshitbingo
//     ENCODING = 'UTF8'
//     CONNECTION LIMIT = -1;`,
//     function(err, result) {
//       if (err) {
//         console.error('connection error (2)', err.stack);
//         throw err;
//       }
//       console.log('Database created');
//       conDB.close();
//       event.emit('dbCreated');
//     }
//   );
// });

event.on('dbConnected', () => {
  client.query(
    `
  CREATE SCHEMA bb
    AUTHORIZATION bullshitbingo;`,
    function (err, result) {
      if (err) {
        throw err;
      }
      console.log('Schema created');
      event.emit('schemaCreated');
    }
  );
});

event.on('schemaCreated', () => {
  // const stamps =
  //   '`createdAt` datetime DEFAULT CURRENT_TIMESTAMP, `changedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
  const stmt =
    // Testing if main game works stable without db
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`room`(`roomId` INT NOT NULL AUTO_INCREMENT, `roomName` VARCHAR(16) NOT NULL, PRIMARY KEY (`roomId`) VISIBLE,  UNIQUE INDEX `roomName_UNIQUE` (`roomName` ASC) VISIBLE);' +
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`player` (`playerId` INT NOT NULL AUTO_INCREMENT, `playerRoomId` INT NOT NULL, `playerAvatarId` INT NULL, `playerName` VARCHAR(45) NOT NULL, `playerCustomName` VARCHAR(45) NULL, `playerIsReady` TINYINT NULL DEFAULT 0, PRIMARY KEY (`playerId`) VISIBLE);' +
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`card` (`cardId` INT NOT NULL AUTO_INCREMENT, `cardPlayerId` INT NOT NULL, `cardRoomId` INT NOT NULL, `cardText` VARCHAR(45) NULL, `cardPosX` INT NOT NULL, `cardPosY` INT NOT NULL, PRIMARY KEY (`cardId`), UNIQUE INDEX `cardId_UNIQUE` (`cardId` ASC) VISIBLE);',
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`word` (`wordId` INT NOT NULL AUTO_INCREMENT, `wordText` VARCHAR(32) NOT NULL, `wordCountGuessed` INT NOT NULL DEFAULT 0, `wordCountUsed` INT NOT NULL DEFAULT 0, `wordFlagUseForAutofill` TINYINT(1) NOT NULL DEFAULT 0,' +
    // stamps +
    //', PRIMARY KEY (`wordId`), UNIQUE INDEX `wordText_UNIQUE` (`wordText` ASC));';
    `CREATE TABLE bb.word
    (
        "wordId" serial NOT NULL,
        "wordText" name NOT NULL,
        "wordCountGuessed" integer,
        "wordCountUsed" integer,
        "wordFlagUseForAutofill" boolean,
        "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
        "changedAt" timestamp without time zone NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("wordId")
    );
    
    ALTER TABLE bb.word
      OWNER to bullshitbingo;

    ALTER TABLE bb.word
      ADD CONSTRAINT "wordTextUnique" UNIQUE ("wordText");`;
  // console.log(stmt);
  client.query(stmt, (err) => {
    if (err) {
      throw err;
    }
    console.log('Tables created');
    event.emit('tablesCreated');
  });
});

event.on('tablesCreated', () => {
  let stmt = ``;
  for (let i = 0; i < startWords.length; i++) {
    stmt += `INSERT INTO bb.word(
      "wordText", "wordCountGuessed", "wordCountUsed", "wordFlagUseForAutofill")
      VALUES ('${startWords[i].toLowerCase()}',0,0,true);`;
  }

  client.query(stmt, (err) => {
    if (err) {
      throw err;
    }
    console.log('Tables filled');
    process.exit();
  });
});

const startWords = ['hello', 'bye', '*cough*', 'wtf', 'wow', 'stonks'];
