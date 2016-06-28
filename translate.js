"use strict";
var resultDiv = $("<div>", {id: "translatorResult"});


// User double click
// get the selected word.
var currentY = 0;
var windowY = 0;
var topPage = 0;
var currentX = 0;
var isDragging = false;
var audio_link = "";
$("body").dblclick(getString);
//console.log(event.clientX);
// User single click, reset the page to original 
//$("body").click(resetPage);
$('body').click(function(evt){
	if(!isDragging) {
		if (evt.target.id == "translatorResult")
			return;
		//For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
		if ($(evt.target).closest('#translatorResult').length)
			return;

		//Do processing of click event here for every element except with id menu_content.
		if ($('#translatorResult').length > 0) {
			$('#translatorResult').remove();

		}
	} else {
		document.getElementById("translatorResult").dragging = false;
		isDragging = false;
	}
});

//$(window).scroll(resetPage);

// Get the selected String
function getString() {
	if(!isDragging) {
		var y = "";
		currentY = parseInt(event.clientY);
		topPage = parseInt(event.pageY) - parseInt(event.clientY);
		//console.log(topPage);

		windowY = parseInt(window.innerHeight);
		if (currentY > windowY / 2) {
			y = topPage + currentY - 325 + "px";
		} else {
			y = topPage + currentY + "px";
		}
		currentX = parseInt(event.clientX) - 200;
		resultDiv.css({
			"text-align": "left",
			"font-family": "sans-serif",
			"font-size": "8pt",
			"width": "400px",
			"max-height": "300px",
			"overflow": "auto",
			"border": "1px solid #9593A9",
			"padding": "5px",
			"margin": "5px",
			"border-radius": "5px",
			"color": "#4A4444",
			"background-color": "#ffffe5",
			"position": "absolute",
			"top": y,
			"left": currentX + "px",
			"z-index": "99999999999999999",
			"opacity": "0.93"
		});
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString().trim();
			// remove the string that follows "’"
			if (text.indexOf("’") > -1) {
				text = text.substring(0, text.indexOf("’"));
			}
		}

		if (text && text != "" && text.length > 1) {
			// passing the text to background script
			// console.log("Looking for word: " + text);
			chrome.runtime.sendMessage({"message": "query", "data": text});
		}
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

				// append it to the 4th element index array
				result.splice(4, 0, audio_div);
				console.log(audio_div.outerHTML);
				// filter the result
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


			if(parseInt(document.getElementById("translatorResult").style.left) <0 ) {
				document.getElementById("translatorResult").style.left = "0px";
			}

			if(parseInt(document.getElementById("translatorResult").style.left) + 400 > parseInt(window.innerWidth)) {
				document.getElementById("translatorResult").style.left = parseInt(window.innerWidth) - 425 + "px";
			}

			var atX = 0;
			var atY = 0;
			$('#translatorResult').html(result);
			document.getElementById("translatorResult").onmousedown = function () {
				isDragging = true;
				this.dragging = true;
				atX = parseInt(event.clientX);
				atY = parseInt(event.clientY);
			}

			document.getElementById("translatorResult").onmouseup = function () {
				isDragging = false;
				this.dragging = false;
			}

			document.getElementById("translatorResult").onmousemove = function() {
				if(this.dragging) {
					//console.log(event.clientY);
					var newLocationX = parseInt(event.clientX);
					var newLocationY = parseInt(event.clientY);
					var dx = newLocationX - atX;
					var dy = newLocationY - atY;
					//console.log("dx" + dx);
					//console.log("dy" + dy);
					atX = newLocationX;
					atY = newLocationY;

					document.getElementById("translatorResult").style.left =
						parseInt(document.getElementById("translatorResult").style.left) + dx + "px";
					document.getElementById("translatorResult").style.top =
						parseInt(document.getElementById("translatorResult").style.top) + dy + "px";
				}
			}

			if(parseInt(document.getElementById("translatorResult").offsetHeight) < 275 &&
				currentY > windowY/2 ){
				document.getElementById("translatorResult").style.top = parseInt(document.getElementById("translatorResult").style.top) +
					(280 - parseInt(document.getElementById("translatorResult").offsetHeight)) + "px";
			}
			// Add style to translatorResult
			pretty();
			// check if audio button is clicked by user, play sound for that current word
			$(".audio").click(playSound);
		}
	});

function createAudio(alt_result) {
	// create audio html tag for html
	audio_link = "";
	audio_link = alt_result.match(/http.*\.mp3/);
	var button = document.createElement("div");
	button.className = "audio";
	var img = document.createElement("img");
	img.src = "http://www.myiconfinder.com/uploads/iconsets/256-256-5ae3cc2a3ad2cd4da3bd55f7f8a49b22-speaker.png";
	img.alt = "sound";
	img.className = "audio_button";
	button.appendChild(img);
	return button;
}

function playSound() {
	// create new audio object
	var sound = new Audio();
	// source link for the sound
	sound.src = audio_link;
	// play the sound
	sound.play();
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
	//console.log(result);
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
		} else if (className == "pronunciation") {
			var li = $.parseHTML(result[i].innerHTML)[0];
			var cur = $.parseHTML(li.innerHTML);
		}
		else {
			idioms = false;
		}
	}
}


// Add style to the result DIV
function pretty() {
	$('.word_title').css({"color":"#D03071", "font-size":"10pt", "font-weight":"bold", "width":"20px", "height":"20px"});
	$('.audio_button').css({"width":"20px", "height":"20px"});
	$('.audio').css({"margin-right":"5px", "margin-top":"2px", "display":"inline"});
	$('.pronounce').css({"font-style":"italic", "display":"inline", "margin-top":"5px"});
	$('.phanloai').css({"color":"#D03071","clear":"both", "font-weight":"bold", "border-top":"1px solid #666", "border-bottom":"1px solid #666", "background":"#eee", "margin":"5px", "padding":"3px"});
	$('.list1').css({"list-style-type":"circle", "background":"none", "padding":"0px", "margin-left":"30px", "margin-bottom":"15px"});
	$('.list1 li').css({"list-style-type":"circle","background":"none", "padding":"0px"});
}