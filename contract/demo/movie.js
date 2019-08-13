const ipAddr = "api.btfs.trongrid.io";
const ipPort = "443";
const timeout = 1000;
const contractAddr = "TBVVv1768bBtQFhsQ7wHqa9Pbmh4CU3BhZ";
const toSun = 1000000;

async function movieInfoSection(movieHash, coverHash, name, thumbsUp, thumbsDown, uploader, trxTip, tokenTip, keywords, contract) {
    if (contract == null) {
        contract = await window.tronWeb.contract().at(contractAddr);
    }

    // each div contains an movie hash and its details.
    var div = document.createElement("div");
    div.setAttribute("id", movieHash);
    document.getElementById("search_result").appendChild(div);

    // append movie cover
    var cover = document.createElement("img");
    console.log("https://gateway.btfs.trongrid.io/btfs/"+coverHash);
    cover.setAttribute("src",  "https://gateway.btfs.trongrid.io/btfs/"+coverHash);
    cover.setAttribute("width", 450);
    document.getElementById(movieHash).appendChild(cover);

    // append movie name and hash
    var hash = document.createElement("section");
    hash.setAttribute("id",  "hash_"+movieHash);
    hash.setAttribute("value", movieHash);
    hash.innerHTML = "Name:["+name+"] Hash:["+movieHash+"]";
    document.getElementById(movieHash).appendChild(hash);

    // append keywords
    var keyword = document.createElement("section");
    keyword.setAttribute("id", "keywords_"+movieHash);
    keyword.setAttribute("value", movieHash);
    keyword.innerHTML = "Keywords:["+keywords+"]";
    document.getElementById(movieHash).appendChild(keyword);

    // add click listener to hash.
    hash.addEventListener("click", async function () {
        console.log("click hash to watcher:", this.value);
        watch(movieHash);
    }, false);

    // =========== thumbUp =============
    // append thumb up number.
    var thumbsUpNum = document.createElement("section");
    thumbsUpNum.setAttribute("id", "thumbsUp_num_"+movieHash);
    thumbsUpNum.innerHTML = thumbsUp;
    document.getElementById(movieHash).appendChild(thumbsUpNum);

    // thumb up button.
    var thumbsUpBtn = document.createElement("button");
    thumbsUpBtn.setAttribute("id", "thumbsUp_btn_"+movieHash);
    thumbsUpBtn.setAttribute("name", "thumbsUp_"+movieHash);
    thumbsUpBtn.setAttribute("value", movieHash);
    thumbsUpBtn.innerHTML = "Thumbs Up";
    document.getElementById("thumbsUp_num_"+movieHash).appendChild(thumbsUpBtn);

    // add click event listener to thumb up button.
    thumbsUpBtn.addEventListener("click", async function () {
        console.log("click thumbs up button:", this.value);
        let ret = await contract.thumbsUp(this.value).send({
            shouldPollResponse: true
        });
        setTimeout(function () {
            document.getElementById("thumbsUp_num_"+movieHash).innerHTML = ret.toString();
        }, timeout);
        console.log("likes-uploaded:", ret.toString());
    }, false);

    // =========== thumbDown =============
    // append thumb down number.
    var thumbsDownNum = document.createElement("section");
    thumbsDownNum.setAttribute("id", "thumbsDown_num_"+movieHash);
    thumbsDownNum.innerHTML = thumbsDown;
    document.getElementById(movieHash).appendChild(thumbsDownNum);

    // thumb down button.
    var thumbsDownBtn = document.createElement("button");
    thumbsDownBtn.setAttribute("id", "thumbsDown_btn_"+movieHash);
    thumbsDownBtn.setAttribute("name", "thumbsDown_"+movieHash);
    thumbsDownBtn.setAttribute("value", movieHash);
    thumbsDownBtn.innerHTML = "Thumbs Down";
    document.getElementById("thumbsDown_num_"+movieHash).appendChild(thumbsDownBtn);

    // add click event listener to thumb up button.
    thumbsDownBtn.addEventListener("click", async function () {
        console.log("click thumbs down button:", this.value);
        let dislikes = await contract.thumbsDown(this.value).send({
            shouldPollResponse: true
        });
        setTimeout(document.getElementById("thumbsDown_num_"+movieHash).innerHTML = dislikes.toString(), timeout);
        console.log("dislikes-uploaded:", dislikes.toString());
    }, false);

    // =========== tip TRX ============
    // 1. tips section
    var trxTips = document.createElement("section");
    trxTips.setAttribute("id", "trx_tips_" + movieHash);
    document.getElementById(movieHash).appendChild(trxTips);
    // 2. tips Button
    var trxTipsBtn = document.createElement("button");
    trxTipsBtn.setAttribute("id", "trx_tips_btn_" + movieHash);
    trxTipsBtn.setAttribute("name", "movieHash");
    trxTipsBtn.setAttribute("value", movieHash);
    trxTipsBtn.innerHTML = "Tips TRX";
    document.getElementById("trx_tips_" + movieHash).appendChild(trxTipsBtn);
    // 3. tips label
    var trxTipsLbl = document.createElement("label");
    trxTipsLbl.setAttribute("id", "trx_tips_lbl_" + movieHash);
    setTimeout(trxTipsLbl.innerHTML = trxTip / toSun, timeout);
    document.getElementById("trx_tips_" + movieHash).appendChild(trxTipsLbl);
    // 4. add click event listener to tips Button
    trxTipsBtn.addEventListener("click", async function() {
        console.log("click TRX tips Button:", this.value);
        const trxTipsAmountEntered = prompt("Please enter the amount of TRX you want to tip!", 0);
        if (trxTipsAmountEntered > 0) {
            let tips = await contract.tipTrx(this.value).send({
                callValue: trxTipsAmountEntered * toSun,
                shouldPollResponse: true
            });
            setTimeout(document.getElementById("trx_tips_lbl_" + movieHash).innerHTML = tips.toNumber() / toSun, timeout);
            console.log("trx-tips-updated:", tips.toNumber() / toSun);
        }
    }, false);
    // =========== end of tip TRX ============

    // =========== tip Token =============
    // tip tokenmovie
    // 1. tip token section
    var tokenTips = document.createElement("section");
    tokenTips.setAttribute("id", "token_tips_" + movieHash);
    document.getElementById(movieHash).appendChild(tokenTips);
    // 2. tiptoken Button
    var tokenTipsBtn = document.createElement("button");
    tokenTipsBtn.setAttribute("id", "token_tips_btn_" + movieHash);
    tokenTipsBtn.setAttribute("name", "movieHash");
    tokenTipsBtn.setAttribute("value", movieHash);
    tokenTipsBtn.innerHTML = "Tips Token";
    document.getElementById("token_tips_" + movieHash).appendChild(tokenTipsBtn);
    // 3. tiptoken label
    var tokenTipsLbl = document.createElement("label");
    tokenTipsLbl.setAttribute("id", "token_tips_lbl_" + movieHash);
    setTimeout(tokenTipsLbl.innerHTML = tokenTip, timeout);
    document.getElementById("token_tips_" + movieHash).appendChild(tokenTipsLbl);
    // 4. add click event listener to tip Button
    tokenTipsBtn.addEventListener("click", async function() {
        console.log("click tip token Button:", this.value);
        let tokenId = await contract.getTokenId().call();
        const tokentipsAmountEntered = prompt("Please enter the amount of token you want ot tip!", 0);
        if (tokentipsAmountEntered > 0) {
            let tips = await contract.tipToken(this.value).send({
                tokenValue: tokentipsAmountEntered,
                tokenId: tokenId,
                shouldPollResponse: true
            });
            setTimeout(document.getElementById("token_tips_lbl_" + movieHash).innerHTML = tips.toString(), timeout);
            console.log("token-tips-updated:", tips.toString());
        }
    }, false);
    // =========== end of tip Token =============

    // uploader label.
    var uploaderLabel = document.createElement("uploader");
    uploaderLabel.setAttribute("id", "uploader_"+movieHash);
    uploaderLabel.setAttribute("value", movieHash);
    uploaderLabel.innerHTML = uploader;
    document.getElementById(movieHash).appendChild(uploaderLabel);

    // add <br/>
    var br = document.createElement("br");
    document.getElementById("uploader_"+movieHash).appendChild(br);
    document.getElementById("uploader_"+movieHash).appendChild(br);
}

async function upload() {
    var name = document.forms["uploadForm"]["uploadName"].value;
    var keywordsStr = document.forms["uploadForm"]["uploadKeywords"].value;
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    const btfs = window.IpfsApi({host:ipAddr, port:ipPort, protocol:'https'});
    const Buffer = window.IpfsApi().Buffer;
    const movieReader = new FileReader();
    var movieHash, coverHash;
    movieReader.onloadend = function () {
        const buf = Buffer.from(movieReader.result);
        btfs.files.add(buf, (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            let url = `https://gateway.btfs.trongrid.io./btfs/${result[0].hash}`;
            console.log(`Url --> ${url}`);
            document.getElementById("url").innerHTML= url;
            document.getElementById("url").href= url;
            document.getElementById("url").target = '_blank';
            movieHash = result[0].hash;
        });
    };
    const movie = document.getElementById("movie");
    movieReader.readAsArrayBuffer(movie.files[0]);

    const coverReader = new FileReader();
    coverReader.onloadend = function () {
        const buf = Buffer.from(coverReader.result);
        btfs.files.add(buf, (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            let url = `https://gateway.btfs.trongrid.io./btfs/${result[0].hash}`;
            console.log(`Url --> ${url}`);
            coverHash = result[0].hash;
        });
    };
    const cover = document.getElementById("cover");
    coverReader.readAsArrayBuffer(cover.files[0]);

    setTimeout(function () {setMovie(name, movieHash, coverHash, keywords)}, 7000);
}

async function setMovie(name, movieHash, coverHash, keywords) {
    console.log("movieHash: ",movieHash, " coverHash: ", coverHash);
    if(name == null || movieHash == null) {
        return;
    }
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.setMovie(name, movieHash, coverHash, keywords).send({
        shouldPollResponse: true
    });
}

async function getMovies() {
    document.getElementById("search_result").innerHTML = "";
    var name = document.forms["searchForm"]["searchName"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.getMovies(name).call().then((movies) => {
        if(movies["hashesByName"].length == 0 && movies["hashesByKeyword"].length == 0) {
            document.getElementById("search_result").innerText = "no movie reference to '"+name+"'.";
            return;
        }

        // get movie by name.
        for(var i = 0; i < movies["hashesByName"].length; i++) {
            const movieHash = movies["hashesByName"][i].toString();
            contract.getMovieInfo(movieHash).call().then((movieInfo) => {
                const movieName = movieInfo.name.toString();
                const thumbsUp = movieInfo.thumbsUp.toString();
                const thumbsDown = movieInfo.thumbsDown.toString();
                const uploader = movieInfo.uploader.toString();
                const trxTips = movieInfo.trx_reward.toString();
                const tokenTips = movieInfo.token_reward.toString();
                const coverHash = movieInfo.cover_hash.toString();
                const keywords = movieInfo.keywords.toString();
                console.log(movieInfo.keywords, keywords);
                setTimeout(function (){movieInfoSection(movieHash, coverHash, movieName, thumbsUp, thumbsDown, uploader,
                    trxTips,tokenTips, keywords, contract)}, timeout);
            });
        }

        // get movie by keywords.
        for(var i = 0; i < movies["hashesByKeyword"].length; i++) {
            const movieHash = movies["hashesByKeyword"][i].toString();
            contract.getMovieInfo(movieHash).call().then((movieInfo) => {
                const movieName = movieInfo.name.toString();
                if(movieName != name) {
                    const movieName = movieInfo.name.toString();
                    const thumbsUp = movieInfo.thumbsUp.toString();
                    const thumsDown = movieInfo.thumbsDown.toString();
                    const uploader = movieInfo.uploader.toString();
                    const trxTips = movieInfo.trx_reward.toString();
                    const tokenTips = movieInfo.token_reward.toString();
                    const coverHash = movieInfo.cover_hash.toString();
                    const keywords = movieInfo.keywords.toString();
                    setTimeout(function (){movieInfoSection(movieHash, coverHash, movieName, thumbsUp, thumsDown, uploader,
                        trxTips,tokenTips, keywords, contract)}, timeout);
                }
            });
        }
    });
}

async function deleteMovie() {
    var hash = document.forms["deleteForm"]["deleteHash"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.deleteMovie(hash).send({
        shouldPollResponse: true
    });
}

async function addKeywords() {
    var hash = document.forms["addKeywordsForm"]["addHash"].value;
    var keywordsStr = document.forms["addKeywordsForm"]["keywords"].value;
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    console.log("keywords: ", keywords);
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.addKeywords(hash, keywords).send({
        shouldPollResponse: true
    });
}

async function removeKeywords() {
    var hash = document.forms["removeKeywordsForm"]["removeHash"].value;
    var keywordsStr = document.forms["removeKeywordsForm"]["keywords"].value;
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.removeKeywords(hash, keywords).send({
        shouldPollResponse: true
    });
}

async function addAdmin() {
    var addr = document.forms["administrative"]["addAddr"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.addAdminAccount(addr, 1).send({
        shouldPollResponse: true
    });
}

async function deleteAdmin() {
    var addr = document.forms["administrative"]["deleteAddr"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.addAdminAccount(addr, 0).send({
        shouldPollResponse: true
    });
}

async function ownershipTransfer() {
    var addr = document.forms["administrative"]["newOwnerAddr"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.transferOwnership(addr).send({
        shouldPollResponse: true
    });
}

async function getUploadedMovies() {
    document.getElementById("search_result").innerHTML = "";
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.getUploadedMovies().call().then((movies) => {
        if(movies.length == 0) {
            document.getElementById("search_result").innerText = "You have uploaded no movies.";
            return;
        }

        // get movie by name.
        for(var i = 0; i < movies.length; i++) {
            const movieHash = movies[i].toString();
            contract.getMovieInfo(movieHash).call().then((movieInfo) => {
                const movieName = movieInfo.name.toString();
                const thumbsUp = movieInfo.thumbsUp.toString();
                const thumbsDown = movieInfo.thumbsDown.toString();
                const uploader = movieInfo.uploader.toString();
                const trxTips = movieInfo.trx_reward.toString();
                const tokenTips = movieInfo.token_reward.toString();
                const coverHash = movieInfo.cover_hash.toString();
                const keywords = movieInfo.keywords.toString();
                console.log(movieInfo.keywords, keywords);
                setTimeout(function (){movieInfoSection(movieHash, coverHash, movieName, thumbsUp, thumbsDown, uploader,
                    trxTips,tokenTips, keywords, contract)}, timeout);
            });
        }
    });
}

async function changeFeePercent() {
    const newFeePercent = document.forms["administrative"]["newFeePercent"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.changeFeePercent(newFeePercent).send({
        shouldPollResponse: true
    });
}

async function changeTokenId() {
    const  newTokenId = document.forms["administrative"]["newTokenId"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.changeTokenId(newTokenId).send({
        shouldPollResponse: true
    });
}

function watch(hash) {
    let url = `https://gateway.btfs.trongrid.io./btfs/${hash}`;
    window.location.href=url;
}