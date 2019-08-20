const ipAddr = "api.btfssoter.io";
const ipPort = "443";
const timeout = 1000;
const contractAddr = "TMFoVTsfJfJpJ9WhBGz1d5VMCW6C2cJNgp";
const toSun = 1000000;

async function videoInfoSection(videoHash, coverHash, name, thumbsUp, thumbsDown, uploader, trxTip, tokenTip, keywords, contract) {
    if (contract == null) {
        contract = await window.tronWeb.contract().at(contractAddr);
    }

    // each div contains an video hash and its details.
    var div = document.createElement("div");
    div.setAttribute("id", videoHash);
    document.getElementById("search_result").appendChild(div);

    // append video cover
    var cover = document.createElement("img");
    console.log("https://gateway.btfssoter.io/btfs/"+coverHash);
    cover.setAttribute("src",  "https://gateway.btfssoter.io/btfs/"+coverHash);
    cover.setAttribute("width", 450);
    document.getElementById(videoHash).appendChild(cover);

    // append video name and hash
    var hash = document.createElement("section");
    hash.setAttribute("id",  "hash_"+videoHash);
    hash.setAttribute("value", videoHash);
    hash.innerHTML = "Name:["+name+"] Hash:["+videoHash+"]";
    document.getElementById(videoHash).appendChild(hash);

    // append keywords
    var keyword = document.createElement("section");
    keyword.setAttribute("id", "keywords_"+videoHash);
    keyword.setAttribute("value", videoHash);
    keyword.innerHTML = "Keywords:["+keywords+"]";
    document.getElementById(videoHash).appendChild(keyword);

    // add click listener to hash.
    hash.addEventListener("click", async function () {
        console.log("click hash to watcher:", this.value);
        watch(videoHash);
    }, false);

    // =========== thumbUp =============
    // append thumb up number.
    var thumbsUpNum = document.createElement("section");
    thumbsUpNum.setAttribute("id", "thumbsUp_num_"+videoHash);
    thumbsUpNum.innerHTML = thumbsUp;
    document.getElementById(videoHash).appendChild(thumbsUpNum);

    // thumb up button.
    var thumbsUpBtn = document.createElement("button");
    thumbsUpBtn.setAttribute("id", "thumbsUp_btn_"+videoHash);
    thumbsUpBtn.setAttribute("name", "thumbsUp_"+videoHash);
    thumbsUpBtn.setAttribute("value", videoHash);
    thumbsUpBtn.innerHTML = "Thumbs Up";
    document.getElementById("thumbsUp_num_"+videoHash).appendChild(thumbsUpBtn);

    // add click event listener to thumb up button.
    thumbsUpBtn.addEventListener("click", async function () {
        console.log("click thumbs up button:", this.value);
        let ret = await contract.thumbsUp(this.value).send({
            shouldPollResponse: true
        });
        setTimeout(function () {
            document.getElementById("thumbsUp_num_"+videoHash).innerHTML = ret.toString();
        }, timeout);
        console.log("likes-uploaded:", ret.toString());
    }, false);

    // =========== thumbDown =============
    // append thumb down number.
    var thumbsDownNum = document.createElement("section");
    thumbsDownNum.setAttribute("id", "thumbsDown_num_"+videoHash);
    thumbsDownNum.innerHTML = thumbsDown;
    document.getElementById(videoHash).appendChild(thumbsDownNum);

    // thumb down button.
    var thumbsDownBtn = document.createElement("button");
    thumbsDownBtn.setAttribute("id", "thumbsDown_btn_"+videoHash);
    thumbsDownBtn.setAttribute("name", "thumbsDown_"+videoHash);
    thumbsDownBtn.setAttribute("value", videoHash);
    thumbsDownBtn.innerHTML = "Thumbs Down";
    document.getElementById("thumbsDown_num_"+videoHash).appendChild(thumbsDownBtn);

    // add click event listener to thumb up button.
    thumbsDownBtn.addEventListener("click", async function () {
        console.log("click thumbs down button:", this.value);
        let dislikes = await contract.thumbsDown(this.value).send({
            shouldPollResponse: true
        });
        setTimeout(document.getElementById("thumbsDown_num_"+videoHash).innerHTML = dislikes.toString(), timeout);
        console.log("dislikes-uploaded:", dislikes.toString());
    }, false);

    // =========== tip TRX ============
    // 1. tips section
    var trxTips = document.createElement("section");
    trxTips.setAttribute("id", "trx_tips_" + videoHash);
    document.getElementById(videoHash).appendChild(trxTips);
    // 2. tips Button
    var trxTipsBtn = document.createElement("button");
    trxTipsBtn.setAttribute("id", "trx_tips_btn_" + videoHash);
    trxTipsBtn.setAttribute("name", "videoHash");
    trxTipsBtn.setAttribute("value", videoHash);
    trxTipsBtn.innerHTML = "Tips TRX";
    document.getElementById("trx_tips_" + videoHash).appendChild(trxTipsBtn);
    // 3. tips label
    var trxTipsLbl = document.createElement("label");
    trxTipsLbl.setAttribute("id", "trx_tips_lbl_" + videoHash);
    setTimeout(trxTipsLbl.innerHTML = trxTip / toSun, timeout);
    document.getElementById("trx_tips_" + videoHash).appendChild(trxTipsLbl);
    // 4. add click event listener to tips Button
    trxTipsBtn.addEventListener("click", async function() {
        console.log("click TRX tips Button:", this.value);
        const trxTipsAmountEntered = prompt("Please enter the amount of TRX you want to tip!", 0);
        if (trxTipsAmountEntered > 0) {
            let tips = await contract.tipTrx(this.value).send({
                callValue: trxTipsAmountEntered * toSun,
                shouldPollResponse: true
            });
            setTimeout(document.getElementById("trx_tips_lbl_" + videoHash).innerHTML = tips.toNumber() / toSun, timeout);
            console.log("trx-tips-updated:", tips.toNumber() / toSun);
        }
    }, false);
    // =========== end of tip TRX ============

    // =========== tip Token =============
    // tip tokenvideo
    // 1. tip token section
    var tokenTips = document.createElement("section");
    tokenTips.setAttribute("id", "token_tips_" + videoHash);
    document.getElementById(videoHash).appendChild(tokenTips);
    // 2. tiptoken Button
    var tokenTipsBtn = document.createElement("button");
    tokenTipsBtn.setAttribute("id", "token_tips_btn_" + videoHash);
    tokenTipsBtn.setAttribute("name", "videoHash");
    tokenTipsBtn.setAttribute("value", videoHash);
    tokenTipsBtn.innerHTML = "Tips Token";
    document.getElementById("token_tips_" + videoHash).appendChild(tokenTipsBtn);
    // 3. tiptoken label
    var tokenTipsLbl = document.createElement("label");
    tokenTipsLbl.setAttribute("id", "token_tips_lbl_" + videoHash);
    setTimeout(tokenTipsLbl.innerHTML = tokenTip, timeout);
    document.getElementById("token_tips_" + videoHash).appendChild(tokenTipsLbl);
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
            setTimeout(document.getElementById("token_tips_lbl_" + videoHash).innerHTML = tips.toString(), timeout);
            console.log("token-tips-updated:", tips.toString());
        }
    }, false);
    // =========== end of tip Token =============

    // uploader label.
    var uploaderLabel = document.createElement("uploader");
    uploaderLabel.setAttribute("id", "uploader_"+videoHash);
    uploaderLabel.setAttribute("value", videoHash);
    uploaderLabel.innerHTML = uploader;
    document.getElementById(videoHash).appendChild(uploaderLabel);

    // add <br/>
    var br = document.createElement("br");
    document.getElementById("uploader_"+videoHash).appendChild(br);
    document.getElementById("uploader_"+videoHash).appendChild(br);
}

async function upload() {
    var name = document.forms["uploadForm"]["uploadName"].value;
    var keywordsStr = document.forms["uploadForm"]["uploadKeywords"].value;
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    const btfs = window.IpfsApi({host:ipAddr, port:ipPort, protocol:'https'});
    const Buffer = window.IpfsApi().Buffer;
    const videoReader = new FileReader();
    var videoHash, coverHash;
    videoReader.onloadend = function () {
        const buf = Buffer.from(videoReader.result);
        btfs.files.add(buf, (err, result) => {
            if(err) {
                console.log(err);
                return
            }
            let url = `https://gateway.btfssoter.io./btfs/${result[0].hash}`;
            console.log(`Url --> ${url}`);
            document.getElementById("url").innerHTML= url;
            document.getElementById("url").href= url;
            document.getElementById("url").target = '_blank';
            videoHash = result[0].hash;
        });
    };
    const video = document.getElementById("video");
    videoReader.readAsArrayBuffer(video.files[0]);

    const coverReader = new FileReader();
    coverReader.onloadend = function () {
        const buf = Buffer.from(coverReader.result);
        btfs.files.add(buf, (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            let url = `https://gateway.btfssoter.io./btfs/${result[0].hash}`;
            console.log(`Url --> ${url}`);
            coverHash = result[0].hash;
        });
    };
    const cover = document.getElementById("cover");
    coverReader.readAsArrayBuffer(cover.files[0]);

    setTimeout(function () {setVideo(name, videoHash, coverHash, keywords)}, 7000);
}

async function setVideo(name, videoHash, coverHash, keywords) {
    console.log("videoHash: ",videoHash, " coverHash: ", coverHash);
    if(name == null || videoHash == null) {
        return;
    }
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.setVideo(name, videoHash, coverHash, keywords).send({
        shouldPollResponse: true
    });
}

async function getVideos() {
    document.getElementById("search_result").innerHTML = "";
    var name = document.forms["searchForm"]["searchName"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.getVideos(name).call().then((videos) => {
        if(videos["hashesByName"].length == 0 && videos["hashesByKeyword"].length == 0) {
            document.getElementById("search_result").innerText = "no video reference to '"+name+"'.";
            return;
        }

        // get video by name.
        for(var i = 0; i < videos["hashesByName"].length; i++) {
            const videoHash = videos["hashesByName"][i].toString();
            contract.getVideoInfo(videoHash).call().then((videoInfo) => {
                const videoName = videoInfo.name.toString();
                const thumbsUp = videoInfo.thumbsUp.toString();
                const thumbsDown = videoInfo.thumbsDown.toString();
                const uploader = videoInfo.uploader.toString();
                const trxTips = videoInfo.trx_reward.toString();
                const tokenTips = videoInfo.token_reward.toString();
                const coverHash = videoInfo.cover_hash.toString();
                const keywords = videoInfo.keywords.toString();
                console.log(videoInfo.keywords, keywords);
                setTimeout(function (){videoInfoSection(videoHash, coverHash, videoName, thumbsUp, thumbsDown, uploader,
                    trxTips,tokenTips, keywords, contract)}, timeout);
            });
        }

        // get video by keywords.
        for(var i = 0; i < videos["hashesByKeyword"].length; i++) {
            const videoHash = videos["hashesByKeyword"][i].toString();
            contract.getVideoInfo(videoHash).call().then((videoInfo) => {
                const videoName = videoInfo.name.toString();
                if(videoName != name) {
                    const videoName = videoInfo.name.toString();
                    const thumbsUp = videoInfo.thumbsUp.toString();
                    const thumsDown = videoInfo.thumbsDown.toString();
                    const uploader = videoInfo.uploader.toString();
                    const trxTips = videoInfo.trx_reward.toString();
                    const tokenTips = videoInfo.token_reward.toString();
                    const coverHash = videoInfo.cover_hash.toString();
                    const keywords = videoInfo.keywords.toString();
                    setTimeout(function (){videoInfoSection(videoHash, coverHash, videoName, thumbsUp, thumsDown, uploader,
                        trxTips,tokenTips, keywords, contract)}, timeout);
                }
            });
        }
    });
}

async function deleteVideo() {
    var hash = document.forms["deleteForm"]["deleteHash"].value;
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.deleteVideo(hash).send({
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

async function getUploadedVideos() {
    document.getElementById("search_result").innerHTML = "";
    contract = await window.tronWeb.contract().at(contractAddr);
    contract.getUploadedVideos().call().then((videos) => {
        if(videos.length == 0) {
            document.getElementById("search_result").innerText = "You have uploaded no videos.";
            return;
        }

        // get video by name.
        for(var i = 0; i < videos.length; i++) {
            const videoHash = videos[i].toString();
            contract.getVideoInfo(videoHash).call().then((videoInfo) => {
                const videoName = videoInfo.name.toString();
                const thumbsUp = videoInfo.thumbsUp.toString();
                const thumbsDown = videoInfo.thumbsDown.toString();
                const uploader = videoInfo.uploader.toString();
                const trxTips = videoInfo.trx_reward.toString();
                const tokenTips = videoInfo.token_reward.toString();
                const coverHash = videoInfo.cover_hash.toString();
                const keywords = videoInfo.keywords.toString();
                console.log(videoInfo.keywords, keywords);
                setTimeout(function (){videoInfoSection(videoHash, coverHash, videoName, thumbsUp, thumbsDown, uploader,
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
    let url = `https://gateway.btfssoter.io./btfs/${hash}`;
    window.location.href=url;
}