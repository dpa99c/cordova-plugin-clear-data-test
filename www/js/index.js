function onDeviceReady(){
    console.log("deviceready");

    $('body').addClass(device.platform.toLowerCase());
    ClearData.enableDebug();

    //Populate webview cache
    $.get("http://www.bbc.co.uk");
}

function clearCache(){
    console.log("clearCache()");
    ClearData.cache();
}

function clearWebview(){
    console.log("clearWebview()");
    ClearData.webview();
}

function clearApplication(){
    console.log("clearApplication()");
    ClearData.application();
}

$(document).on('deviceready', onDeviceReady);