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
  ReactDOM.render(<AddressEntryForm countryCode={countryCode} address={new Address()}/>, document.getElementById('addressEntry'));
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
      <React.Fragment>{line}<br/>
      </React.Fragment>
    );
  });

  return (
    <React.Fragment>
      <div>{result}</div>
    </React.Fragment>
  );
}

function AddressEntryForm(properties) {
  const parts = AddressFormatter(properties.countryCode).formatToParts(properties.address);
  console.debug(parts);

  const output = parts.map((part) => {
    let temp;

    switch(part.type) {
    case 'name':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="Name" /></p>
        </React.Fragment>
      );
    case 'organization':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="Organization" /></p>
        </React.Fragment>
      );
    case 'address':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="Address" /></p>
        </React.Fragment>
      );
    case 'city':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="City" /></p>
        </React.Fragment>
      );
    case 'sublocality':
      temp = ehom.i18n.addressData[properties.countryCode].sublocality_name_type || ehom.i18n.addressData['ZZ'].sublocality_name_type;
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder={temp} /></p>
        </React.Fragment>
      );
    case 'state':
      temp = ehom.i18n.addressData[properties.countryCode].state_name_type || ehom.i18n.addressData['ZZ'].state_name_type;
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder={temp} /></p>
        </React.Fragment>
      );
    case 'postalCode':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="Postal code" /></p>
        </React.Fragment>
      );
    case 'sortCode':
      return (
        <React.Fragment>
          <p><input type="text" className="form-control" placeholder="Sort code" /></p>
        </React.Fragment>
      );
    default:
      return <React.Fragment></React.Fragment>;
    }
  });

  return (
    <div>{output}</div>
  );
}

// The following code can go into a separate file (jsx)
function AddressFormatter(countryCode) {
  return {
    format: function(object) {
      const brackets = (s) => `[${s}]`;
     
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
        addressData.locality_name_type : defaultData.locality_name_type; 
      output = output.replace('%C', brackets(locality_name_type));

      output = output.replace("%D",
          brackets(
            addressData.sublocality_name_type ? 
              addressData.sublocality_name_type: 
              defaultData.sublocality_name_type
          )
      );

      output = output.replace("%S", 
        addressData['state_name_type'] ?
          brackets(addressData.state_name_type):
          brackets(defaultData.state_name_type)
      );

      let result = addressData.zip_name_type ? addressData.zip_name_type : defaultData.zip_name_type;
      output = output.replace("%Z", brackets(`${result} code`));

      return output.split("\n");
    },
    formatToParts: function(object) {
      let fmt = ehom.i18n.addressData[countryCode].fmt;
      let parts = fmt.match(/%[N,O,A,D,C,S,Z,X]/g);

      console.log(parts);
      let result = parts.map((part) => {
        switch(part) {
        case '%N':
          return {type: 'name', value: '' };
        case '%O':
          return {type: 'organization', value: '' };
        case '%C':
          return {type: 'city', value: '' };
        case '%D':
          return {type: 'sublocality', value: '' };
        case '%S':
          return {type: 'state', value: '' };
        case '%Z':
          return {type: 'postalCode', value: '' };
        case '%X':
          return {type: 'sortCode', value: '' };
        case '%A':
          return {type: 'address', value: '' };
        default:
          return {type: 'none', value: '' };
        }
      });
      return result;
    }
  };
}

