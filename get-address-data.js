#!/usr/bin/env node

const fetch = require("node-fetch");
const fs = require("fs");

const BASE_URL = "https://chromium-i18n.appspot.com/ssl-address/data";

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
  const BATCH_SIZE = 2;
  for (let i = 0; i < countries.length; i += BATCH_SIZE) {
    const requests = countries.slice(i, i + BATCH_SIZE).map((country) => { 
      return getAddrFmt(country) // Async function to get the address format.
       .catch(e => console.log(`Error in get address format for ${country} - ${e}`)) ;
       // Catch the error if something goes wrong. So that it won't block the loop.
    });

    await Promise.all(requests).then((result) => {
      console.log("Processed a batch");
    });
  }
}

// Get Address Format given the specified countryCode
// Returns a Promise
const getAddrFmt = async (countryCode) => {
  const URL = `${BASE_URL}/${countryCode}`;
  console.debug(URL);

  try {
    const response = await fetch(URL);
    const json = await response.json();
    console.debug(json);
    saveToFile(json, countryCode);
    return json;
  } catch (error) {
    console.error(error);
  }
}

const saveToFile = (json, countryCode) => {
  try {
    const text = JSON.stringify(json, null, 2);
    const filepath = `raw_data/${countryCode}.json`;
    const data = fs.writeFileSync(filepath, text);
  } catch (err) {
    console.error(err);
  }
}

