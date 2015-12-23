$("body").dblclick(getString);

function getString() {
	var text = "";
	if(window.getSelection) {
		var text = window.getSelection().toString().trim();
	}

	if(text && text != ""){
		// passing the text to background script
		console.log("Looking for word: " + text);
		chrome.runtime.sendMessage({"message":"query", "data":text});
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "reply") {
			console.log("Get back: " + request.data);
			
			// display the result-contents div
			// var resultContents = $.parseHTML(request.data);
			var result = $(request.data).find("#result-contents").html();
			console.log("Result:\n" + result);
			 
			 // Append this div to body
			 if ($('#translatorResult')) {
				$('#translatorResult').empty();
			 } else {
				$('body').append('<div id="translatorResult"></div>');
			 }
			 $('#translatorResult').append(result);
		}
	});