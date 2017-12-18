function onDeviceReady(){
    console.log("deviceready");

    $('body').addClass(device.platform.toLowerCase());
    ClearData.enableDebug();

    //Populate webview cache
    $.get("https://api.consumerfinance.gov/data/hmda/slice/hmda_lar.json");
}

function clearCache(){
    console.log("clearCache()");
    ClearData.cache(function(){
        console.log("Cleared cache data")
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
        console.log("Cleared webview data")
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
        console.log("Cleared application data")
    }, function(error){
        console.error("Error clearing application data: "+error)
    }, dataTypes);
}

$(document).on('deviceready', onDeviceReady);