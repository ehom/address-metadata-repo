#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require("fs");
const helpers = require("./helpers.js");

const BASE_URL = "https://chromium-i18n.appspot.com/ssl-address/data";

const OUTPUT_DIR = 'generated';
!fs.existsSync(OUTPUT_DIR) && fs.mkdirSync(OUTPUT_DIR);

// Get the list of countries first

(async (url) => {
  try {
    const response = await fetch(url);
    const json = await response.json()

    console.debug(json);

    let countries = json['countries'].split('~');
    console.table(countries);

    countries.push('ZZ');
    getAddressFormats(countries);
  } catch (error) {
    console.error(error);
  }
})(BASE_URL);


const getAddressFormats = async (countries) => {
  let lookupTable = helpers.createLookupTable();

  const BATCH_SIZE = 2;
  for (let i = 0; i < countries.length; i += BATCH_SIZE) {
    const requests = countries.slice(i, i + BATCH_SIZE).map((countryCode) => {
      return getAddrFmt(countryCode) // Async function to get the address format.
       .then((response) => {
         if (response['name']) {
           lookupTable.store(countryCode, response['name']);
         }
         const filePath = `raw_data/${countryCode}.json`;
         helpers.createFileWriter(filePath).write(response);
       })
       .catch(e => console.log(`Error in get address format for ${countryCode} - ${e}`)) ;
       // Catch the error if something goes wrong. So that it won't block the loop.
    });

    await Promise.all(requests).then((result) => {
      console.log("Processed a batch");
    });
  }
  lookupTable.writeTo('generated/countries.json');
};

// Get Address Format given the specified countryCode
// Returns a Promise
const getAddrFmt = async (countryCode) => {
  const URL = `${BASE_URL}/${countryCode}`;
  console.debug(URL);

  try {
    const response = await fetch(URL);
    const json = await response.json();
    console.debug(json);
    return json;
  } catch (error) {
    console.error(error);
  }
}

