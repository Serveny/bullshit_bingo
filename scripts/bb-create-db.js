'use strict';
const events = require('events'),
  mysql = require('mysql2'),
  event = new events.EventEmitter(),
  dbCfg = require('config').db,
  loginDataDB = {
    host: dbCfg.host,
    user: dbCfg.username,
    password: dbCfg.password,
    database: dbCfg.database
  };

let conDB = mysql.createConnection({
  host: loginDataDB.host,
  user: loginDataDB.user,
  password: loginDataDB.password
});

conDB.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to Database');
  event.emit('dbConnected');
});

event.on('dbConnected', () => {
  conDB.query(
    'CREATE DATABASE IF NOT EXISTS `bullshitbingo_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    function(err, result) {
      if (err) {
        throw err;
      }
      console.log('Database created');
      conDB.close();
      event.emit('dbCreated');
    }
  );
});

event.on('dbCreated', () => {
  conDB = mysql.createConnection({
    host: loginDataDB.host,
    user: loginDataDB.user,
    password: loginDataDB.password,
    database: loginDataDB.database,
    multipleStatements: true
  });

  const stamps =
    '`createdAt` datetime DEFAULT CURRENT_TIMESTAMP, `changedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
  const stmt = // Testing if main game works stable without db
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`room`(`roomId` INT NOT NULL AUTO_INCREMENT, `roomName` VARCHAR(16) NOT NULL, PRIMARY KEY (`roomId`) VISIBLE,  UNIQUE INDEX `roomName_UNIQUE` (`roomName` ASC) VISIBLE);' +
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`player` (`playerId` INT NOT NULL AUTO_INCREMENT, `playerRoomId` INT NOT NULL, `playerAvatarId` INT NULL, `playerName` VARCHAR(45) NOT NULL, `playerCustomName` VARCHAR(45) NULL, `playerIsReady` TINYINT NULL DEFAULT 0, PRIMARY KEY (`playerId`) VISIBLE);' +
    // 'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`card` (`cardId` INT NOT NULL AUTO_INCREMENT, `cardPlayerId` INT NOT NULL, `cardRoomId` INT NOT NULL, `cardText` VARCHAR(45) NULL, `cardPosX` INT NOT NULL, `cardPosY` INT NOT NULL, PRIMARY KEY (`cardId`), UNIQUE INDEX `cardId_UNIQUE` (`cardId` ASC) VISIBLE);',
    'CREATE TABLE IF NOT EXISTS `bullshitbingo_db`.`word` (`wordId` INT NOT NULL AUTO_INCREMENT, `wordText` VARCHAR(32) NOT NULL, `wordCountGuessed` INT NOT NULL DEFAULT 0, `wordCountUsed` INT NOT NULL DEFAULT 0, `wordFlagUseForAutofill` TINYINT(1) NOT NULL DEFAULT 0,' +
    stamps +
    ', PRIMARY KEY (`wordId`), UNIQUE INDEX `wordText_UNIQUE` (`wordText` ASC));';
  // console.log(stmt);
  conDB.query(stmt, err => {
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
    stmt += `INSERT INTO bullshitbingo_db.word(wordText, wordCountGuessed, wordCountUsed, wordFlagUseForAutofill) VALUES('${startWords[
      i
    ].toLowerCase()}',0,0,1);`;
  }

  conDB.query(stmt, err => {
    if (err) {
      throw err;
    }
    console.log('Tables filled');
    process.exit();
  });
});

const startWords = [
  'Hä?',
  'Meddl',
  'Ich bin nicht derjeniche',
  'Was?',
  'Häider',
  'Du Wahnsinnicher',
  'Haut der wieder voll raus',
  'assi',
  'Ledsblay',
  'ey',
  'Ich bin ein Mensch, der..',
  'Juhtub',
  'Junau',
  'Stream',
  'schneiden',
  'rendern',
  'hochladen',
  'Barren',
  'Likes',
  'Abonnentne',
  'Willkommen bei den Drachis',
  'Deutschland',
  'Scheiße bauen',
  'BLM',
  'Nadsi',
  'alder',
  'dumm',
  'Ich mach nur mei Zeuch',
  'Mobbing',
  'Wichser',
  'So',
  'Arsch aufreißne',
  'Wadd de Hell',
  'Ohne Scheiß',
  'Glasfaser',
  'Und des Geilste is..',
  'Schanze',
  'Ihr seid die Assis hier',
  'Abo-Tschädd',
  'Erdbeerchen',
  'ferddich machne',
  'Vollidiodne',
  'Hass',
  'Emotion',
  'Mett',
  'Zelad',
  'meine Gehirnzellen schmelzne',
  'Opfer',
  'Grundstück',
  'Radeln',
  '4 Drachne und der Meddl',
  'Brovogation',
  'Allegser',
  'Zeig mir die Einfahrt',
  'fotzn',
  'Brügel',
  'geblockt',
  'müde',
  '*gähnt*',
  'Arschloch',
  'im Gegensatz zu dir..',
  '*Song gegen Mobbing*',
  '*Lesbenschlager*',
  'Gesichtskrappfne'
];
