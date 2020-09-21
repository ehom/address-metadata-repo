const fs = require('fs');

function createLookupTable() {
  let table = {};

  return {
    store: function(countryCode, countryName) {
        table[countryCode] = countryName;
    },
    writeTo: function(filepath) {
        createFileWriter(filepath).write(table);
    }
  }
}

function createFileWriter(filePath) {
  return  {
    write: function(obj) {
      try {
        const text = JSON.stringify(obj, null, 2);
        fs.writeFileSync(filePath, text);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = {
  createLookupTable,
  createFileWriter
};
