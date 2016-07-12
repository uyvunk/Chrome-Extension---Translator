document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("hist").addEventListener("click", showHist);
	document.getElementById("eng-vi").addEventListener("click", setDict);
	document.getElementById("eng-eng").addEventListener("click", setDict);
});

chrome.runtime.sendMessage({method:"getHist"}, function(response) {
	var hist_div = document.getElementById("history");
	hist_div.innerHTML = response;
	console.log(response);
});

function showHist() {
	var hist = document.getElementById("history");
	// allow user to click to show/hide the list of history by just clicking on the
	// search history button
	if (window.getComputedStyle(hist).display == "none") {
		//console.log(document.getElementById("history").getComputedStyle("display"));
		hist.style.display = "block";
	} else {
		hist.style.display = "none";
	}
	console.log("showHist");
}
function setDict() {
	//something
	var hist_div = document.getElementById("history");
	hist_div.style.display = "none";
	console.log(this.value);
}