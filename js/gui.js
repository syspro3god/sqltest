var execBtn=document.getElementById("execute");var outputElm=document.getElementById('output');var errorElm=document.getElementById('error');var commandsElm=document.getElementById('commands');var dbFileElm=document.getElementById('dbfile');var savedbElm=document.getElementById('savedb');var pastebin=document.getElementById('save');var worker=new Worker("js/worker.sql.js");worker.onerror=error;worker.postMessage({action:'open'});function print(text){outputElm.innerHTML=text.replace(/\n/g,'<br>');}
function error(e){console.log(e);errorElm.style.height='2em';errorElm.textContent=e.message;}
function noerror(){errorElm.style.height='0';}
function execute(commands){tic();worker.onmessage=function(event){var results=event.data.results;toc("Izvršava SQL");tic();outputElm.innerHTML="";for(var i=0;i<results.length;i++){outputElm.appendChild(tableCreate(results[i].columns,results[i].values));}
toc("Prikazuje rezultate");}
worker.postMessage({action:'exec',sql:commands});outputElm.textContent="Izvlači rezultate...";}
var tableCreate=function(){function valconcat(vals,tagName){if(vals.length===0)return '';var open='<'+tagName+'>',close='</'+tagName+'>';return open+vals.join(close+open)+close;}
return function(columns,values){var tbl=document.createElement('table');tbl.className+=' table table-bordered';var html='<thead>'+valconcat(columns,'th')+'</thead>';var rows=values.map(function(v){return valconcat(v,'td');});html+='<tbody>'+valconcat(rows,'tr')+'</tbody>';tbl.innerHTML=html;return tbl;}}();function execEditorContents(){noerror()
execute(editor.getValue()+';');}
execBtn.addEventListener("click",execEditorContents,true);var tictime;if(!window.performance||!performance.now){window.performance={now:Date.now}}
function tic(){tictime=performance.now()}
function toc(msg){var dt=performance.now()-tictime;console.log((msg||'toc')+": "+dt+"ms");}
var editor=CodeMirror.fromTextArea(commandsElm,{mode:'text/x-mysql',viewportMargin:Infinity,indentWithTabs:true,smartIndent:true,lineNumbers:true,matchBrackets:true,autofocus:true,extraKeys:{"Ctrl-Enter":execEditorContents,"Ctrl-S":savedb,}});dbFileElm.onchange=function(){var f=dbFileElm.files[0];var r=new FileReader();r.onload=function(){worker.onmessage=function(){toc("Učitavam bazu iz fajla");editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");execEditorContents();};tic();try{worker.postMessage({action:'open',buffer:r.result},[r.result]);}
catch(exception){worker.postMessage({action:'open',buffer:r.result});}}
r.readAsArrayBuffer(f);}
function savedb(){worker.onmessage=function(event){toc("Izvozi bazu podataka");var arraybuff=event.data.buffer;var blob=new Blob([arraybuff]);var url=window.URL.createObjectURL(blob);window.location=url;};tic();worker.postMessage({action:'export'});}
function FileHelper()
{}
{FileHelper.readStringFromFileAtPath=function(pathOfFileToReadFrom)
{var request=new XMLHttpRequest();request.open("GET",pathOfFileToReadFrom,false);request.send(null);var returnValue=request.responseText;return returnValue;}}
function loadDb()
{var pathOfFileToRead="baza.sql";var contentsOfFileAsString=FileHelper.readStringFromFileAtPath(pathOfFileToRead);execute(contentsOfFileAsString+';');}
function paste()
{var text=editor.getValue();text=text.replace(new RegExp('\r?\n','g'),'<br />');var form=document.createElement("form");form.setAttribute("method","post");form.setAttribute("action","pastebinapi.php");var hiddenField=document.createElement("input");hiddenField.setAttribute("name","text");hiddenField.setAttribute("value",text);form.appendChild(hiddenField);document.body.appendChild(form);form.setAttribute("target","_blank");form.submit();}
savedbElm.addEventListener("click",savedb,true);pastebin.addEventListener("click",paste,true);