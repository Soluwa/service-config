# CBaaS Config Service ⚙️

The config service is the interface over the CBaaS config store, and handles encrpytion and decryption of passwords in said config.

This service provides dynamic config to CAF webservices. For the CAF config module, use ```npm i -s sc-caf-config```
In version 2.0 the service now handles encrpytion and decryption of config.

## Developer Guide
It is highly recommended for developers working with this service to [setup a local dockerised instance of CBaaS.](https://confluence.devops.lloydsbanking.com/display/VA/5.1.2.5.1+Running+CBaaS+locally+in+Docker)

### Build and start
1. `npm i`
2. `npm run dist`
3. `npm start`

### Environment Variables
* `API_KEY` and `API_SECRET` should reflect the internal keys of the target CBaaS instance.
* `ALLOWED_KEYS` is a stringified JSON array of key/secret pairs the service will accept, e.g. `[{"key":"user", "secret":"pass"}]`
*  `DB_URL`, `DB_USER`, `DB_PASSWORD` are credentials for cloudant db
* `CONFIG_PUBLIC` and `CONFIG_PRIVATE_KEY` are RSA keys for encrypting and decrypting, respectively.
* `CONFIG_PASSPHRASE` is the key to use the private key.

### API Reference
Swagger specification can be found on the `/doc` route of the service.

### Testing
* Unit tests (jest): `npm run test:coverage`
* Component/Integration tests (cucumberjs): `npm run test:component`
