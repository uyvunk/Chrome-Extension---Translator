var resultDiv = '<div id="translatorResult" style="text-align: left; font-family: sans-serif; font-size: 9pt; width: 400px; max-height: 500px; overflow: auto; border: 1px solid #9593A9; padding: 5px; margin: 5px; border-radius: 5px; background-color: #ffffe5; position: fixed; top: 20px; left: 20px; z-index: 99999999999999999; opacity: 0.93; "></div>';

// User double click
// get the selected word
$("body").dblclick(getString);

// User single click, reset the page to original 
$("body").click(resetPage);

// Get the selected String
function getString() {
	var text = "";
	if(window.getSelection) {
		text = window.getSelection().toString().trim();
		// remove the string that follows "’"
		if(text.indexOf("’") > -1){
			text = text.substring(0,text.indexOf("’"));
		}
	}

	if(text && text != "" && text.length > 1){
		// passing the text to background script
		// console.log("Looking for word: " + text);
		chrome.runtime.sendMessage({"message":"query", "data":text});
	}
}

// listen to reply event from the background script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message == "reply") {			
			// display the result-contents div
			var result = $(request.data).find("#result-contents").html();
			result = $.parseHTML(result);
			// console.log("Result:\n" + result);
			if (result == undefined) {
				result = '<div class="word_title">Not found</div>';
			} else {
				filter(result);
			}
			// Append this div to body
			//	if the translatorResult is already used previously, then empty it
			if ($('#translatorResult').length > 0) {
				$('#translatorResult').empty();
			} else {
			// 	if cannot find translatorResult, append it to <body>
				$('body').append(resultDiv);
			}
			$('#translatorResult').append(result);
			// Add style to translatorResult
			pretty();
		}
	});
	
// Remove the result div	
function resetPage() {
	if ($('#translatorResult').length > 0) {
		$('#translatorResult').remove();
	}
}

// Remove unwanted elements like idioms, relatedWord or social
function filter(result) {
	var idioms = false;
	for (var i=0; i<result.length; i++) {
		var className = result[i].className;
		var id = result[i].id;
		if((className == "dictionary-name" || className == "relatedWord" || className == "idioms" || className == "" ) && id != "tandp") {
			if(className == "idioms") {
				idioms = true;
			}
			result.splice(i,1);
			i--;
		} else if (className == "list1") {
			if (idioms == true) {
				result.splice(i,1);
				i--;
			} else {
				var li = $.parseHTML(result[i].innerHTML)[0];
				var cur = $.parseHTML(li.innerHTML);
				cur.splice(1,cur.length - 1);
				li.innerHTML = cur[0].outerHTML;
				result[i].innerHTML = li.outerHTML;
			}			
		} else {
			idioms = false;
		}
	}
}

// Add style to the result DIV
function pretty() {
	$('.pronunciation')
	$('.word_title').css({"color":"#D03071", "font-size":"10pt", "font-weight":"bold"});
	$('.pronounce').css({"font-style":"italic"});
	$('.phanloai').css({"color":"#D03071", "font-weight":"bold", "border-top":"1px solid #666", "border-bottom":"1px solid #666", "background":"#eee", "margin":"5px", "padding":"3px"});
	$('.list1').css({"list-style-type":"circle", "background":"none", "padding":"0px", "margin-left":"30px", "margin-bottom":"15px"});
	$('.list1 li').css({"list-style-type":"circle","background":"none", "padding":"0px"});
}
