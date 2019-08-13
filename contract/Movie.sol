pragma solidity ^0.4.3;
pragma experimental ABIEncoderV2;

contract Manageable {
    address public owner;
    mapping(address => uint) public admins;
    bool public locked = false;

    event onOwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param _newOwner The address to transfer ownership to.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0));
        emit onOwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || admins[msg.sender] == 1);
        _;
    }

    modifier onlyUploader(address uploader) {
        require(msg.sender == owner || msg.sender == uploader);
        _;
    }

    function addAdminAccount(address _newAdminAccount, uint256 _status) public onlyOwner {
        require(_newAdminAccount != address(0));
        admins[_newAdminAccount] = _status;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not locked.
     */
    modifier isNotLocked() {
        require(!locked || msg.sender == owner);
        _;
    }

    /**
     * @dev called by the owner to set lock state, triggers stop/continue state
     */
    function setLock(bool _value) onlyAdmin public {
        locked = _value;
    }
}

contract Movies is Manageable {
    // the movie information
    struct Movie {
        string name;
        string cover_hash;
        Thumbs thumbs;   // the information about thumb up and thumb down.
        uint256 trx_reward;
        uint256 token_reward;
        address uploader;   // who call the setMovie func.
        StringArray keywords;
    }

    // the thumbs up/down information
    struct Thumbs {
        address[] thumbsUpByWhom;
        address[] thumbsDownByWhom;
        mapping(address => uint) thumbsUpIndex;     // store the address that thumb up;
        mapping(address => uint) thumbsDownIndex;   // store the address that thumb down;
    }

    mapping(string => StringArray) moviesByName;   // name => hashes
    mapping(string => Movie) movieInfo;         // hash => move info
    mapping(string => StringArray) keywordIndex;   // keyword => the hash in the same key words.
    mapping(address => StringArray) moviesByUploader;   // address => hashes, store all the movies that somebody has uploaded.
    StringArray allMovies;                   // all the movies' hash.

    struct StringArray {
        string[] array;      // the string array
        mapping(string => uint256) index;  // the index of string array.
    }

    uint256 fee_percent;
    uint256 tokenId;

    constructor() public {
        fee_percent = 20;
        tokenId = 1002000;
    }

    // set the movie hash, poster hash and movie name in smart contract.
    function setMovie(string name, string movieHash, string coverHash, string[] keywords) public onlyAdmin {
        // if the movie hash been uploaded, revert.
        require(movieInfo[movieHash].uploader == address(0), "This movie has been uploaded");

        // set movie.
        moviesByName[name].array.push(movieHash);
        moviesByName[name].index[movieHash] = moviesByName[name].array.length;
        movieInfo[movieHash].name = name;
        movieInfo[movieHash].uploader = msg.sender;
        movieInfo[movieHash].cover_hash = coverHash;

        // set keywords.
        addKeywords(movieHash, keywords);

        // set the movie to moviesByUploader.
        moviesByUploader[msg.sender].array.push(movieHash);
        moviesByUploader[msg.sender].index[movieHash] = moviesByUploader[msg.sender].array.length;

        // set the movie into allMovies.
        allMovies.array.push(movieHash);
        allMovies.index[movieHash] = allMovies.array.length;
    }

    // add keywords to the movie and keyword index.
    function addKeywords(string hash, string[] keywords) public onlyUploader(movieInfo[hash].uploader) {
        if(movieInfo[hash].uploader != address(0) ) {
            for(uint i=0; i < keywords.length; i ++) {
                // if the keyword doesn't been added.
                if(movieInfo[hash].keywords.index[keywords[i]] == 0) {
                    // add the keywords to the movieInfo
                    movieInfo[hash].keywords.array.push(keywords[i]);
                    movieInfo[hash].keywords.index[keywords[i]] = movieInfo[hash].keywords.array.length;

                    // add the keyword to keywordIndex.
                    keywordIndex[keywords[i]].array.push(hash);
                    keywordIndex[keywords[i]].index[hash] = keywordIndex[keywords[i]].array.length;
                }
            }
        }
    }

    // remove the movie's keyword.
    function removeKeywords(string hash, string[] keywords) public onlyUploader(movieInfo[hash].uploader) {
        if(movieInfo[hash].uploader != address(0)) {
            for(uint j=0; j < keywords.length; j++){
                uint index = movieInfo[hash].keywords.index[keywords[j]] - 1;
                uint len = movieInfo[hash].keywords.array.length;
                // remove keyword from movieInfo.
                if (index != len-1) {
                    movieInfo[hash].keywords.index[movieInfo[hash].keywords.array[len-1]] = index+1;
                    movieInfo[hash].keywords.array[index] = movieInfo[hash].keywords.array[len-1];
                }
                delete movieInfo[hash].keywords.array[len-1];
                movieInfo[hash].keywords.array.length--;
                movieInfo[hash].keywords.index[keywords[j]] = 0;

                // remove keyword from keywordIndex.
                index = keywordIndex[keywords[j]].index[hash] - 1;
                len = keywordIndex[keywords[j]].array.length;
                if(index != len-1) {
                    keywordIndex[keywords[j]].index[keywordIndex[keywords[j]].array[len-1]] = index+1;
                    keywordIndex[keywords[j]].array[index] = keywordIndex[keywords[j]].array[len-1];
                }
                delete keywordIndex[keywords[j]].array[len-1];
                keywordIndex[keywords[j]].array.length--;
                keywordIndex[keywords[j]].index[hash] = 0;
            }
        }
    }

    // delete movie by movie hash.
    function deleteMovie(string hash) public onlyUploader(movieInfo[hash].uploader) returns (bool){
        // if the movie is exist, delete it form movieInfo and movies.
        if (movieInfo[hash].uploader != address(0)) {
            // delete reference keywords.
            for(uint i=0; i<movieInfo[hash].keywords.array.length; i++) {
                // remove keyword from keywordIndex and delete keyword map.
                string keyword = movieInfo[hash].keywords.array[i];
                index = keywordIndex[keyword].index[hash] - 1;
                len = keywordIndex[keyword].array.length;
                if(index != len-1) {
                    keywordIndex[keyword].index[keywordIndex[keyword].array[len-1]] = index+1;
                    keywordIndex[keyword].array[index] = keywordIndex[keyword].array[len-1];
                }
                delete keywordIndex[keyword].array[len-1];
                keywordIndex[keyword].array.length--;
                keywordIndex[keyword].index[hash] = 0;

                // delete keywords map.
                delete movieInfo[hash].keywords.index[keyword];
            }

            // delete it from movies.
            uint len = moviesByName[movieInfo[hash].name].array.length;
            uint index = moviesByName[movieInfo[hash].name].index[hash]-1;
            if (index != len-1) {
                moviesByName[movieInfo[hash].name].index[moviesByName[movieInfo[hash].name].array[len-1]] = index+1;
                moviesByName[movieInfo[hash].name].array[index] = moviesByName[movieInfo[hash].name].array[len-1];
            }
            delete moviesByName[movieInfo[hash].name].array[len-1];
            moviesByName[movieInfo[hash].name].array.length--;
            moviesByName[movieInfo[hash].name].index[hash] = 0;

            // delete from moviesByUploader.
            index = moviesByUploader[movieInfo[hash].uploader].index[hash] - 1;
            len = moviesByUploader[movieInfo[hash].uploader].array.length;
            if (index != len-1) {
                moviesByUploader[movieInfo[hash].uploader].index[moviesByUploader[movieInfo[hash].uploader].array[len-1]] = index+1;
                moviesByUploader[movieInfo[hash].uploader].array[index] = moviesByUploader[movieInfo[hash].uploader].array[len-1];
            }
            delete moviesByUploader[movieInfo[hash].uploader].array[len-1];
            moviesByUploader[movieInfo[hash].uploader].array.length--;
            moviesByUploader[movieInfo[hash].uploader].index[hash] = 0;

            // delete from moviesInfo.
            // delete thumbs map.
            for (i=0; i<movieInfo[hash].thumbs.thumbsUpByWhom.length; i++) {
                delete movieInfo[hash].thumbs.thumbsUpIndex[movieInfo[hash].thumbs.thumbsUpByWhom[i]];
            }
            for (i=0; i<movieInfo[hash].thumbs.thumbsDownByWhom.length; i++) {
                delete movieInfo[hash].thumbs.thumbsDownIndex[movieInfo[hash].thumbs.thumbsDownByWhom[i]];
            }
            // delete movieInfo.
            delete movieInfo[hash];

            // delete from allMovies and indexOfAllMovies.
            index = allMovies.index[hash] -1;
            len = allMovies.array.length;
            if (index != len-1) {
                allMovies.index[allMovies.array[len-1]] = index+1;
                allMovies.array[index] = allMovies.array[len-1];
            }
            delete allMovies.array[len-1];
            allMovies.array.length--;
            allMovies.index[hash] = 0;

            return true;
        }

        return false;
    }

    // get all the movie hashes which names the given name.
    function getMovies(string s) public view returns (string[] hashesByName, string[] hashesByKeyword) {
        hashesByName = moviesByName[s].array;
        hashesByKeyword = keywordIndex[s].array;
    }

    // function to get all the movies.
    function getAllMovies() public view returns (string[]) {
        return allMovies.array;
    }

    // get all the movie hashes that somebody uploaded.
    function getUploadedMovies() public view returns (string[]) {
        return moviesByUploader[msg.sender].array;
    }

    // get the movie info by movie hash.
    function getMovieInfo(string hash) public view returns (
        string name, string cover_hash, string[] keywords, uint256 trx_reward, uint256 token_reward,
        uint256 thumbsUp, uint256 thumbsDown, address uploader) {
        name = movieInfo[hash].name;
        trx_reward = movieInfo[hash].trx_reward;
        token_reward = movieInfo[hash].token_reward;
        thumbsUp = movieInfo[hash].thumbs.thumbsUpByWhom.length;
        thumbsDown = movieInfo[hash].thumbs.thumbsDownByWhom.length;
        uploader = movieInfo[hash].uploader;
        cover_hash = movieInfo[hash].cover_hash;
        keywords = movieInfo[hash].keywords.array;
    }

    // thumbs up a movie by movie hash.
    function thumbsUp(string hash) public payable returns (uint256) {
        require(movieInfo[hash].thumbs.thumbsUpIndex[msg.sender] == 0, "you've thumbs up before");

        movieInfo[hash].thumbs.thumbsUpByWhom.push(msg.sender);
        movieInfo[hash].thumbs.thumbsUpIndex[msg.sender] = 1;

        return movieInfo[hash].thumbs.thumbsUpByWhom.length;
    }

    // get the movie thumbs up number by movie hash.
    function getThumbsUp(string hash) public view returns (uint256) {
        return movieInfo[hash].thumbs.thumbsUpByWhom.length;
    }

    // thumbs down a movie by hash.
    function thumbsDown(string hash) public returns (uint256){
        require(movieInfo[hash].thumbs.thumbsDownIndex[msg.sender] == 0, "you've thumbs down before");

        movieInfo[hash].thumbs.thumbsDownByWhom.push(msg.sender);
        movieInfo[hash].thumbs.thumbsDownIndex[msg.sender] = 1;

        return movieInfo[hash].thumbs.thumbsDownByWhom.length;
    }

    // get the movie thumbs down number by movie hash.
    function getThumbsDown(string hash) public view returns (uint256) {
        return movieInfo[hash].thumbs.thumbsDownByWhom.length;
    }

    // tips token to the movie by hash, the token will give to by movie uploader and admin in percentage.
    function tipToken(string hash) public payable returns (uint256) {
        require(msg.tokenid == tokenId, "wrong token id");

        if (msg.tokenvalue > 0 ) {
            uint256 token_fee_amount = msg.tokenvalue * fee_percent / 100;
            owner.transferToken(token_fee_amount, tokenId);
            movieInfo[hash].uploader.transferToken(msg.tokenvalue-token_fee_amount, tokenId);
            movieInfo[hash].token_reward += msg.tokenvalue-token_fee_amount;
        }

        return movieInfo[hash].token_reward;
    }

    // return how much token that the movie uploader get.
    function getTokenTips(string hash) public view returns (uint256) {
        return movieInfo[hash].token_reward;
    }

    // tips trx to the movie by hash, the trx will give to by movie uploader and admin in percentage.
    function tipTrx(string hash) public payable returns (uint256) {
        if (msg.value > 0) {
            uint256 fee_amount = msg.value * fee_percent / 100;
            owner.transfer(fee_amount);
            movieInfo[hash].uploader.transfer(msg.value-fee_amount);
            movieInfo[hash].trx_reward += msg.value-fee_amount;
        }

        return movieInfo[hash].trx_reward;
    }

    // return how much trx that the movie uploader get.
    function getTrxTips(string hash) public view returns (uint256) {
        return movieInfo[hash].trx_reward;
    }

    // get which token id that tips a token require.
    function getTokenId() public view returns (uint256) {
        return tokenId;
    }

    // function to change the fee percent.
    function changeFeePercent(uint _percent) public onlyOwner {
        require(_percent >= 0 && _percent <= 100, "fee percent should between 1~100");
        fee_percent = _percent;
    }

    // function to change the tokenId.
    function changeTokenId(uint256 _tokenId) public onlyOwner {
        tokenId = _tokenId;
    }
}