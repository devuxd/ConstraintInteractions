
function attributeTokenization(){
    document.body_.html(document.editor.getValue());
	var allWithSameTag = [], allWithSameClass;
	var isSameAttributes = false;
	var allWithSameTag_frequency = 0, allWithSameTag_attr = [], attribute_list = "";
	var isCode = false;


    //Getting the current line the programmer is working on from Ace editor.	
	document.currline = document.editor.getSelectionRange().start.row;
	//All text at a certain line
	var wholelinetxt = document.editor.session.getLine(document.currline);
	document.html = $.parseHTML(wholelinetxt);
    var tag, attributes, class_, element;
	var element_string = [""];
	var timer;
	var local_element_list = [[]];

    //Getting tag attributes and class name of the last element the programmer wrote.
    //Assuming that programmer writes only one element at each line.
	for(var entry in document.html){
		//nodeType method determines whether the element is an element node, attribute node, text node, comment node, returns 1-4 respectively 
		if(document.html[entry].nodeType==1){		
		 	tag = document.html[entry].nodeName.toLowerCase();
		 	//If the element has attributes..
			if(document.html[entry].attributes){
				//Sets element to exist
			 	 element = document.html[entry];
			 	 //Extracts attribute that is tied with the element
				 attributes = document.html[entry].attributes;
				 //Extracts class name
				 class_ = document.html[entry].className;
				 isCode = true;
				 //If attribute has a value..
				 if(attributes.length>0){
				 	findingSameAttributes(element);	
				 }
  			}
	  	}
	 }		
	function findingSameAttributes(element){
		var foundValue = false, foundPattern = false, newArray = [];
			for(var entry=0; entry<attributes.length; entry++){
				if(attributes[entry] && attributes[entry].nodeValue!=""){
							if(entry==0)element_string+="<"+tag+" ";
					element_string+=  attributes[entry].nodeName +"="+attributes[entry].nodeValue;
					foundValue = true;
				}
			}
			if(foundValue)
			element_string+=">"
			document.backAttribute = attributes[attributes.length-1];
		
		if(!foundValue)
			return;	
		newArray.push(element_string);
		mode(newArray);
		console.log(document.frecuencyarray);
	}

	// $("#editor").find("div.ace_scroller > div > div.ace_layer.ace_text-layer").children()
		//To find the frecuency of each group of elements.			
			//To find the frecuency of each group of elements.
	function mode(array){
		for(var i = 0; i<array.length; i++){
		    if (!document.frecuencyarray[array[i]]) 
		    	document.frecuencyarray[array[i]] = 0;
		    document.frecuencyarray[array[i]] += 1
		}
	}
}

 