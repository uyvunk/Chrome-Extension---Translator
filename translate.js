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
var WIDTH_POPUP = 400;
var RADOM_SRING = "4902743617";
var audio_cName = "";
$("body").dblclick(getString);
//console.log(event.clientX);
// User single click, reset the page to original
$('body').click(function(evt){
	if(!isDragging) {
		if (evt.target.id == "translatorResult") {
			return;
		}
		//For descendants of translatorResult being clicked, remove this check if you do not want to put constraint on descendants.
		if ($(evt.target).closest('#translatorResult').length) {
			return;
		}

		//Do processing of click event here for every element except with id translatorResult.
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
		// this is the current Y position of the mouse
		currentY = parseInt(event.clientY);

		//this is the current y position of the top of the page
		topPage = parseInt(event.pageY) - parseInt(event.clientY);

		// if the mouse is at top half, the pop-up definition will be below the word.
		// if the mouse is at the bottom half, the pop-up definition will be above the word.
		windowY = parseInt(window.innerHeight);
		if (currentY > windowY / 2) {
			y = topPage + currentY - 345 + "px";
		} else {
			y = topPage + currentY + 15 + "px";
		}

		// current X location of the pop-up
		currentX = parseInt(event.clientX) - WIDTH_POPUP/2;

		resultDiv.css({
			"text-align": "left",
			"font-family": "sans-serif",
			"font-size": "8pt",
			"width": WIDTH_POPUP + "px",
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
			console.log("current word found " + request.word);
			console.log("2");
			// store user search history
			storeHist(request.word);

			displayHist();
			// console.log(localStorage.getItem("hist"));		
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
				//console.log(audio_div.outerHTML);
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

			position(result);

			// check if audio button is clicked by user, play sound for that current word
			$("." + RADOM_SRING + "audio" + RADOM_SRING).click(playSound);
		}
	});

function storeHist(word) {
	var storage = localStorage.getItem("hist");
	if(storage === null) {
		storage = "<li>" + word + "</li>";
	} else {
		storage += "<li>" + word + "</li>";
	}
	localStorage.setItem("hist", storage);
	//console.log(localStorage.getItem("hist"));
}

function displayHist() {
	chrome.runtime.sendMessage({"message":"history", "data": localStorage.getItem("hist")});
	console.log("message sent");
	// console.log(localStorage.getItem("hist"));
	// var hist = document.getElementById("history");
	// console.log(hist);
}

function position(result) {
	//fix the pop - up location at edge cases
	if(parseInt(document.getElementById("translatorResult").style.left) <0 ) {
		document.getElementById("translatorResult").style.left = "0px";
	}

	if(parseInt(document.getElementById("translatorResult").style.left) + WIDTH_POPUP > parseInt(window.innerWidth)) {
		document.getElementById("translatorResult").style.left = parseInt(window.innerWidth) - 425 + "px";
	}

	//mouse move is relative with the div at X and at Y
	var atX = 0;
	var atY = 0;
	$('#translatorResult').html(result);

	// draw when mouse down
	document.getElementById("translatorResult").onmousedown = function () {
		isDragging = true;
		this.dragging = true;
		atX = parseInt(event.clientX);
		atY = parseInt(event.clientY);
	};

	// stop drag when mouse up
	document.getElementById("translatorResult").onmouseup = function () {
		isDragging = false;
		this.dragging = false;
	};

	// move when mouse move
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
	};

	// Add style to translatorResult
	pretty();

	// fix the upper div position with the correct height
	if(parseInt(document.getElementById("translatorResult").offsetHeight) < 312 &&
		currentY > windowY/2 ){
		//console.log("It's here!");
		document.getElementById("translatorResult").style.top = parseInt(document.getElementById("translatorResult").style.top) +
			(320 - parseInt(document.getElementById("translatorResult").offsetHeight)) + "px";
	}
}

function createAudio(alt_result) {
	// create audio html tag for html
	audio_link = "";
	var soundFileArray = alt_result.match(/http.*\.mp3/);
	var button = document.createElement("div");
	audio_cName = RADOM_SRING + "audio" + RADOM_SRING;
	button.className = audio_cName;
	// console.log(audio_cName);
	if (soundFileArray && soundFileArray.length > 0) {
		audio_link = soundFileArray[0];
		var img = document.createElement("img");
		img.src = "http://www.myiconfinder.com/uploads/iconsets/256-256-5ae3cc2a3ad2cd4da3bd55f7f8a49b22-speaker.png";
		img.alt = "sound";
		img.className = "audio_button";
		button.appendChild(img);
	}
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

function selectDict() {
	console.log("hello world!");
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

// User selected Dictionary
function selectDict() {
	console.log("Dict being selected");
	var type_dict = document.getElementsByClassName("dic_op");
	console.log("" + this.value);
}


// Add style to the result DIV
function pretty() {
	$('.word_title').css({"color":"#D03071", "font-size":"10pt", "font-weight":"bold"});
	$('.audio_button').css({"width":"20px", "height":"20px"});
	$('.audio').css({"margin-right":"5px", "margin-top":"2px"});
	$('.' + audio_cName).css({"display":"inline"});
	$('.pronounce').css({"font-style":"italic", "margin-top":"5px"});
	$('.phanloai').css({"color":"#D03071","clear":"both", "font-weight":"bold", "border-top":"1px solid #666", "border-bottom":"1px solid #666", "background":"#eee", "margin":"5px", "padding":"3px"});
	$('.list1').css({"list-style-type":"circle", "background":"none", "padding":"0px", "margin-left":"30px", "margin-bottom":"15px"});
	$('.list1 li').css({"list-style-type":"circle","background":"none", "padding":"0px"});
}