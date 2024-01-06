const fs = require("node:fs");
const path = require("node:path");
const [pathToCsv] = process.argv.slice(2);

function toNumber(str) {
  return Number(str?.replace("%", ""));
}

function writeX(input) {
  if (!input || typeof input !== "string") return "";
  if (input.toUpperCase() === "X") {
    return input;
  } else {
    return "";
  }
}
fs.readFile(path.join(__dirname, pathToCsv), { encoding: "utf8" }, (err, data) => {
  if (err) {
    throw new Error("Error reading file", err);
  }
  const rows = data.split("\n");
  const json = rows.map((row) => row.split(";"))
    .map(([date, changeSP, invested]) => ([date, toNumber(changeSP), writeX(invested)]));
    // .map((row) => row.filter(Boolean))
    // .filter((row) => row.length > 0);

  fs.writeFile(path.join(__dirname, pathToCsv.replace(".csv", ".json")), JSON.stringify(json), "utf8", (err) => {
    if (err) {
      throw new Error(err);
    } else {
      console.log("File written to", path.join(__dirname, pathToCsv.replace(".csv", ".json")));
    }
  });
});
