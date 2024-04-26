# Token-D: Simplifying Token Metadata Storage with REST API.

## Summary
`Token-D` is a `REST-API` based service designed to store metadata of an NFT. Traditionally, NFT metadata is stored off-chain, with the URI of the NFT linked to its contract. Often, this URI is generated using an off-chain storage provider service. With `Token-D`, users gain direct access to this service, eliminating the need for third-party storage providers and enabling the use of custom storage servers.
# To Try The Project Follow The Steps
1. At First Clone The Repositiory

```shell
git clone https://github.com/mdasifahamed/Token-D-A-REST-API-For-Storing-Token-Metadata.git
```
2. Then Install The Dependencies

```shell
npm i
```
3. Ensure CouchDB is installed locally and create a database. Set the database name in app.js. Refer to  <a href='https://docs.couchdb.org/en/stable/install/index.html'>CouchDB installation guide</a> for setup.

```javascript
const db = nano.use('ADD_YOUR_DB_NAME_HERE')
```
You Also Need To Configure The DB Connection With Your Creatdential at `app.js`
```javascript
const nano = require('nano')(`http://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@localhost:5984`)
```
4. Then Run Server Using The Following Commands

```shell
npx nodemon app.js
```
5. Use Any API Testing Clients For Testing The Path. 

**Key Features**
- `/api/create/` :  Create a Token URI to store NFT metadata, including files. Returns the Token URI endpoint.
- `/api/doc/single/:id` : Retrieve NFT metadata by a valid ID.
- `/api/media/view/:id` : View the default image of the NFT by a valid ID.
- `/api/doc/single/update/:id` : Update NFT metadata (useful for upgradable NFTs).
- `/api/media/update/existing/attachment/:id` : Update the image of the NFT, replacing the existing image.
- `/api/media/add/attachments/:id` : Add additional images to an NFT.
- `/api/doc/list` : List all stored NFT metadata.
- `/api/media/all/:id` : List all image URLs associated with an NFT.
- `/api/media/view/:id/` :attachment: View a specific image of an NFT.

## Note:
This service is tailored for private blockchains like `Hyperledger-Fabric`. While most NFTs on public blockchains utilize `IPFS` for decentralized storage, some artists prefer centralized servers for metadata storage
## Language And Tools Used 

1. `Javascript` With `Node.js` For Server Side Scripting.
2. `Express` For Rest-API. 
3. `CouchDB` For Storing Data. 

## Contrubution And Recomendations

Any Kind Contribution And Recomendation That Enriches The Dapp Are Welcomed.












