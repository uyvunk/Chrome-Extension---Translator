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
	document.getElementById("history").style.display = "block";
	console.log("showHist");
}
function setDict() {
	//something
	var hist_div = document.getElementById("history");
	hist_div.style.display = "none";
	console.log(this.value);
}