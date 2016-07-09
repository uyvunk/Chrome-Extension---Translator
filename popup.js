document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("eng-vi").addEventListener("click", setDict);
	document.getElementById("eng-eng").addEventListener("click", setDict);
})

function setDict() {
	//something
	console.log(this.value);
}