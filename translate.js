$("body").dblclick(getString);

function getString() {
	var text = "";
	if(window.getSelection) {
		var text = window.getSelection().toString().trim();
	}
	if(text && text != ""){
		var url = "https://translate.google.com/#en/vi/"+text;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);

		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				var responseText = xhr.responseText;
				console.log(responseText);
			}
		};

		xhr.send();
	}
	
}