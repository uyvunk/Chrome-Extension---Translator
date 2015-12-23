var targetDiv;
var resultDiv = '<div id="translatorResult" style="font-family: sans-serif; font-size: 8pt; width: 400px; border: 1px solid black; padding: 5px; margin: 5px; border-radius: 5px; background-color: #ffffe5; position: fixed; top: 20px; z-index: 99999999999999999"></div>';


$("body").dblclick(getString);

$("p, ul, section, div").dblclick(function(event) {
	targetDiv = event.target;
});

$("body").click(resetPage);

function getString() {
	var text = "";
	if(window.getSelection) {
		text = window.getSelection().toString().trim();
		if(text.indexOf("’") > -1){
			text = text.substring(0,text.indexOf("’"));
		}
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
			// console.log("Get back: " + request.data);
			
			// display the result-contents div
			// var resultContents = $.parseHTML(request.data);
			var result = $(request.data).find("#result-contents").html();
			result = $.parseHTML(result);
			console.log("Result:\n" + result);
			if (result == undefined) {
				result = "Not found";
			} else {
				filter(result);
			}
			 // Append this div to body
			 if ($('#translatorResult').length > 0) {
				$('#translatorResult').empty();
			 } else {
				if(targetDiv == undefined) {
					$('body').append(resultDiv);
				} else {
					$(resultDiv).insertBefore(targetDiv);
				}
			 }
			 $('#translatorResult').append(result);
		}
	});
	
function resetPage() {
	if ($('#translatorResult').length > 0) {
		$('#translatorResult').remove();
	}
}

function filter(result) {
	for (var i=0; i<result.length; i++) {
		var className = result[i].className;
		var id = result[i].id;
		if((className == "dictionary-name" || className == "relatedWord" || className == "idioms" || className == "" ) && id != "tandp") {
			result.splice(i,1);
		} else if (className == "list1") {
			var li = $.parseHTML(result[i].innerHTML)[0];
			var cur = $.parseHTML(li.innerHTML);
			cur.splice(1,cur.length - 1);
		}
	}
}
