# BTFS-DAPP
This is a DApp that can set a pair of name and hash in tron smart contract, and get the file on ipfs, which may can combine TRON with IPFS.


## Publish the BT-Movie to BTFS private net

Step1. Access to the btfs node machine on aws.

Step2. Get Source code.

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


