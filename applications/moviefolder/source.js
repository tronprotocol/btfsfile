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
    var movieList = '';
    let path = url.path();
    var moviesController = new MoviesController('all');
    var appController = new AppController(path, moviesController);

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
function Movie(movieHash, coverHash, name, thumbUps, thumbDowns, trxTip, tokenTip, keywords) {
    this.movieHash = movieHash;
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
        console.log("deleting", this.movieHash)
        deleteMovie(this.movieHash)
    }

    this.getLikes = () => {
        let likes = this.thumbUps - this.thumbDowns;
        return (likes > 0 ) ? likes : 0;
    }

    this.render = (section) => {
        let mainContainer = $(section);

        var div = $('#index-movie-container-clone').clone();
        $(mainContainer).prepend(div);

        // append movie cover
        let poster = $(div).find('.index-movie-poster');
        let img = createElem("img", "", poster);
        img.setAttribute("src",  vars.baseURL+this.coverHash);
        $(poster).empty();
        $(poster).append(img);

        //download button
        $(div).find('.index-movie-download-btn').on("click", () => {
            watch(this.movieHash);
        })

        // append movie name and hash
        let title = $(div).find('.index-movie-title');
        $(title).html(this.name);

        //append thumbs up/down value
        this.thumbUpsValue = $(div).find('.index-movie-thumbsup-value');
        this.thumbDownsValue = $(div).find('.index-movie-thumbsdown-value');
        $(this.thumbUpsValue).html(this.thumbUps);
        $(this.thumbDownsValue).html(this.thumbDowns);


        // add click event listener to thumbs 
        $(div).find('.index-movie-thumbsup').on("click", async () => {
            if(!window.isTronLink){
                alert('Use with TronLink chrome extension to vote');
                return;
            }
            console.log("click thumbs up button:", this.movieHash);
            setTimeout(()=>{
                this.updateViewLikes('up');
            }, timeout)
            contract = await tronWeb.contract().at(contractAddr);
            let ret = await contract.thumbsUp(this.movieHash).send({
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

        $(div).find('.index-movie-thumbsdown').on("click", async () => {
            if(!window.isTronLink){
                alert('Use with TronLink chrome extension to vote');
                return
            }
            console.log("click thumbs down button:", this.movieHash);
            setTimeout(()=>{
                this.updateViewLikes('down');
            }, timeout)
            contract = await tronWeb.contract().at(contractAddr);
            let ret = await contract.thumbsDown(this.movieHash).send({
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
        this.bttValueDiv = $(div).find('.index-movie-btt-value');
        $(this.bttValueDiv).html(this.tokenTip/toSun);
        let tipBtn = $(div).find('.index-movie-tip-btn');
        this.tipValue = $(div).find('.index-movie-input');


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

                let tips = await contract.tipToken(this.movieHash).send({
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

        var div = $('#admin-movie-container-clone').clone();
        $(div).attr('id', this.movieHash)
        $(mainContainer).prepend(div);

        // append movie cover
        let poster = $(div).find('.admin-movie-poster');
        let img = createElem("img", "", poster);
        img.setAttribute("src",  vars.baseURL+this.coverHash);
        $(poster).empty();
        $(poster).append(img);

        //download button
        $(div).find('.admin-movie-download-btn').on("click", () => {
            this.delete();
        })

        // append movie name 
        let title = $(div).find('.admin-movie-title');
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

function MoviesController(state){
    this.movieList = [];
    this.searchList = [];
    this.state = state;


    this.getList = () => {

        if (this.state === 'all'){
            return this.movieList;
        }

        if(this.state === 'search'){
            return this.searchList
        }


        let list = this.movieList.find((element) => {
            return element.name === this.state
        })
        return [list]
    }

    this.push = (section) => {
        this.movieList.push(section)
    }

    this.updateSearchList = (section) => {
        this.searchList = [section];
    }

    this.updateState = (newState) => {
        this.state = newState;
    }

}

function AppController(path, moviesController){
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
                loadEventsListeners.index(moviesController);
                getAllMovies().then((list) => {
                    moviesController.push({name:'Ranked', list:list});
                    moviesController.push({name:'Featured', list:list});
                    moviesController.push({name:'New', list:list});

                    movieList = moviesController.getList();

                    renderMovieSections(moviesController, 'see more')
                    renderMovies(moviesController, false)
                })
                break;
            case "index.html":
                loadEventsListeners.index(moviesController);
                getAllMovies().then((list) => {
                    moviesController.push({name:'Ranked', list:list});
                    moviesController.push({name:'Featured', list:list});
                    moviesController.push({name:'New', list:list});

                    movieList = moviesController.getList();

                    renderMovieSections(moviesController, 'see more')
                    renderMovies(moviesController, false)
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

                    var movieList = [];
                    getUploadedMovies().then((list) => {

                        moviesController.updateState('search');
                        moviesController.updateSearchList({name:'uploaded', list:list});
                        renderMovies(moviesController, true)
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

function parseMovieInfo(movieInfo) {
    return {
        movieHash: movieInfo.movieHash.toString(),
        movieName: movieInfo.name.toString(),
        thumbsUp: movieInfo.thumbsUp.toString(),
        thumbsDown: movieInfo.thumbsDown.toString(),
        uploader: movieInfo.uploader.toString(),
        trxTips: movieInfo.trx_reward.toString(),
        tokenTips: movieInfo.token_reward.toString(),
        coverHash: movieInfo.cover_hash.toString(),
        keywords: movieInfo.keywords.toString(),
        popularity: parseInt(movieInfo.thumbsUp.toString()) / (parseInt(movieInfo.thumbsUp.toString())+parseInt(movieInfo.thumbsDown.toString())) || 0
    }
}

function renderMovies(moviesController, loadAll) {

    let movieList = moviesController.getList();

    for(let i = 0 ; i < movieList.length; i++){

        if(movieList[i].list){
            let num = (loadAll) ? 0 : movieList[i].list.length  - 5;
            if(num < 0){ num = 0}
            for(let j = num ; j < movieList[i].list.length ; j++){
                let id = '#' + movieList[i].name;
                let movie = movieList[i].list[j];
                let movieObj = new Movie(movie.movieHash, movie.coverHash, movie.movieName, movie.thumbsUp, movie.thumbsDown, movie.trxTips, movie.tokenTips, '');
                id = id.replace(/ /g,"_")
                switch(id){
                    case '#uploaded':
                        movieObj.renderAdmin(id);
                        break;
                    default :

                        movieObj.render(id); 
                        break;
                }
            }
        }
    }

}

function renderMovieSections(moviesController, subheader){

    let main = $('#main-container')
    main.empty();

    movieList = moviesController.getList();

    for (let i = 0; i < movieList.length; i++){

        let sectionHeader = createElem('div', 'section-header', main);
        let sectionTitle = createElem('span', 'section-title', sectionHeader);
        let sectionSeeMore = createElem('div', 'section-see-more', sectionHeader);
        let section = createElem('div', 'section-container', main);
        let id = movieList[i].name.replace(/ /g,"_");

        $(sectionTitle).html(movieList[i].name);
        $(sectionSeeMore).html(subheader);
        $(section).attr('id', id);

        $(sectionSeeMore).click(() => {
            if($(sectionSeeMore).html() === "back"){

                moviesController.updateState('all')
                renderMovieSections(moviesController, 'see more')
                renderMovies(moviesController, false)


            }
            else{

                moviesController.updateState(movieList[i].name)
                renderMovieSections(moviesController, 'back')
                renderMovies(moviesController, true)
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
        //movie file event listeners
        let movie = $('#movie');
        let movieTxt = $('#movie-input')
        $('#movie-browse').on('click', ()=> {
            $(movie).click()
        })
        $(movie).on('change', () => {
          const name = $(movie).val().split(/\\|\//).pop();
          const truncated = name.length > 20 
            ? name.substr(name.length - 20) 
            : name;
          movieTxt.html(truncated);
        });

        //movie cover event listeners
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

            if(($(movie).val() !== "") && ($(cover).val() !== "")){
                upload();
                loader.create(uploadBtn, ['connecting to network','traversing nodes','signing contract', 'uploading files'], ()=>{})

            }
            else{
                alert('fill required fields')
            }
            console.log($(movie).val(), $(cover).val())
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
    index: (moviesController) => {
        //search on click event
        $('#search-btn').on('click',function(){
            let searchTerm = $("#searchName").val();
            searchTerm = searchTerm.trim();
            
            if (searchTerm !== ""){

                let movieList = [];
                getMovies(searchTerm).then((list) => {

                    moviesController.updateState('search');
                    moviesController.updateSearchList({name:searchTerm, list:list})
                    renderMovieSections(moviesController, 'back')
                    renderMovies(moviesController, true)
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

                    let movieList = [];
                    getMovies(searchTerm).then((list) => {

                        moviesController.updateState('search');
                        moviesController.updateSearchList({name:searchTerm, list:list})
                        renderMovieSections(moviesController, 'back')
                        renderMovies(moviesController, true)
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

async function deleteMovie(hash) {
    contract = await tronWeb.contract().at(contractAddr);
    contract.deleteMovie(hash).send({
        shouldPollResponse: true
    }).then(()=>{
        console.log('deleted ',hash)
        $('#'+hash).remove();
        $('#popup-container').css("display", "none");
    })
    .catch((e) => {
        console.log(e)
        buttonRevert('.popup-movie-delete', "Delete");
    })
}

async function getAllMovies() {
    contract = await tronWeb.contract().at(contractAddr);
    let movies = await contract.getAllMovies().call();

    var movieQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < movies.length; i++) {
        const movieHash = movies[i].toString();
        let movieInfo = await contract.getMovieInfo(movieHash).call();
        movieInfo.movieHash = movieHash;
        let parsedMovie = parseMovieInfo(movieInfo);
        movieQueue.push(parsedMovie);
    }

    var array = [];
    while (movieQueue.length) array.push(movieQueue.pop());
    return array;
}

async function getMovies(name) {

    let main = $('#main-container').empty();

    let searchDiv = createElem('div', 'section-container wrap', main);
    $(searchDiv).attr('id', 'movie-search');
    
    contract = await tronWeb.contract().at(contractAddr);
    let movies = await contract.getMovies(name).call();

    if(movies["hashesByName"].length == 0 && movies["hashesByKeyword"].length == 0) {
        return;
    }

    // remove duplicated movies
    var movieList = movies["hashesByName"].concat(movies["hashesByKeyword"]);
    var uniqueMovieList = movieList.filter((item,index) => movieList.indexOf(item) === index)

    var movieQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < uniqueMovieList.length; i++) {
        const movieHash = uniqueMovieList[i].toString();
        let movieInfo = await contract.getMovieInfo(movieHash).call();
        movieInfo.movieHash = movieHash;
        let parsedMovie = parseMovieInfo(movieInfo);
        movieQueue.push(parsedMovie);
    }

    var array = [];
    while (movieQueue.length) array.push(movieQueue.pop());
    return array;

}

async function getUploadedMovies() {
    let path = url.path()
    let page = (path === "") ? "index" : "admin";
    contract = await tronWeb.contract().at(contractAddr);
    let movies = await contract.getUploadedMovies().call();
    if(movies.length == 0) {
        document.getElementById("main-container").innerText = "You have uploaded no movies.";
        return;
    }

    var movieQueue = new TinyQueue([], function (a, b) {
        return a.popularity - b.popularity;
    });

    for( i = 0; i < movies.length; i++) {
        const movieHash = movies[i].toString();
        let movieInfo = await contract.getMovieInfo(movieHash).call();
        movieInfo.movieHash = movieHash;
        let parsedMovie = parseMovieInfo(movieInfo);
        movieQueue.push(parsedMovie);
    }

    var array = [];
    while (movieQueue.length) array.push(movieQueue.pop());
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
    var movie = document.getElementById("movie");
    var cover = document.getElementById("cover");
    var movieHash, coverHash;

    if (movie.files.length > 0 && cover.files.length > 0) {

        var moviePromise = new Promise(function(resolve,reject) {
            ipfsClient.add(movie.files[0], (err, result) => {
                    if(err) {
                        console.error(err);
                        return
                    }
                    let url = vars.baseURL+result[0].hash;
                    console.log(`Url --> ${url}`);
                    movieHash = result[0].hash;
                    resolve(movieHash)
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

        Promise.all([moviePromise,coverPromise]).then((values)=>{
            console.log(values) // [movieHash,coverHash]
            setMovie(name, values[0], values[1])
        })

    }
}

async function setMovie(name, movieHash, coverHash) {
    console.log("movieHash: ",movieHash, " coverHash: ", coverHash);
    if(name == null || movieHash == null) {
        return;
    }
    contract = await tronWeb.contract().at(contractAddr)
    let keywordsStr = $('#uploadKeywords').val()
    keywordsStr = keywordsStr.replace(/\s+/g,"");
    var keywords = keywordsStr.split(",");
    console.log(keywords)
    contract.setMovie(name, movieHash, coverHash, keywords).send({
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
