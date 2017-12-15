function onDeviceReady(){
    console.log("deviceready");

    $('body').addClass(device.platform.toLowerCase());
    ClearData.enableDebug();

    //Populate webview cache
    $.get("https://api.consumerfinance.gov/data/hmda/slice/hmda_lar.json");
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