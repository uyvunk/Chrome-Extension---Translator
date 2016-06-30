document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("eng-vi").addEventListener("click", setDict);
	document.getElementById("eng-eng").addEventListener("click", setDict);
})

function setDict() {
	console.log(this.value);
}