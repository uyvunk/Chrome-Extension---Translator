var hist = "";
var dict_type = "eng-vi";
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// data sent to background by content script
		if(request.message == "query") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var activeTab = tabs[0];
				lookUp(request.data, activeTab);
			});
		// data sent from content script to store current history search list
		} else if (request.message == "history") {
			hist = request.data;
		// retrieve current history list and then send the response to popup.js
		// so that it can process information
		} else if (request.method == "getHist") {
			sendResponse(hist);
			getHist(sendResponse);
			return true;
		} else if (request.message == "dictionaries") {
			dict_type = request.data;
			sendResponse(request.data);
		}
	});
	
function lookUp(word, activeTab) {
	// var url = "https://translate.google.com/#en/vi/" + word;
	var url = "";
	if (dict_type == "eng-vi") { 
		url = "http://www.vdict.com/" + word + ",1,0,0.html";
	} else if (dict_type == "eng-eng") {
		url = "http://www.vdict.com/" + word + ",7,0,0.html";
	}
	var xhr = new XMLHttpRequest();
	xhr.onload = receiveData;
	xhr.onerror = receiveError;
	xhr.open('GET', url, true);
	xhr.send();
	
	function receiveData() {
		var responseText;
		if(this.status == 200){
			responseText = xhr.responseText;
		} else {
			responseText = "";
		}
		chrome.tabs.sendMessage(activeTab.id, {"message":"reply", "data":responseText, "word": word});
	}
	
	function receiveError() {
		chrome.tabs.sendMessage(activeTab.id, {"message":"reply", "data":"", "word": word});
	}
}