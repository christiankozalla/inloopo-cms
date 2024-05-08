const { write } = require("fs");
const fs = require("node:fs");
const path = require("node:path");
const [pathToCsv] = process.argv.slice(2);

fs.readFile(path.join(__dirname, pathToCsv), { encoding: "utf8" }, (err, data) => {
  if (err) {
    throw new Error("Error reading file", err);
  }
  const rows = data.split("\n");
  const dax = rows.map((row) => row.split(";")).map((row) => toNumber(row[3]));
  const dow = rows.map((row) => row.split(";")).map((row) => toNumber(row[4]));
  const nasdaq = rows.map((row) => row.split(";")).map((row) => toNumber(row[5]));

  writeFile("dax.json", dax);
  writeFile("dow.json", dow);
  writeFile("nasdaq.json", nasdaq);
});

function toNumber(str) {
  return Number(str?.replace("%", ""));
}

function writeFile(fileName, data) {
  fs.writeFile(path.join(__dirname, fileName), JSON.stringify(data), "utf8", (err) => {
    if (err) {
      throw new Error(err);
    } else {
      console.log("File written to", path.join(__dirname, fileName));
    }
  });
}
