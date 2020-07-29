const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const ini = require('ini');
const path = require('path');

const dbName = 'places.sqlite';
const homedir = require('os').homedir();
const firefoxPath = path.join(homedir, '.mozilla', 'firefox');
const firefoxConfigPath = path.join(firefoxPath, 'profiles.ini');
const ffIni = fs.readFileSync(firefoxConfigPath, 'utf-8');
const ffConfig = ini.parse(ffIni);
const bookmarkPath = path.join(firefoxPath, ffConfig.Profile0.Path, dbName);

fs.copyFileSync(bookmarkPath, dbName);

const db = new sqlite3(dbName, {
  verbose: null,
});
const select = db.prepare(
  'SELECT b.title,b.lastModified,p.url FROM moz_bookmarks b JOIN moz_places p ON b.fk = p.id;'
);
const rows = select.all();
const month = [];

db.close();
for (let i = 0; i < rows.length; i++) {
  const now = new Date();
  const row = rows[i];
  const date = new Date(row.lastModified / 1000);

  if (now.getDate() < 10) {
    now.setMonth(now.getMonth() - 1);
  }

  if (date.getYear() === now.getYear() && date.getMonth() === now.getMonth()) {
    row.lastModified = date;
    month.push (row);
  }
}

const result = month
  .reverse()
  .map((r) => ` * [${r.title}](${r.url})`)
  .join('\n');

console.log(result);
fs.unlinkSync(dbName);

