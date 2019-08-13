# Introduction

BTFSFile is a demonstration DApp which combines BTFS with the TRON blockchain. Using the existing [IPFS JS SDK](https://github.com/ipfs/js-ipfs-http-client), developers can create their own decentralized applications leveraging a file storage and sharing solution.

The DApp deployment steps consist of:

1. Initializing and launching a BTFS daemon. 
2. Deploying the smart contract to the TRON network.
3. Updating the DApp variable config file with the depoyed contract address.
4. Uploading the DApp to BTFS via the daemon.
5. Pinning the DApp via BTFS name publish. 

# Launching a BTFS Daemon

You can launch the BTFS daemon on either your local machine or on a server. In the end, the DApp files will be pinned to the BTFS network. To install and deploy BTFS, follow the [BTFS Installation](https://docs.btfs.io/docs/install-btfs) instructions from the [developer documentation](https://docs.btfs.io/). 

# Smart Contract Deployment to TRON

Smart contract deployment can be achieved via [Tron-Box](https://developers.tron.network/docs/tron-box-contract-deployment). 

# Update the DApp Variable Config File

In the `vars.json` configuration file, update the `contractAddr` field to your deployed contract address. Update the baseURL to the BTFS gateway and the hostIpAddr to the API gateway.     

```
{
	"contractAddr" : "",
	"defaultUserAddr" :"",
	"nodeURL" : "",
	"hostIpAddr" : "",
	"tipConversion" : "",
	"baseURL" : ""
}
```

# Upload the DApp to BTFS

```
git clone https://github.com/tronprotocol/BTFSFile
```

```
```

# Pin the DApp

Run the `btfs name publish <hash>` where <hash> represents the hash value of the 

# Usage

1. Deploy the contract stored in `./applications/tron_torrent_site/contract/Movie.sol`.
2. Take the address of the contract and replace line 2 of `hashes.json contractAddr" : "TRGqvXAvKAtggykLpjYPtuXmnDHELnK7Vn` with the returned address.
3. `$ npm install` - it will install the ipfs-http-client, tronweb, and browserify
4. `$ browserify source.js -o app.js`

Now, open the movie.html in the browser and test the DApp.
