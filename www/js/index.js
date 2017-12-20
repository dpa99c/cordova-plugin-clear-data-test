var key = "foo";
var imageSrc = "https://i.ytimg.com/vi/yaqe1qesQ8c/maxresdefault.jpg";
var ajaxURL = "https://api.consumerfinance.gov/data/hmda/slice/hmda_lar.json";

var PRESENT = "PRESENT";
var NOT_PRESENT = "NOT PRESENT";

var indexedDB = window.indexedDB || window.webkitIndexedDB;

var webView;
var db = {
    indexedDB: {},
    webSQL: {}
};

var cookie = {};


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

function clearWebview(){
    console.log("clearWebview()");

    var dataTypes = $('#webview-data').val();
    if(dataTypes){
        for(var i=0; i<dataTypes.length; i++){
            dataTypes[i] = ClearData.WEBVIEW[dataTypes[i]];
        }
    }

    ClearData.webview(function(){
        console.log("Cleared webview data");
        reload();
    }, function(error){
        console.error("Error clearing webview data: "+error)
    }, dataTypes);
}

function clearApplication(){
    console.log("clearApplication()");

    var dataTypes = $('#application-data').val();
    if(dataTypes){
        for(var i=0; i<dataTypes.length; i++){
            dataTypes[i] = ClearData.APPLICATION[dataTypes[i]];
        }
    }

    ClearData.application(function(){
        console.log("Cleared application data");
        reload();
    }, function(error){
        console.error("Error clearing application data: "+error)
    }, dataTypes);
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
    $('button.populate').removeAttr('disabled');

    checkWebviewCache();
    checkWebviewLocalStorage();
    checkWebviewCookies();
    checkWebviewWebSQL();
    checkWebviewIndexedDB();
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


function checkWebviewLocalStorage(){
    var present = !!localStorage.getItem(key);
    $('section.data .webview .localStorage').text(present ? PRESENT : NOT_PRESENT);
}
function checkWebviewCookies(){
    var present = !!cookie.read(key);
    $('section.data .webview .cookies').text(present ? PRESENT : NOT_PRESENT);
}
function checkWebviewWebSQL(){
    db.webSQL.readFromDb(function(val){
        var present = !!val;
        $('section.data .webview .webSQL').text(present ? PRESENT : NOT_PRESENT);
    });
}
function checkWebviewIndexedDB(){
    db.indexedDB.readFromDb(function(val){
        var present = !!val;
        $('section.data .webview .indexedDB').text(present ? PRESENT : NOT_PRESENT);
    });
}


/**
 * Populate data
 */
function populate(){
    $('button.populate').attr('disabled','disabled');

    var asyncCount = 3;
    var asyncDone = function(){
        asyncCount--;
        if(asyncCount === 0){
            setTimeout(check, 100);
        }
    };

    populateWebviewCookies();
    setTimeout(function(){
        populateWebviewLocalStorage();
        setTimeout(function(){
            populateWebviewCache(asyncDone);
            populateWebviewWebSQL(asyncDone);
            populateWebviewIndexedDB(asyncDone);
        }, 100);
    }, 100);
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

function populateWebviewLocalStorage(){
    localStorage.setItem(key, generateRandomString());
    sessionStorage.setItem(key, generateRandomString());
}

function populateWebviewCookies(){
    cookie.write(key, key, 1000);
}

function populateWebviewWebSQL(cb){
    db.webSQL.writeToDb(generateRandomString(), cb);
}

function populateWebviewIndexedDB(cb){
    db.indexedDB.writeToDb(generateRandomString(), cb);
}

function generateRandomString(){
    return (Math.random() + 1).toString(36).substring(7);
}

/**
 * Databases
 */
db.indexedDB.setup = function(cb){
    var open = indexedDB.open(key, 1);
    open.onupgradeneeded = function() {
        open.result.createObjectStore(key, {keyPath: "id"});
    };
    open.onsuccess = function(){
        db.indexedDB.db = open.result;
        cb();
    };
};

db.indexedDB.writeToDb = function (val, cb){
    cb = cb || function(){};
    db.indexedDB.setup(function(){
        var tx = db.indexedDB.db.transaction(key, "readwrite");
        var store = tx.objectStore(key);
        var addReq = store.add({id: 1, value: val});
        addReq.onsuccess = function(){
            console.log("Saved '"+val+"' to indexedDB");
            cb(true);
        };
        addReq.onerror = function(){
            cb(false);
        }
    });
};

db.indexedDB.readFromDb = function (cb){
    db.indexedDB.setup(function(){
        var tx = db.indexedDB.db.transaction(key, "readwrite");
        var store = tx.objectStore(key);

        var getReq = store.get(1);
        getReq.onsuccess = function(){
            console.log("Read from indexedDB");
            cb(getReq.result && getReq.result.value ? getReq.result.value : null);
        }
    });
};

db.indexedDB.clearDb = function (){
    db.indexedDB.setup(function(){
        var tx = db.indexedDB.db.transaction(key, "readwrite");
        var store = tx.objectStore(key);
        var clearReq = store.clear();
        clearReq.onsuccess = function(){
            console.log("Cleared indexedDB");
        };
    });
};

db.webSQL.setup = function(cb){
    db.webSQL.db = window.openDatabase(key, "0.1", key, 1024 * 1024);
    db.webSQL.db.transaction(function(transaction){
        transaction.executeSql("CREATE TABLE IF NOT EXISTS "+key+" (" +
            "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "value TEXT NOT NULL);", null, cb, cb);
    }, cb);

};

db.webSQL.writeToDb = function (val, cb){
    cb = cb || function(){};
    db.webSQL.setup(function(){
        db.webSQL.db.transaction(function(transaction){
            transaction.executeSql(("INSERT INTO "+key+" (value) VALUES (?);"),
                [val], function(transaction, results){
                    console.log("Wrote to WebSQL DB");
                    cb(true);
                }, function(){
                    console.error("Failed to write to WebSQL DB");
                    cb(false);
                });
        });
    });
};

db.webSQL.readFromDb = function (cb){
    db.webSQL.setup(function(){
        db.webSQL.db.transaction(function(transaction){
            transaction.executeSql(("SELECT * FROM "+key+" WHERE id=?"), [1],
                function(transaction, results){
                    if(results && results.rows.length > 0){
                        cb(results.rows.item(0).value);
                    }else{
                        cb(null);
                    }
                }, function(){
                    console.error("Failed to read from WebSQL DB");
                });
        });
    });
};

db.webSQL.clearDb = function (){
    db.webSQL.setup(function(){
        var query = "DELETE * FROM " + key;
        db.webSQL.db.transaction(function (tx) {
            tx.executeSql(query);
        });
    });
};

/**
 * Cookies
 */

cookie.read = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
};

cookie.write = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
};


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