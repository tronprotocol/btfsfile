# Introduction

BTFSFile is a demonstration DApp which combines BTFS with the TRON blockchain. Using the existing [IPFS JS SDK](https://github.com/ipfs/js-ipfs-http-client), developers can create their own decentralized applications leveraging a file storage and sharing solution.

The DApp deployment steps consist of:

1. Deploying the smart contract to the TRON network.
2. Initializing and launching a BTFS daemon. 
3. Updating the DApp variable config file with the depoyed contract address.
4. Uploading the DApp to BTFS via the daemon.
5. Pinning the DApp via BTFS name publish. 

Requirements:

* ipfs-http-client
* tronweb
* browserify - `$ browserify source.js -o app.js`

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

Upload the DApp directory to BTFS using the `btfs add -r` command: 

```
User-MacBook-Pro:applications user$ btfs add -r appfolder
added QmPL71PEun4sRfVFFQbvCixDcfaAnvA4GFJzQMaaiVbuUA appfolder/admin.html
added QmPraNCTJbTkWGSqSSTMsdWioWDjhUVbr4paUadgbBzDUW appfolder/app.css
added QmWm31CwBhxre7DZ6F9qXHttomfeA8m9Ec6PX1a9vQodAT appfolder/app.js
added QmeRLS9TfoouuoCpJf4ujnuo4K13xnSeQV5qvutjkgPuBE appfolder/imgs/like.svg
added QmbxLM4g8qhYBu5FdTa21mH7ajzgNouBXdNNRjHek9RwXp appfolder/imgs/magnifier-tool.svg
added QmQrc63s97b2aj3phfq9BGmnor8hPJPmbT2TzxF2nxT3Lh appfolder/imgs/thumbs.svg
added QmNMAnqrVHqCrbmVgCyg1tPn79UaRkmHmqceYSfFeg5k5c appfolder/imgs/tron.svg
added QmReRFMURESs5fZ2mRVMaWJTGSmVbdWP4aZDQYR1G8RWvd appfolder/imgs/user.svg
added QmU3cFYKnov8dGzCHezJpSdPTwMVk9BjQiK87HqzR753oc appfolder/index.html
added QmaBdF4HZFHGSQi56SnfTQXhSPDUdTuFoC2RGoWpzKQXZ3 appfolder/package.json
added QmXZRA7qNdKCQFTRDR6MrSn8wUsiSw1DxZtEuFdZLKeJfn appfolder/source.js
added QmRL9LoaUfQmvrpkQrC68MQi6E3vowqJaZMJ58YRZtpaSA appfolder/upload.html
added QmdGvionorjntbQY1k2nfjNDoMjmwHtVppnKVjcsAgSygm appfolder/vars.json
added QmYC2xQXx2k7wkqudEL8u8HmQXFHMgiMmSfRPZETSMUwYM appfolder/imgs
added QmYw7aKqffvi9eArbX5SBZ5W6HRVqm82Mu6k6Eh6aoG9fx appfolder
 9.18 MiB / 9.18 MiB [=======================================================================] 100.00%
 
```

# Pin the DApp

Run the `btfs name publish <hash>` where <hash> represents the hash value of the uploaded directory:

```
Published to QmUYEVd5fTDPaTxmp9rYkKN9FV9hdZLitZq6iGfZTYeQUm: /btfs/QmYw7aKqffvi9eArbX5SBZ5W6HRVqm82Mu6k6Eh6aoG9fx
```

