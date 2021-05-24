(function() { 
    localDownload = function(data, filename){

        if(!data) {
            console.error('No data to save')
            return;
        }

        if(!filename) filename = 'policies.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }

    policyTextGetter = function(element, num) {
        numStr = "";
        end = -7;
        if (element.length > 27) {
            if (element.substring(26)[0] == "m") {end = -3}
            if (element.substring(26)[0] == "w") {end = -3}
        }
        
        if (num > 0) {
            numStr = "-"+num;
        }
        id = element+numStr;
        returnString = document.getElementById(id).parentElement.nextElementSibling.children[0].children[0].innerText.substring(22).slice(0,end);

        //check for "RequestedLocales" / other exception(s)
        policyName = returnString.split('\"')[1];
        if (policyName == "RequestedLocales") {
            returnString = returnString.slice(0,-64);
        }
        return returnString;
    }

    arrayBuilder = function(arr, id, max) {
        for (i=0; i<max; i++) {
            policy = policyTextGetter(id,i);       //get policy from page based on element id
            arr.push(policy);
        }
        return arr;
    }

    wrap = function(policies) {
        wrappedPolicies = "{\n  \"policies\": {\n    " + policies + "\n  }\n}";
        return wrappedPolicies;
    }

    qsw = function (id) {
        wrappedQuerySelector = "[id^='" + id + "']";
        return wrappedQuerySelector;
    }

    //constants
    var ag_ids    = "user-content-policiesjson";
    var win_ids   = "user-content-policiesjson-windows"
    var unix_ids  = "user-content-policiesjson-macos-and-linux";
    var winCount  = document.querySelectorAll(qsw(win_ids)).length
    var unixCount = document.querySelectorAll(qsw(unix_ids)).length
    var agCount   = document.querySelectorAll(qsw(ag_ids)).length - winCount - unixCount;

    //build arrays
    var policiesArray     = arrayBuilder([],ag_ids, 86);
    var winPoliciesArray  = arrayBuilder([],win_ids, 1);
    var unixPoliciesArray = arrayBuilder([],unix_ids, 1);

    //concatenate arrays for each os
    var allWinPoliciesArray  = policiesArray.concat(winPoliciesArray);
    var allUnixPoliciesArray = policiesArray.concat(unixPoliciesArray);

    //sort both arrays
    allWinPoliciesArray.sort();
    allUnixPoliciesArray.sort();

    //join arrays into strings
    var winPolicies  = allWinPoliciesArray.join(",\n    ");
    var unixPolicies = allUnixPoliciesArray.join(",\n    ");

    //add policy.json wrapper
    winPolicies = wrap(winPolicies);
    unixPolicies = wrap(unixPolicies);

    //download both
    localDownload(winPolicies,"win-policies.json");
    localDownload(unixPolicies,"unix-policies.json");


})();