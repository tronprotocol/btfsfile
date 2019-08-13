# Introduction

BTFSFile is a demonstration DApp which combines BTFS with the TRON blockchain. Using the existing [IPFS JS SDK](https://github.com/ipfs/js-ipfs-http-client), developers can create their own decentralized applications leveraging a file storage and sharing solution.


# Usage

1. Deploy the contract stored in `./applications/tron_torrent_site/contract/Movie.sol`.
2. Take the address of the contract and replace line 2 of `hashes.json contractAddr" : "TRGqvXAvKAtggykLpjYPtuXmnDHELnK7Vn` with the returned address.
3. `$ npm install` - it will install the ipfs-http-client, tronweb, and browserify
4. `$ browserify source.js -o app.js`

Now, open the movie.html in the browser and test the DApp.
