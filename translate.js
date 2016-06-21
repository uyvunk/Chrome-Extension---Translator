var resultDiv = '<div id="translatorResult" style="text-align: left; font-family: sans-serif; font-size: 9pt; width: 400px; max-height: 500px; overflow: auto; border: 1px solid #9593A9; padding: 5px; margin: 5px; border-radius: 5px; color: #4A4444; background-color: #ffffe5; position: fixed; top: 20px; left: 20px; z-index: 99999999999999999; opacity: 0.93; "></div>';

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
			//console.log("Result:\n" + result);
			result = $.parseHTML(result);

			var alt_result = request.data;
			if (result == undefined) {
				result = '<div class="word_title">Not found</div>';
			} else {
				var audio_div = createAudio(alt_result);

				//result.splice(4, 0, audio_div);
				filter(result);
				//console.log(result);
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
			var sound_content = document.getElementById("flashcontent");
			sound_content.className = "flashcontent";
			if (sound_content != null) {
				sound_content.appendChild(audio_div);
			}
			// Add style to translatorResult
			pretty();
		}
	});

function createAudio(alt_result) {
	var audio_link = alt_result.match(/http.*\.mp3/);
	//console.log("audio link " + audio_link);
	var div = document.createElement("div");
	div.className = "audio";
	var audio = document.createElement("audio");
	audio.controls = "controls";
	audio.id = "audio";
	audio.className = "audio";
	audio.src = audio_link;
	audio.type = "audio/mp3";
	div.appendChild(audio);	
	return div;
}

// Remove the result div	
function resetPage() {
	if ($('#translatorResult').length > 0) {
		$('#translatorResult').remove();
	}
}

// Remove unwanted elements like idioms, relatedWord or social
function filter(result) {
	var idioms = false;
	console.log(result);
	for (var i=0; i<result.length; i++) {
		var className = result[i].className;
		console.log("current index " + i + "\n" + className);
		

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
				console.log("li: \n" + li.innerHTML);
				var cur = $.parseHTML(li.innerHTML);
				console.log("cur: \n" + cur.innerHTML);
				cur.splice(1,cur.length - 1);
				li.innerHTML = cur[0].outerHTML;
				//console.log("li outer: \n" + li.outerHTML);
				result[i].innerHTML = li.outerHTML;
			} 			
		} else {
			idioms = false;
		}
	}
}

// Add style to the result DIV
function pretty() {
	$('.pronunciation').css({"margin-top": "10px", "margin-bottom":"10px"})
	$('.flashcontent').css({"display":"inline-block"});
	$('.word_title').css({"color":"#D03071", "font-size":"10pt", "font-weight":"bold", "clear":"both"});
	$('.pronounce').css({"font-style":"italic", "display":"inline"});
	$('.phanloai').css({"color":"#D03071","clear":"both", "font-weight":"bold", "border-top":"1px solid #666", "border-bottom":"1px solid #666", "background":"#eee", "margin":"5px", "padding":"3px"});
	$('.list1').css({"list-style-type":"circle", "background":"none", "padding":"0px", "margin-left":"30px", "margin-bottom":"15px"});
	$('.list1 li').css({"list-style-type":"circle","background":"none", "padding":"0px"});
}
