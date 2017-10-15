/*
 * Using jsdom to parse and execute the code that runs the editor.
 * Using node.js to get the html file information that will be use
 * to test the editors performance.
*/
  var fs = require('fs');
  require('jsdom-global')();
  const jsdom = require("jsdom");
  var csvdata = require(csvdata);

  const { JSDOM } = jsdom;
  var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");
  const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

  }).then(dom => {
    setTimeout(function(){ //Timeout to wait for all the script to finish loading.
      for(var file of global.trainingData){
        dom.window.document.editor.session.setValue(file[1]);
        dom.window.document.editorSelector.keyup();
      }
      for(var file of global.testingData){
        dom.window.document.editor.session.setValue(file[1]);
           dom.window.document.editorSelector.keyup();
          console.log(dom.window.document.allAutoCompleteList);
          csvdata.write('./my-file.csv', data, {header: 'name,hair,age'})
      }
    }, 5000);  
  });