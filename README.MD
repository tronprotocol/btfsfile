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



# Update the DApp Variable Config File



# Upload the DApp to BTFS



# Pin the DApp



## Publish BTFSFile to the BTFS private net

```
git clone https://github.com/TRON-US/BTFS.git
```

Step3. Publish the web on BTFS net.
```
$ cd (the path of tron_torrent_site)
$ cd static/js
$ btfs add -r .
added QmZt332bdR3vVbdho21sfnh1Q1TJaKzrmQwtMCRaFmADUw js/movie.html
added QmfD5DoTpSXmJrqJoUT47qJSD9yqsGeRvbFso9rHwJYEJV js/movie.js
added QmPQJsJ9dVNywW3KZgCMN4m177NwJDYsVHwBTCKjhuLUxt js
 11.77 KiB / 11.77 KiB [===============================================] 100.00%
$ btfs name publish QmPQJsJ9dVNywW3KZgCMN4m177NwJDYsVHwBTCKjhuLUxt
Published to QmRb1Vi7JeNMVE2QVvCuWFU2J2qt6rn4pLf31CHyjt9GbB: /btfs/QmPQJsJ9dVNywW3KZgCMN4m177NwJDYsVHwBTCKjhuLUxt
```

Step4. Go the the BT-Movie website link: 

http://(the aws machine host):8080/btns/QmRb1Vi7JeNMVE2QVvCuWFU2J2qt6rn4pLf31CHyjt9GbB/movie.html




## Run the DApp web server.
Install beego and bee. This require a go version higher than go1.12.
```
go get -u github.com/astaxie/beego

go get -u github.com/beego/bee

export PATH=$GOPAH/bin:$PATH
```

```
cd (the path of tron_torrent_site)
```
```
bee run
```
Then you will see like this:
```
______
| ___ \
| |_/ /  ___   ___
| ___ \ / _ \ / _ \
| |_/ /|  __/|  __/
\____/  \___| \___| v1.10.0
2019/03/29 15:19:53 WARN     ▶ 0001 Running application outside of GOPATH
2019/03/29 15:19:53 INFO     ▶ 0002 Using 'tron_torrent_site' as 'appname'
2019/03/29 15:19:53 INFO     ▶ 0003 Initializing watcher...
2019/03/29 15:19:59 SUCCESS  ▶ 0004 Built Successfully!
2019/03/29 15:19:59 INFO     ▶ 0005 Restarting 'tron_torrent_site'...
2019/03/29 15:19:59 SUCCESS  ▶ 0006 './tron_torrent_site' is running...
2019/03/29 15:19:59.062 [I] [asm_amd64.s:1337]  http server Running on http://:8080

```
If you have see the result above, that means the DApp web server is running, now you can go the the [web site](http://localhost:8080) to use the DApp.

## BTPS-DApp Directions
Main Page:
![avatar](https://github.com/TRON-US/BTFS/blob/master/applications/tron_torrent_site/static/img/index_screen_shot.jpg)

### Set Movie On TRON:
This is to set a pair of name and hash on Tron Smart Contract.
1. Input the name and hash, then submit your input:
![avatar](https://github.com/TRON-US/BTFS/blob/master/applications/tron_torrent_site/static/img/set_on_tron_screenshot.jpg)

2. Then you'll see the result:
```
Set movie succeed:
TxId: fe46dac465e3a1e6ba87cd49e3f9a5dcb46ba8612223bf9f35beb0bc2e51e69d
 Here need to wait a while for transaction confirmed...
```

### Upload Movie On IPFS and Set Movie Hash On TRON.
This is to upload the file to IPFS and set the file name and hash to tron smart contract.
1. input the name:
![avatar](https://github.com/TRON-US/BTFS/blob/master/applications/tron_torrent_site/static/img/upload_screenshot.jpg)

2. Then you'll see the result:
```
Upload movie succeed:
Hash: QmPwgQP28y9L6RfCHwXBV1Bu87kkFp6ggk7uv8saW25MDV
Set movie succeed:
TxId: 1dfcf122c3405260db13fdce7169cfb2a85d673ad7fe171c1f7781851e519532
 Here need to wait a while for transaction confirmed...
```

### Get Movie Hash From TRON.
This is to use the file name to get the file hash. 
1. Input the name:
![avatar](https://github.com/TRON-US/BTFS/blob/master/applications/tron_torrent_site/static/img/get_movie_screenshot.jpg)

2. Then you'll see the result:
```
Get movie on tron net succeed: Hash: QmPwgQP28y9L6RfCHwXBV1Bu87kkFp6ggk7uv8saW25MDV
```

### Download Movie From IPFS.
This is to use the hash to download the file on IPFS.Input the hash of the file and then the file will download in you home path.


# Usage

1. Deploy the contract stored in `./applications/tron_torrent_site/contract/Movie.sol`.
2. Take the address of the contract and replace line 2 of `hashes.json contractAddr" : "TRGqvXAvKAtggykLpjYPtuXmnDHELnK7Vn` with the returned address.
3. `$ npm install` - it will install the ipfs-http-client, tronweb, and browserify
4. `$ browserify source.js -o app.js`

Now, open the movie.html in the browser and test the DApp.
