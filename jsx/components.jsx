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

  return <div>{result}</div>;
}

function AddressEntryForm(properties) {
  const parts = AddressFormatter(properties.countryCode).formatToParts(properties.address);
  console.debug(parts);

  const addressData = ehom.i18n.addressData[properties.countryCode];
  const defaultData = ehom.i18n.addressData['ZZ'];

  const require = addressData.require || defaultData.require;

  const lookupTable = {
    name: () => <p className="mb-2"><input type="text" name="name" autocomplete="on" className="form-control mb-0" placeholder="name" /></p>,
    organization: () => <p className="mb-2"><input type="text" className="form-control mb-0" placeholder="organization" /></p>,
    address: () => {
      const text = require.indexOf('A') >= 0 ? "address (required)" : "address";
      return (
        <p className="mb-2">
          <input type="text" name="address-1" autocomplete="on" className="form-control mb-0" placeholder={text} required />
        </p>
      );
    },
    city: () => {
      let text = addressData.locality_name_type || defaultData.locality_name_type;
      text = require.indexOf('C') >= 0 ? `${text} (required)` : text;

      return (
        <p className="mb-2">
          <input type="text" name="city" autocomplete="on" className="form-control mb-0" placeholder={text} required />
        </p>
      );
    },
    sublocality: () => {
      let temp = addressData.sublocality_name_type || defaultData.sublocality_name_type;
      return (
        <p className="mb-2">
          <input type="text" className="form-control mb-0" placeholder={temp} />
        </p>
      );
    },
    state: () => {
      let text = addressData.state_name_type || defaultData.state_name_type;
      text = require.indexOf('S') >= 0 ? `${text} (required)` : text;

      if (addressData.sub_keys) {
        const sub_keys = addressData.sub_keys.split('~');
        console.debug(sub_keys);

        let sub_names = [];
        if (addressData.sub_lnames) {
           sub_names = addressData.sub_lnames.split('~') 
        } else if (addressData.sub_names) {
           sub_names = addressData.sub_names.split('~');
        } else {
           sub_names = sub_keys;
        }
        const options = sub_keys.map((sub_key, index) => {
          return <option value={sub_key}>{sub_names[index]}</option>;
        });

        return (
          <p className="mb-2">
            <select className="form-control mb-0">
              <option>{text}</option>
              {options}
            </select>
          </p>
        );
      } 

      return (
        <p className="mb-2">
          <input type="text" name="state" autocomplete="on" className="form-control mb-0" placeholder={text} required />
        </p>
      );
    },
    postalCode: () => {
      let name = addressData.zip_name_type || defaultData.zip_name_type;
      name = require.indexOf('Z') >= 0 ? `${name} code (required)` : `${name} code`
      
      return (
        <p className='mb-2'>
          <input type='text' name="zip" className='form-control mb-0' placeholder={name} />
        </p>
      );
    },
    'sortCode': () => {
      return (
        <p className="mb-2">
          <input type="text" className="form-control mb-0" placeholder="sort code" />
        </p>
      );
    }
  }

  const output = parts.map((part) => lookupTable[part.type]());

  return (
    <div>
      <form>{output}</form>
    </div>
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
      let output = fmt.replace("%N", "[name]")
                      .replace("%O", '[organization]')
                      .replace("%A", '[address]')
                      .replace(/%n/g, '\n')
                      .replace('%X', '[sort code]')

      const locality_name_type = addressData.locality_name_type ?
        addressData.locality_name_type : defaultData.locality_name_type; 
      output = output.replace('%C', brackets(locality_name_type));

      output = output.replace("%D",
        addressData.sublocality_name_type ? 
          brackets(addressData.sublocality_name_type):
          brackets(defaultData.sublocality_name_type)
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
      const fmt = ehom.i18n.addressData[countryCode].fmt;
      const parts = fmt.match(/%[N,O,A,D,C,S,Z,X]/g);
      console.debug(parts);

      const table = {
        '%N': {type: 'name', value: ''},
        '%O': {type: 'organization', value: ''},
        '%A': {type: 'address', value: ''},
        '%C': {type: 'city', value: ''},
        '%D': {type: 'sublocality', value: ''},
        '%S': {type: 'state', value: ''},
        '%Z': {type: 'postalCode', value: ''},
        '%X': {type: 'sortCode', value: ''}
      };

      const result = parts.map((part) => table[part]);
      return result;
    }
  };
}

