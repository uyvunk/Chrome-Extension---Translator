document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("eng-vi").addEventListener("click", setDict);
	document.getElementById("eng-eng").addEventListener("click", setDict);
});

chrome.runtime.sendMessage({method:"getHist"}, function(response) {
	var hist_div = document.getElementById("history");
	hist_div.innerHTML = response;
	console.log(response);
})
function setDict() {
	//something
	console.log(this.value);
}