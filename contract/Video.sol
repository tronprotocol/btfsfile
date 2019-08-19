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

contract Videos is Manageable {
    // the video information
    struct Video {
        string name;
        string cover_hash;
        Thumbs thumbs;   // the information about thumb up and thumb down.
        uint256 trx_reward;
        uint256 token_reward;
        address uploader;   // who call the setVideo func.
        StringArray keywords;
    }

    // the thumbs up/down information
    struct Thumbs {
        address[] thumbsUpByWhom;
        address[] thumbsDownByWhom;
        mapping(address => uint) thumbsUpIndex;     // store the address that thumb up;
        mapping(address => uint) thumbsDownIndex;   // store the address that thumb down;
    }

    mapping(string => StringArray) videosByName;   // name => hashes
    mapping(string => Video) videoInfo;         // hash => move info
    mapping(string => StringArray) keywordIndex;   // keyword => the hash in the same key words.
    mapping(address => StringArray) videosByUploader;   // address => hashes, store all the videos that somebody has uploaded.
    StringArray allVideos;                   // all the videos' hash.

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

    // set the video hash, poster hash and video name in smart contract.
    function setVideo(string name, string videoHash, string coverHash, string[] keywords) public onlyAdmin {
        // if the video hash been uploaded, revert.
        require(videoInfo[videoHash].uploader == address(0), "This video has been uploaded");

        // set video.
        videosByName[name].array.push(videoHash);
        videosByName[name].index[videoHash] = videosByName[name].array.length;
        videoInfo[videoHash].name = name;
        videoInfo[videoHash].uploader = msg.sender;
        videoInfo[videoHash].cover_hash = coverHash;

        // set keywords.
        addKeywords(videoHash, keywords);

        // set the video to videosByUploader.
        videosByUploader[msg.sender].array.push(videoHash);
        videosByUploader[msg.sender].index[videoHash] = videosByUploader[msg.sender].array.length;

        // set the video into allVideos.
        allVideos.array.push(videoHash);
        allVideos.index[videoHash] = allVideos.array.length;
    }

    // add keywords to the video and keyword index.
    function addKeywords(string hash, string[] keywords) public onlyUploader(videoInfo[hash].uploader) {
        if(videoInfo[hash].uploader != address(0) ) {
            for(uint i=0; i < keywords.length; i ++) {
                // if the keyword doesn't been added.
                if(videoInfo[hash].keywords.index[keywords[i]] == 0) {
                    // add the keywords to the videoInfo
                    videoInfo[hash].keywords.array.push(keywords[i]);
                    videoInfo[hash].keywords.index[keywords[i]] = videoInfo[hash].keywords.array.length;

                    // add the keyword to keywordIndex.
                    keywordIndex[keywords[i]].array.push(hash);
                    keywordIndex[keywords[i]].index[hash] = keywordIndex[keywords[i]].array.length;
                }
            }
        }
    }

    // remove the video's keyword.
    function removeKeywords(string hash, string[] keywords) public onlyUploader(videoInfo[hash].uploader) {
        if(videoInfo[hash].uploader != address(0)) {
            for(uint j=0; j < keywords.length; j++){
                uint index = videoInfo[hash].keywords.index[keywords[j]] - 1;
                uint len = videoInfo[hash].keywords.array.length;
                // remove keyword from videoInfo.
                if (index != len-1) {
                    videoInfo[hash].keywords.index[videoInfo[hash].keywords.array[len-1]] = index+1;
                    videoInfo[hash].keywords.array[index] = videoInfo[hash].keywords.array[len-1];
                }
                delete videoInfo[hash].keywords.array[len-1];
                videoInfo[hash].keywords.array.length--;
                videoInfo[hash].keywords.index[keywords[j]] = 0;

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

    // delete video by video hash.
    function deleteVideo(string hash) public onlyUploader(videoInfo[hash].uploader) returns (bool){
        // if the video is exist, delete it form videoInfo and videos.
        if (videoInfo[hash].uploader != address(0)) {
            // delete reference keywords.
            for(uint i=0; i<videoInfo[hash].keywords.array.length; i++) {
                // remove keyword from keywordIndex and delete keyword map.
                string keyword = videoInfo[hash].keywords.array[i];
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
                delete videoInfo[hash].keywords.index[keyword];
            }

            // delete it from videos.
            uint len = videosByName[videoInfo[hash].name].array.length;
            uint index = videosByName[videoInfo[hash].name].index[hash]-1;
            if (index != len-1) {
                videosByName[videoInfo[hash].name].index[videosByName[videoInfo[hash].name].array[len-1]] = index+1;
                videosByName[videoInfo[hash].name].array[index] = videosByName[videoInfo[hash].name].array[len-1];
            }
            delete videosByName[videoInfo[hash].name].array[len-1];
            videosByName[videoInfo[hash].name].array.length--;
            videosByName[videoInfo[hash].name].index[hash] = 0;

            // delete from videosByUploader.
            index = videosByUploader[videoInfo[hash].uploader].index[hash] - 1;
            len = videosByUploader[videoInfo[hash].uploader].array.length;
            if (index != len-1) {
                videosByUploader[videoInfo[hash].uploader].index[videosByUploader[videoInfo[hash].uploader].array[len-1]] = index+1;
                videosByUploader[videoInfo[hash].uploader].array[index] = videosByUploader[videoInfo[hash].uploader].array[len-1];
            }
            delete videosByUploader[videoInfo[hash].uploader].array[len-1];
            videosByUploader[videoInfo[hash].uploader].array.length--;
            videosByUploader[videoInfo[hash].uploader].index[hash] = 0;

            // delete from videosInfo.
            // delete thumbs map.
            for (i=0; i<videoInfo[hash].thumbs.thumbsUpByWhom.length; i++) {
                delete videoInfo[hash].thumbs.thumbsUpIndex[videoInfo[hash].thumbs.thumbsUpByWhom[i]];
            }
            for (i=0; i<videoInfo[hash].thumbs.thumbsDownByWhom.length; i++) {
                delete videoInfo[hash].thumbs.thumbsDownIndex[videoInfo[hash].thumbs.thumbsDownByWhom[i]];
            }
            // delete videoInfo.
            delete videoInfo[hash];

            // delete from allVideos and indexOfAllVideos.
            index = allVideos.index[hash] -1;
            len = allVideos.array.length;
            if (index != len-1) {
                allVideos.index[allVideos.array[len-1]] = index+1;
                allVideos.array[index] = allVideos.array[len-1];
            }
            delete allVideos.array[len-1];
            allVideos.array.length--;
            allVideos.index[hash] = 0;

            return true;
        }

        return false;
    }

    // get all the video hashes which names the given name.
    function getVideos(string s) public view returns (string[] hashesByName, string[] hashesByKeyword) {
        hashesByName = videosByName[s].array;
        hashesByKeyword = keywordIndex[s].array;
    }

    // function to get all the videos.
    function getAllVideos() public view returns (string[]) {
        return allVideos.array;
    }

    // get all the video hashes that somebody uploaded.
    function getUploadedVideos() public view returns (string[]) {
        return videosByUploader[msg.sender].array;
    }

    // get the video info by video hash.
    function getVideoInfo(string hash) public view returns (
        string name, string cover_hash, string[] keywords, uint256 trx_reward, uint256 token_reward,
        uint256 thumbsUp, uint256 thumbsDown, address uploader) {
        name = videoInfo[hash].name;
        trx_reward = videoInfo[hash].trx_reward;
        token_reward = videoInfo[hash].token_reward;
        thumbsUp = videoInfo[hash].thumbs.thumbsUpByWhom.length;
        thumbsDown = videoInfo[hash].thumbs.thumbsDownByWhom.length;
        uploader = videoInfo[hash].uploader;
        cover_hash = videoInfo[hash].cover_hash;
        keywords = videoInfo[hash].keywords.array;
    }

    // thumbs up a video by video hash.
    function thumbsUp(string hash) public payable returns (uint256) {
        require(videoInfo[hash].thumbs.thumbsUpIndex[msg.sender] == 0, "you've thumbs up before");

        videoInfo[hash].thumbs.thumbsUpByWhom.push(msg.sender);
        videoInfo[hash].thumbs.thumbsUpIndex[msg.sender] = 1;

        return videoInfo[hash].thumbs.thumbsUpByWhom.length;
    }

    // get the video thumbs up number by video hash.
    function getThumbsUp(string hash) public view returns (uint256) {
        return videoInfo[hash].thumbs.thumbsUpByWhom.length;
    }

    // thumbs down a video by hash.
    function thumbsDown(string hash) public returns (uint256){
        require(videoInfo[hash].thumbs.thumbsDownIndex[msg.sender] == 0, "you've thumbs down before");

        videoInfo[hash].thumbs.thumbsDownByWhom.push(msg.sender);
        videoInfo[hash].thumbs.thumbsDownIndex[msg.sender] = 1;

        return videoInfo[hash].thumbs.thumbsDownByWhom.length;
    }

    // get the video thumbs down number by video hash.
    function getThumbsDown(string hash) public view returns (uint256) {
        return videoInfo[hash].thumbs.thumbsDownByWhom.length;
    }

    // tips token to the video by hash, the token will give to by video uploader and admin in percentage.
    function tipToken(string hash) public payable returns (uint256) {
        require(msg.tokenid == tokenId, "wrong token id");

        if (msg.tokenvalue > 0 ) {
            uint256 token_fee_amount = msg.tokenvalue * fee_percent / 100;
            owner.transferToken(token_fee_amount, tokenId);
            videoInfo[hash].uploader.transferToken(msg.tokenvalue-token_fee_amount, tokenId);
            videoInfo[hash].token_reward += msg.tokenvalue-token_fee_amount;
        }

        return videoInfo[hash].token_reward;
    }

    // return how much token that the video uploader get.
    function getTokenTips(string hash) public view returns (uint256) {
        return videoInfo[hash].token_reward;
    }

    // tips trx to the video by hash, the trx will give to by video uploader and admin in percentage.
    function tipTrx(string hash) public payable returns (uint256) {
        if (msg.value > 0) {
            uint256 fee_amount = msg.value * fee_percent / 100;
            owner.transfer(fee_amount);
            videoInfo[hash].uploader.transfer(msg.value-fee_amount);
            videoInfo[hash].trx_reward += msg.value-fee_amount;
        }

        return videoInfo[hash].trx_reward;
    }

    // return how much trx that the video uploader get.
    function getTrxTips(string hash) public view returns (uint256) {
        return videoInfo[hash].trx_reward;
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