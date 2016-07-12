var hist = "";
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "query") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var activeTab = tabs[0];
				// if (storage === null) {
				// 	storage = [];
				// }
				// storage.push(request.data);
				// localStorage.setItem("hist", storage);
				// console.log("current list of word " + localStorage.getItem("hist"));
				lookUp(request.data, activeTab);
			});
		} else if (request.message == "history") {
			hist = request.data;
		} else if (request.method == "getHist") {
			sendResponse(hist);
			getHist(sendResponse);
			return true;
		}
	});
	
function lookUp(word, activeTab) {
	// var url = "https://translate.google.com/#en/vi/" + word;
	var url = "http://www.vdict.com/" + word + ",1,0,0.html";
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