chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "query") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var activeTab = tabs[0];
				lookUp(request.data, activeTab);
				
			});
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
		chrome.tabs.sendMessage(activeTab.id, {"message":"reply", "data":responseText});
	}
	
	function receiveError() {
		chrome.tabs.sendMessage(activeTab.id, {"message":"reply", "data":""});
	}

	
}