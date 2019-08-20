const vars = require('./vars.json');
const ipAddr = vars.hostIpAddr;
const ipPort = "443"
const timeout = 1000;
const contractAddr = vars.contractAddr;
const toSun = 1000000;

const $ = require('jQuery');
const IPFS = require('ipfs-http-client')
const TinyQueue = require('tinyqueue')
const TronWeb = require('tronweb')
var tronWeb = new TronWeb(
    vars.nodeURL,
    vars.nodeURL,
    vars.nodeURL
);
tronWeb.setAddress(vars.defaultUserAddr);
var ipfsClient = IPFS({ host: ipAddr, port: ipPort, protocol: 'https' })
const tronLinkTimeout = 1000;


$(window).on('load',function(){
    var videoList = '';
    let path = url.path();
    var videosController = new VideosController('all');
    var appController = new AppController(path, videosController);

    appController.load()

    initTronLink(tronWeb).then((tw) => {

        tronWeb = tw;
        appController.isTronLink = true;

        authCheck(tronWeb).then((isAuth) => {

                appController.isAuth = isAuth
                appController.postAuthLoad();
        })
    })
 });

///////////////////////////
// CLASSES 
///////////////////////////
function Video(videoHash, coverHash, name, thumbUps, thumbDowns, trxTip, tokenTip, keywords) {
    this.videoHash = videoHash;
    this.coverHash = coverHash;
    this.name = name;
    this.thumbUps = thumbUps;
    this.thumbDowns = thumbDowns;
    this.trxTip = trxTip;
    this.tokenTip = tokenTip;
    this.keywords = keywords.replace(/,/g, ' ');
    this.thumbUpsValue = "";
    this.thumbDownsValue = "";
    this.tipValue = "";
    this.bttValueDiv ="";

    this.delete = () => {
        console.log("deleting", this.videoHash)
        deleteVideo(this.videoHash)
    }

    this.getLikes = () => {
        let likes = this.thumbUps - this.thumbDowns;
        return (likes > 0 ) ? likes : 0;
    }

    this.render = (section) => {
        let mainContainer = $(section);

        var div = $('#index-video-container-clone').clone();
        $(mainContainer).prepend(div);

        // append video cover
        let poster = $(div).find('.index-video-poster');
        let img = createElem("img", "", poster);
        img.setAttribute("src",  vars.baseURL+this.coverHash);
        $(poster).empty();
        $(poster).append(img);

        //download button
        $(div).find('.index-video-download-btn').on("click", () => {
            watch(this.videoHash);
        })

        // append video name and hash
        let title = $(div).find('.index-video-title');
        $(title).html(this.name);

        //append thumbs up/down value
        this.thumbUpsValue = $(div).find('.index-video-thumbsup-value');
        this.thumbDownsValue = $(div).find('.index-video-thumbsdown-value');
        $(this.thumbUpsValue).html(this.thumbUps);
        $(this.thumbDownsValue).html(this.thumbDowns);


        // add click event listener to thumbs 
        $(div).find('.index-video-thumbsup').on("click", async () => {
            if(!window.isTronLink){
                alert('Use with TronLink chrome extension to vote');
                return;
            }
            console.log("click thumbs up button:", this.videoHash);
            setTimeout(()=>{
                this.updateViewLikes('up');
            }, timeout)
            contract = await tronWeb.contract().at(contractAddr);
            let ret = await contract.thumbsUp(this.videoHash).send({
                shouldPollResponse: true
            })
            .then((ret) => {

                console.log("likes-uploaded:", ret.toString());
                this.updateLikes(ret.toString(), "up");
            })
            .catch((e) => {
                console.log(e)
                this.revertViewLikes('up')

            })
        })

        $(div).find('.index-video-thumbsdown').on("click", async () => {
            if(!window.isTronLink){
                alert('Use with TronLink chrome extension to vote');
                return
            }
            console.log("click thumbs down button:", this.videoHash);
            setTimeout(()=>{
                this.updateViewLikes('down');
            }, timeout)
            contract = await tronWeb.contract().at(contractAddr);
            let ret = await contract.thumbsDown(this.videoHash).send({
                shouldPollResponse: true
            })
            .then((ret) => {

                console.log("dislikes-uploaded:", ret.toString());
                this.updateLikes(ret.toString(), "down");
            })
            .catch((e) => {
                console.log(e)
                this.revertViewLikes('down')

            })
        })

        //append btt value
        this.bttValueDiv = $(div).find('.index-video-btt-value');
        $(this.bttValueDiv).html(this.tokenTip/toSun);
        let tipBtn = $(div).find('.index-video-tip-btn');
        this.tipValue = $(div).find('.index-video-input');


        //tip eventListener
        tipBtn.on("click", async () => {
            if(!window.isTronLink){
                alert('Use with TronLink chrome extension to tip');
                return;
            }
            let value = this.tipValue.val();
            if(value > 0){
                contract = await tronWeb.contract().at(contractAddr);
                //update trx view
                setTimeout(() => {
                    this.updateViewTRX(value);
                    this.tipValue.val('');

                }, timeout)
                let tokenId = await contract.getTokenId().call();

                let tips = await contract.tipToken(this.videoHash).send({
                    tokenValue: value * toSun,
                    tokenId: tokenId,
                    shouldPollResponse: true
                })
                .then((tips) => {
                    this.updateTRX(tips.toNumber() / toSun);
                    console.log("btt-tips-updated:", tips.toNumber() / toSun);
                })
                .catch((e)=>{
                    console.log(e)
                    this.revertViewTRX();
                })
                
            }
        })
    }

    this.renderAdmin = (section) => {

        let mainContainer = $(section);

        var div = $('#admin-video-container-clone').clone();
        $(div).attr('id', this.videoHash)
        $(mainContainer).prepend(div);

        // append video cover
        let poster = $(div).find('.admin-video-poster');
        let img = createElem("img", "", poster);
        img.setAttribute("src",  vars.baseURL+this.coverHash);
        $(poster).empty();
        $(poster).append(img);

        //download button
        $(div).find('.admin-video-download-btn').on("click", () => {
            this.delete();
        })

        // append video name 
        let title = $(div).find('.admin-video-title');
        $(title).html(this.name);
        
    }

    this.updateTRX = (amount) => {

        this.tokenTip = amount;
    }

    this.updateViewTRX = (amount) => {

        let newValue =  parseFloat($(this.bttValueDiv).html()) + (parseFloat(amount)*parseFloat(vars.tipConversion));
        $(this.bttValueDiv).html(newValue);
    }

    this.revertViewTRX = () => {
        $(this.bttValueDiv).html(this.tokenTip/toSun);
    }

    this.updateLikes = (amount, type) => {

        switch(type){
            case "up":
                this.thumbUps = amount;
                break;
            case "down":
                this.thumbDowns = amount;
                break;

        }
    }

    this.updateViewLikes = (type) => {

        let thumbDiv="";
        let amount = "";

        switch(type){
            case "up":
                thumbDiv = this.thumbUpsValue;
                amount = parseInt(this.thumbUps) + 1;
                break;
            case "down":
                thumbDiv = this.thumbDownsValue;
                amount = parseInt(this.thumbDowns) + 1;
                break;

        }
        $(thumbDiv).html(amount)
    }

    this.revertViewLikes = (type) => {

        let thumbDiv="";
        let amount = "";

        switch(type){
            case "up":
                thumbDiv = this.thumbUpsValue;
                amount = this.thumbUps;
                break;
            case "down":
                thumbDiv = this.thumbDownsValue;
                amount = this.thumbDowns;
                break;

        }
        $(thumbDiv).html(amount)
    }
}

function VideosController(state){
    this.videoList = [];
    this.searchList = [];
    this.state = state;


    this.getList = () => {

        if (this.state === 'all'){
            return this.videoList;
        }

        if(this.state === 'search'){
            return this.searchList
        }


        let list = this.videoList.find((element) => {
            return element.name === this.state
        })
        return [list]
    }

    this.push = (section) => {
        this.videoList.push(section)
    }

    this.updateSearchList = (section) => {
        this.searchList = [section];
    }

    this.updateState = (newState) => {
        this.state = newState;
    }

}

function AppController(path, videosController){
    this.isAuth = false;
    this.isTronLink = false;
    this.path = path;

    loadEventsListeners.universal();

    this.load = () => {
        switch(this.path){
            case "upload.html":
                break;
            case "admin.html":
                break;
            case "":
                loadEventsListeners.index(videosController);
                getAllVideos().then((list) => {
                    videosController.push({name:'Ranked', list:list});
                    videosController.push({name:'Featured', list:list});
                    videosController.push({name:'New', list:list});

                    videoList = videosController.getList();

                    renderVideoSections(videosController, 'see more')
                    renderVideos(videosController, false)
                })
                break;
            case "index.html":
                loadEventsListeners.index(videosController);
                getAllVideos().then((list) => {
                    videosController.push({name:'Ranked', list:list});
                    videosController.push({name:'Featured', list:list});
                    videosController.push({name:'New', list:list});

                    videoList = videosController.getList();

                    renderVideoSections(videosController, 'see more')
                    renderVideos(videosController, false)
                })
                break;
        }
    }

    this.postAuthLoad = () => {

        switch(this.path){
            case "upload.html":
                if (this.isAuth){
                    loadEventsListeners.upload();
                    loadEventsListeners.auth();
                    $('#popup-container').fadeOut();
                }
                else{
                    //page redirect 
                    let link = url.getLink("")
                    window.open(link, "_self")
                }
                break;
            case "admin.html":
                if (this.isAuth){
                    
                    loadEventsListeners.auth();
                    $('#popup-container').fadeOut();

                    var videoList = [];
                    getUploadedVideos().then((list) => {

                        videosController.updateState('search');
                        videosController.updateSearchList({name:'uploaded', list:list});
                        renderVideos(videosController, true)
                    })
                }else{
                    //page redirect 
                    let link = url.getLink("")
                    window.open(link, "_self")
                }
                break;
            case "":
                if(this.isAuth){
                    loadEventsListeners.auth();
                }
                break;
            case "index.html":
                if(this.isAuth){
                    loadEventsListeners.auth();
                }
                break;
        }
    }


}
///////////////////////////
// HELPER FUNCTIONS 
///////////////////////////

function createElem(element, className, parent){
    let elem = document.createElement(element);
    $(elem).addClass(className);
    $(parent).append(elem);

    return elem;
}

function buttonRevert(button, text){
    $(button).empty().html(text).removeClass('loader-bg')
}

//init tronWeb based on tronLink state
async function initTronLink(tronWeb){

    let promise = new Promise((resolve, reject) => {

        setTimeout(()=>{
            resolve(tronWeb)

        }, tronLinkTimeout)

        try{
           window.tronWeb.contract().at(contractAddr).then(() => {
                let isInstalled = false;
                let isSignedIn = false;

                if(window.tronWeb !== undefined){
                    isInstalled = true;
                    window.isTronLink = true;
                    if (window.tronWeb.defaultAddress.hex !== false){
                        isSignedIn = true;
                    }
                }

                console.log('isInstalled', isInstalled)
                console.log('isSignedIn', isSignedIn)

                if(isInstalled && isSignedIn){
                    resolve(window.tronWeb) 
                }

                resolve(tronWeb)
            })

        }
        catch{
            window.isTronLink = false;
            resolve(tronWeb)
        }

    })


    return promise;
}

function loadDocument(doc){
    $('#popup-container').css("display", "flex");
    let popup = $('#popup');
    $(popup).removeClass();
    $(popup).empty();
    $(popup).addClass('documents');
    let img = createElem('object','',popup)
    let pathRoot = url.pathRoot()
    let pdf = pathRoot+'documents/'+doc + '.pdf';
    img.setAttribute('data',pdf)
    img.setAttribute('width','700px')
    let height = $(window).height() + ' px'
    img.setAttribute('height',height)
}

function parseVideoInfo(videoInfo) {
    return {
        videoHash: videoInfo.videoHash.toString(),
        videoName: videoInfo.name.toString(),
        thumbsUp: videoInfo.thumbsUp.toString(),
        thumbsDown: videoInfo.thumbsDown.toString(),
        uploader: videoInfo.uploader.toString(),
        trxTips: videoInfo.trx_reward.toString(),
        tokenTips: videoInfo.token_reward.toString(),
        coverHash: videoInfo.cover_hash.toString(),
        keywords: videoInfo.keywords.toString(),
        popularity: parseInt(videoInfo.thumbsUp.toString()) / (parseInt(videoInfo.thumbsUp.toString())+parseInt(videoInfo.thumbsDown.toString())) || 0
    }
}

function renderVideos(videosController, loadAll) {

    let videoList = videosController.getList();

    for(let i = 0 ; i < videoList.length; i++){

        if(videoList[i].list){
            let num = (loadAll) ? 0 : videoList[i].list.length  - 5;
            if(num < 0){ num = 0}
            for(let j = num ; j < videoList[i].list.length ; j++){
                let id = '#' + videoList[i].name;
                let video = videoList[i].list[j];
                let videoObj = new Video(video.videoHash, video.coverHash, video.videoName, video.thumbsUp, video.thumbsDown, video.trxTips, video.tokenTips, '');
                id = id.replace(/ /g,"_")
                switch(id){
                    case '#uploaded':
                        videoObj.renderAdmin(id);
                        break;
                    default :

                        videoObj.render(id); 
                        break;
                }
            }
        }
    }

}

function renderVideoSections(videosController, subheader){

    let main = $('#main-container')
    main.empty();

    videoList = videosController.getList();

    for (let i = 0; i < videoList.length; i++){

        let sectionHeader = createElem('div', 'section-header', main);
        let sectionTitle = createElem('span', 'section-title', sectionHeader);
        let sectionSeeMore = createElem('div', 'section-see-more', sectionHeader);
        let section = createElem('div', 'section-container', main);
        let id = videoList[i].name.replace(/ /g,"_");

        $(sectionTitle).html(videoList[i].name);
        $(sectionSeeMore).html(subheader);
        $(section).attr('id', id);

        $(sectionSeeMore).click(() => {
            if($(sectionSeeMore).html() === "back"){

                videosController.updateState('all')
                renderVideoSections(videosController, 'see more')
                renderVideos(videosController, false)


            }
            else{

                videosController.updateState(videoList[i].name)
                renderVideoSections(videosController, 'back')
                renderVideos(videosController, true)
            }

        })
    }

    main.hide().fadeIn();

}

function watch(hash) {

    fetch( vars.baseURL+hash )
    .then(res => res.blob())
    .then(blob => {
       let a = document.createElement("a");
       a.href = URL.createObjectURL(blob);
       a.download = hash + '.torrent';
       a.hidden = true;
       document.body.appendChild(a);
       a.innerHTML =
          "someinnerhtml";
       a.click();
    })
}

let loader = {

    create:(button, messages, callback) => {
            $(button).empty();

            let loader = createElem('img','loader spinner',button);
            loader.setAttribute('src','imgs/tron.svg')
            $(button).addClass('loader-bg')
            let message = createElem('p', 'loader-txt', button)

            for(let i = 0; i < messages.length; i++ ){
                setTimeout(()=>{
                    message.innerHTML = messages[i]
                }, i*3000)
            }

            callback();
    },
}

let loadEventsListeners = {
    upload:() => {
        //video file event listeners
        let video = $('#video');
        let videoTxt = $('#video-input')
        $('#video-browse').on('click', ()=> {
            $(video).click()
        })
        $(video).on('change', () => {
          const name = $(video).val().split(/\\|\//).pop();
          const truncated = name.length > 20 
            ? name.substr(name.length - 20) 
            : name;
          videoTxt.html(truncated);
        });

        //video cover event listeners
        let cover = $('#cover');
        let coverTxt = $('#cover-input')
        $('#cover-browse').on('click', ()=> {
            $(cover).click()
        })
        $(cover).on('change', () => {
          const name = $(cover).val().split(/\\|\//).pop();
          const truncated = name.length >20 
            ? name.substr(name.length - 20) 
            : name;
          coverTxt.html(truncated);
        });

        let uploadBtn = $('#upload-btn');

        uploadBtn.click(() => {

            if(($(video).val() !== "") && ($(cover).val() !== "")){
                upload();
                loader.create(uploadBtn, ['connecting to network','traversing nodes','signing contract', 'uploading files'], ()=>{})

            }
            else{
                alert('fill required fields')
            }
            console.log($(video).val(), $(cover).val())
        })
    },
    auth: () => {
            //update admin name
            $('#ownerName').css('display','block')

            //Admin nav event listener
            $("#signin").on("click", () => {
                $('#admin-nav').slideToggle();
            })

            //admin profile
            $("#admin-profile").on("click", () => {
                let link = url.getLink('admin.html');
                window.open(link, "_self");
            })

            //admin download
            $("#admin-download").on("click", () => {
                let link = url.getLink('');
                window.open(link, "_self");
            })

            //admin upload
            $("#admin-upload").on("click", () => {
                let link = url.getLink('upload.html');
                window.open(link, "_self");
            })


    },
    index: (videosController) => {
        //search on click event
        $('#search-btn').on('click',function(){
            let searchTerm = $("#searchName").val();
            searchTerm = searchTerm.trim();
            
            if (searchTerm !== ""){

                let videoList = [];
                getVideos(searchTerm).then((list) => {

                    videosController.updateState('search');
                    videosController.updateSearchList({name:searchTerm, list:list})
                    renderVideoSections(videosController, 'back')
                    renderVideos(videosController, true)
                })
            }

        })

        //search enter keypress event
        $('#searchName').keypress(function(e){
            if (event.keyCode === 10 || event.keyCode === 13) {
                e.preventDefault();
                let searchTerm = $("#searchName").val();
                searchTerm = searchTerm.trim();
                
                if (searchTerm !== ""){

                    let videoList = [];
                    getVideos(searchTerm).then((list) => {

                        videosController.updateState('search');
                        videosController.updateSearchList({name:searchTerm, list:list})
                        renderVideoSections(videosController, 'back')
                        renderVideos(videosController, true)
                    })
                }
            }
        })

    },
    universal: () => {
        //close popup on outside click
        $('#popup-container').on('click',() => {
            if (event.target.id === "popup-container"){
                $('#popup-container').css("display", "none")
            }
        })

        $('#community-rules').click(function(){
            let doc = $(this).attr('id')
            loadDocument(doc)
        })
        $('#privacy-policy').click(function(){
            let doc = $(this).attr('id')
            loadDocument(doc)
        })
        $('#terms-of-service').click(function(){
            let doc = $(this).attr('id')
            loadDocument(doc)
        })
        $('#title').click(() => {
            let link = url.getLink("")
            window.open(link, '_self')
        })
    }
}

let url = {
    path:()=>{
        let path = window.location.pathname;
        return path.slice(path.lastIndexOf('/') + 1)
    },
    pathRoot:()=>{
        let path = window.location.pathname;
        return path.slice(0,path.lastIndexOf('/') + 1)

    },
    getLink:(end)=>{
        let path = window.location.pathname;
        console.log(path.slice(0,path.lastIndexOf('/')))
        return window.location.origin + path.slice(0,path.lastIndexOf('/') + 1) + end;
    }
}

///////////////////////////
// SMART CONTRACT FUNCTIONS
///////////////////////////

async function addKeywords(hash, keywordsStr, contract) {
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    console.log("keywords: ", keywords);
    contract = await tronWeb.contract().at(contractAddr);
    return contract.addKeywords(hash, keywords).send({
        shouldPollResponse: true
    });
}

async function authCheck(tronWeb){
    contract = await tronWeb.contract().at(contractAddr);
    let addr = tronWeb.defaultAddress.hex;

    //check if admin
    var adminPromise = new Promise(function(resolve, reject){

        contract.admins(addr).call().then((res)=>{
            if(parseInt(res._hex) === 1){
                resolve(1)
            }
            resolve(0)
        })
    })

    //check if owner
    var ownerPromise = new Promise(function(resolve,reject){

        contract.owner().call().then((res)=>{
            if(res === addr){
                resolve(1)
            }
            resolve(0)
        })
    })

    return Promise.all([adminPromise, ownerPromise]).then((values) => {
        console.log('admin:', values[0], 'owner', values[1]);
        let authCheck = values[0] + values[1]
        return ((values[0] + values[1]) > 0 ? true : false )
    })

    //authorized if admin || owner
}

async function deleteVideo(hash) {
    contract = await tronWeb.contract().at(contractAddr);
    contract.deleteVideo(hash).send({
        shouldPollResponse: true
    }).then(()=>{
        console.log('deleted ',hash)
        $('#'+hash).remove();
        $('#popup-container').css("display", "none");
    })
    .catch((e) => {
        console.log(e)
        buttonRevert('.popup-video-delete', "Delete");
    })
}

async function getAllVideos() {
    contract = await tronWeb.contract().at(contractAddr);
    let videos = await contract.getAllVideos().call();

    var videoQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < videos.length; i++) {
        const videoHash = videos[i].toString();
        let videoInfo = await contract.getVideoInfo(videoHash).call();
        videoInfo.videoHash = videoHash;
        let parsedVideo = parseVideoInfo(videoInfo);
        videoQueue.push(parsedVideo);
    }

    var array = [];
    while (videoQueue.length) array.push(videoQueue.pop());
    return array;
}

async function getVideos(name) {

    let main = $('#main-container').empty();

    let searchDiv = createElem('div', 'section-container wrap', main);
    $(searchDiv).attr('id', 'video-search');
    
    contract = await tronWeb.contract().at(contractAddr);
    let videos = await contract.getVideos(name).call();

    if(videos["hashesByName"].length == 0 && videos["hashesByKeyword"].length == 0) {
        return;
    }

    // remove duplicated videos
    var videoList = videos["hashesByName"].concat(videos["hashesByKeyword"]);
    var uniqueVideoList = videoList.filter((item,index) => videoList.indexOf(item) === index)

    var videoQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < uniqueVideoList.length; i++) {
        const videoHash = uniqueVideoList[i].toString();
        let videoInfo = await contract.getVideoInfo(videoHash).call();
        videoInfo.videoHash = videoHash;
        let parsedVideo = parseVideoInfo(videoInfo);
        videoQueue.push(parsedVideo);
    }

    var array = [];
    while (videoQueue.length) array.push(videoQueue.pop());
    return array;

}

async function getUploadedVideos() {
    let path = url.path()
    let page = (path === "") ? "index" : "admin";
    contract = await tronWeb.contract().at(contractAddr);
    let videos = await contract.getUploadedVideos().call();
    if(videos.length == 0) {
        document.getElementById("main-container").innerText = "You have uploaded no videos.";
        return;
    }

    var videoQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < videos.length; i++) {
        const videoHash = videos[i].toString();
        let videoInfo = await contract.getVideoInfo(videoHash).call();
        videoInfo.videoHash = videoHash;
        let parsedVideo = parseVideoInfo(videoInfo);
        videoQueue.push(parsedVideo);
    }

    var array = [];
    while (videoQueue.length) array.push(videoQueue.pop());
    return array;
}

async function removeKeywords() {
    var hash = document.forms["removeKeywordsForm"]["removeHash"].value;
    var keywordsStr = document.forms["removeKeywordsForm"]["keywords"].value;
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    contract = await tronWeb.contract().at(contractAddr);
    contract.removeKeywords(hash, keywords).send({
        shouldPollResponse: true
    });
}

async function upload() {
    var name = document.forms["uploadForm"]["uploadName"].value;
    var video = document.getElementById("video");
    var cover = document.getElementById("cover");
    var videoHash, coverHash;

    if (video.files.length > 0 && cover.files.length > 0) {

        var videoPromise = new Promise(function(resolve,reject) {
            ipfsClient.add(video.files[0], (err, result) => {
                    if(err) {
                        console.error(err);
                        return
                    }
                    let url = vars.baseURL+result[0].hash;
                    console.log(`Url --> ${url}`);
                    videoHash = result[0].hash;
                    resolve(videoHash)
                });

            })

        var coverPromise = new Promise(function(resolve,reject) {
                ipfsClient.add(cover.files[0], (err, result) => {
                    if(err) {
                        console.error(err);
                        return
                    }
                    let url = vars.baseURL+result[0].hash;
                    console.log(`Url --> ${url}`);
                    coverHash = result[0].hash;
                    resolve(coverHash)

                });
            })

        Promise.all([videoPromise,coverPromise]).then((values)=>{
            console.log(values) // [videoHash,coverHash]
            setVideo(name, values[0], values[1])
        })

    }
}

async function setVideo(name, videoHash, coverHash) {
    console.log("videoHash: ",videoHash, " coverHash: ", coverHash);
    if(name == null || videoHash == null) {
        return;
    }
    contract = await tronWeb.contract().at(contractAddr)
    let keywordsStr = $('#uploadKeywords').val()
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    console.log(keywords)
    contract.setVideo(name, videoHash, coverHash, keywords).send({
        shouldPollResponse: true
    })
    .then(() => {
        console.log('successful upload');
        let link = url.getLink('admin.html');
        window.open(link, "_self");

    })

    .catch((e) => {
        console.log(e)
        buttonRevert('#upload-btn', "Upload");
    })
}
