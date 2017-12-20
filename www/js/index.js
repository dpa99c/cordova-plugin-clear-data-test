var imageSrc = "https://i.ytimg.com/vi/yaqe1qesQ8c/maxresdefault.jpg";
var ajaxURL = "https://api.consumerfinance.gov/data/hmda/slice/hmda_lar.json";

var PRESENT = "PRESENT";
var NOT_PRESENT = "NOT PRESENT";

function onDeviceReady(){
    console.log("deviceready");

    $('body').addClass(device.platform.toLowerCase());

    if(device.platform === "Android") {
        if(navigator.userAgent.toLowerCase().indexOf('crosswalk') > -1){
            webView = "Crosswalk";
        }else if(parseFloat(device.version) >= 4.4){
            webView = "System (Modern)";
        }else{
            webView = "System (Old)";
        }
    }else{
        if (window.webkit && window.webkit.messageHandlers) {
            webView = "WKWebView";
        } else {
            webView = "UIWebView";
        }
    }

    $('#webview').text(device.platform + " " + webView);

    ClearData.enableDebug();
    check();
}

function clearCache(){
    console.log("clearCache()");
    ClearData.cache(function(){
        console.log("Cleared cache data");
        reload();
    }, function(error){
        console.error("Error clearing cache data: "+error)
    });
}

/**
 * Check data
 */
function reload(){
    if(device.platform === "Android"){
        ClearData.restart();
    }else{
        window.location.reload(true);
    }
}

function exit(){
    if(device.platform === "Android"){
        navigator.app.exitApp();
    }
}

function check(){
    checkWebviewCache();
}

function checkWebviewCache(){
    var isPresent = function(present){
        $('section.data .webview .cache').text(present ? PRESENT : NOT_PRESENT);
    };

    if(device.platform === "Android"){
        var webviewCachePath = "org.chromium.android_webview";
        var filepath = cordova.file.cacheDirectory + webviewCachePath;
        checkFilepathExists(filepath, function(cacheFolderExists){
            if(cacheFolderExists){
                countEntriesInDirectory(filepath, function(count){
                    isPresent(count > 2);
                });
            }else{
                isPresent(false);
            }
        })
    }else{ // iOS

    }
}

/**
 * Populate data
 */
function populate(){
    populateWebviewCache(check);
}

function populateWebviewCache(done){
    var asyncCount = 2;
    var asyncDone = function(){
        asyncCount--;
        if(asyncCount === 0){
            done();
        }
    };

    // use AJAX to get some JSON content
    $.ajax({
        url: ajaxURL,
        cache: true,
        complete: function(){
            console.log("json loaded");
            asyncDone();
        }
    });

    // load an image
    var img = new Image();
    img.onload = img.onerror = function(){
        console.log("image loaded");
        asyncDone();
    };

    img.src = imageSrc;
}

function checkFilepathExists(filepath, callback){
    window.resolveLocalFileSystemURL(filepath, function() {
        callback(true);
    }, function(){
        callback(false);
    });
}

function countEntriesInDirectory(filepath, callback){
    window.resolveLocalFileSystemURL(filepath,
        function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
                function (entries) {
                    callback(entries.length);
                },
                function (err) {
                    callback(0);
                }
            );
        }, function (err) {
            console.log(err);
        }
    );
}

$(document).on('deviceready', onDeviceReady);