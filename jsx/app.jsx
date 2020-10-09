function App(properties) {
  return (
    <React.Fragment>
      <div className="jumbotron">
        <h1 className="mb-4">Address Format Explorer</h1>
        <hr/>
        <div className="row mb-3">
          <div className="col sm-6">
            <span className="text-muted">select country</span>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <CountrySelector countries={properties.countries} onEffect={updateAddressFormat} />
          </div>
        </div>
      </div>
      <div className="container mb-3">
        <h3>output forms</h3>
        <div id="addressFormat"></div>
      </div>
      <div className="container">
        <h3>entry forms</h3>
        <div id="addressEntry"></div>
      </div>
    </React.Fragment>
  );
}

ReactDOM.render(<App countries={ehom.i18n.addressData}/>, document.getElementById('app'));

(function displayAddressFormat(countryCode) {
  updateAddressFormat(countryCode);
})('US');

function CountrySelector(properties) {
  const [inputText, setInputText] = React.useState('');
  
  const handleChange = (event) => {
    setInputText(event.target.value);
  };
  
  React.useEffect(() => {
    console.debug("useEffect");

    if (inputText.length > 0) {
      console.debug(`Update output section with address format for ${inputText}`);
      properties.onEffect(inputText);
    }
  });
  
  const options = Object.keys(properties.countries).map((code) => {
    if (properties.countries[code].name) {
      return <option value={code}>{properties.countries[code]['name']}</option>;
    } else {
      return <React.Fragment></React.Fragment>;
    }
  });
  
  return (
    <select id="country-selector" className="form-control" onChange={handleChange}>
      {options}
    </select>
  );
}

function updateAddressFormat(countryCode) {
  console.debug("updateAddressFormat: ", countryCode);
  ReactDOM.render(<AddressFormat countryCode={countryCode} />, document.getElementById('addressFormat'));
  ReactDOM.render(<AddressEntryForm countryCode={countryCode} />, document.getElementById('addressEntry'));
}

function Address() {
  this.name = "[name]";
  this.org = "[organization]";
  this.addressLine1 = "[address line 1]";
  this.addressLine2 = "[address line 2]";
  this.city = "[city]";
  this.state = "[state]";
  this.postalCode = "[postal code]";
}

function AddressFormat(properties) {
  const formatted = AddressFormatter(properties.countryCode).format(new Address());
    
  const result = formatted.map((line) => {
    return (
      <React.Fragment>
        <span>{line}</span><br/>
      </React.Fragment>
    );
  });

  return (
    <React.Fragment>Address Format for {properties.countryCode}
      <div>{result}</div>
    </React.Fragment>
  );
}

function AddressEntryForm(properties) {
  return (
    <div>TODO</div>
  );
}

// The following code can go into a separate file (jsx)
function AddressFormatter(countryCode) {
  return {
    format: function(object) {
      // Read the format string from the locale data

      console.debug("format: ", ehom.i18n.addressData[countryCode].fmt);

      const addressData = ehom.i18n.addressData[countryCode];
      const defaultData = ehom.i18n.addressData['ZZ'];

      let fmt = ehom.i18n.addressData[countryCode].fmt;
      let output = fmt.replace("%N", "[person's name]")
                      .replace("%O", '[organization]')
                      .replace("%A", '[address line]')
                      .replace(/%n/g, '\n')
                      .replace('%X', '[sort code]')

      const locality_name_type = addressData.locality_name_type ?
        addressData['locality_name_type'] : defaultData.locality_name_type ;
      output = output.replace('%C', `[${locality_name_type}]`);

      output = output.replace("%D", addressData.sublocality_name_type ?
        '[' + addressData.sublocality_name_type + ']' : 
        '[' + defaultData.sublocality_name_type + ']' );

      output = output.replace("%S", addressData['state_name_type'] ?
        '[' + addressData.state_name_type + ']' : 
        '[' + defaultData.state_name_type + ']' );

      output = output.replace("%Z", addressData.zip_name_type ?
          `[${addressData.zip_name_type} code]`:
          `[${defaultData.zip_name_type} code]`);

      return output.split("\n");
    }
  };
}

