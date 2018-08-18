const sha1 = require('sha1');
const ipc = require('electron').ipcRenderer
$(function () {
 $('[data-toggle="tooltip"]').tooltip()
})
$(document).on('hover', '[rel=tooltip]', function () { $(this).tooltip('show'); });
var timeout;
function generatePreview(retour=false) {
  var editor = document.getElementById('editor').value;
  var preview = document.getElementById('paramPreview').value

    if(preview == 'true'){
        var hljs = require('highlight.js');
        var md = require('markdown-it')({
          html:         false,
          xhtmlOut:     false,
          breaks:       false,
          langPrefix:   'hljs language-',
          linkify:      true,
          typographer:  true,
          quotes: '“”‘’',
          highlight: function (str, lang) {
                      if (lang && hljs.getLanguage(lang)) {
                        try {
                          return hljs.highlight(lang, str).value;
                        } catch (__) {}
                      }
                      return '';
                    }
        }).use(require('markdown-it-emoji'))
          .use( require("markdown-it-anchor"), { permalink: true, permalinkBefore: true, permalinkSymbol: '' } )
          .use( require("markdown-it-toc-done-right"))
          .use(require('markdown-it-emoji'))
          .use(require('markdown-it-sub'))
          .use(require('markdown-it-sup'))
          .use(require('markdown-it-checkbox'))
          .use(require('markdown-it-imsize'))
          .use(require('markdown-it-multimd-table'))
          .use(require('markdown-it-plantuml'))
          .use(require('markdown-it-smartarrows'));
      if(retour){
        return md.render(editor)
      }else {
          document.getElementById('preview').innerHTML= md.render(editor);
      }

    }
}
function hidePreview(){
var val = document.getElementById('paramPreview').value;
if(val == "true" ){
document.getElementById('paramPreview').value = false;
document.getElementById('preview').style.display='none';
$('.editorSide').removeClass('col-md-6');
$('.editorSide').addClass('col-md-12');
$('#previewButton').removeClass('btn-outline-primary')
$('#previewButton').addClass('btn-link')
} else {
document.getElementById('paramPreview').value = true;
document.getElementById('preview').style.display='block';
$('.editorSide').removeClass('col-md-12');
$('.editorSide').addClass('col-md-6');
$('#previewButton').addClass('btn-outline-primary')
$('#previewButton').removeClass('btn-link')
generatePreview();
}
}
function insertB(insert){
var cursorPos = $('#editor').prop('selectionStart');
var v = $('#editor').val()
var textBefore = v.substring(0,  cursorPos );
var textAfter  = v.substring( cursorPos, v.length );
$('#editor').val( textBefore+ insert +textAfter );
generatePreview()
}

function insertA(insert){
var cursorPos = $('#editor').prop('selectionEnd');
var v = $('#editor').val();
var textBefore = v.substring(0,  cursorPos );
var textAfter  = v.substring( cursorPos, v.length );
$('#editor').val( textBefore+ insert +textAfter );
generatePreview()
}
function insertBoth(before,after, ex=''){
var cursorPosStart = $('#editor').prop('selectionStart');
var cursorPosEnd = $('#editor').prop('selectionEnd');
if(cursorPosEnd == cursorPosStart){
before = before + ex;
}
var v1 = $('#editor').val()
var textBeforeStart = v1.substring(0,  cursorPosStart );
var textAfterStart  = v1.substring( cursorPosStart, v1.length );
$('#editor').val( textBeforeStart+ before +textAfterStart );
var v2 = textBeforeStart+ before +textAfterStart ;
var textBeforeEnd = v2.substring(0,  cursorPosEnd+before.length );
var textAfterEnd  = v2.substring( cursorPosEnd+before.length , v2.length);
$('#editor').val( textBeforeEnd+ after +textAfterEnd );
generatePreview();
}
function mouse(p){
var element1 = document.getElementById("expandSideMenu");
var element2 = document.getElementById('bottom-bar');
element1.classList.remove("expandSideMenuTransition");
element2.classList.remove("bottomBarTransition");
}
function onLoad(){
setInterval(hideMenu, 6000);
addEventListener('mousemove', mouse, false);
}
function hideMenu(){

$('.dropdown-menu').removeClass('show');
$('#expandSideMenu').addClass('expandSideMenuTransition');
$('.bottom-bar').addClass('bottomBarTransition');
}
function saveAsPdf2(content){
const ipc = require('electron').ipcRenderer
ipc.send("printPDF", content);
}
function saveAsPdf(){
generatePreview()
convertImagesToBase64();
saveAsPdf2($('#preview').html())
}
function saveAsDocx(){
const ipc = require('electron').ipcRenderer
generatePreview()
convertImagesToBase64();
var converted = htmlDocx.asBlob($('#preview').html(), {orientation: 'landscape', margins: {top: 720}});
saveAs(converted,'toti.docx');
display('success',' Votre fichier a bien été sauvegardé')

}
function convertImagesToBase64 () {
 contentDocument = document.getElementById('preview');
 var regularImages = contentDocument.querySelectorAll("img");
 var canvas = document.createElement('canvas');
 var ctx = canvas.getContext('2d');
 [].forEach.call(regularImages, function (imgElement) {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   canvas.width = imgElement.width;
   canvas.height = imgElement.height;
   ctx.drawImage(imgElement, 0, 0);
   var dataURL = canvas.toDataURL();
   imgElement.setAttribute('src', dataURL);
 })
 canvas.remove();
}
function saveAsMd(){
const ipc = require('electron').ipcRenderer
var path = $('#path').val()
if(path==''){
ipc.send("saveAsMd",$('#editor').val());
} else {
ipc.send("saveMd", $('#editor').val(),path);
}
}
ipc.on('wrote-md', function (event, path) {
$('#path').val(path);
$('#saved').val(sha1($('#editor').val()))
display('success',' Votre fichier a bien été sauvegardé')
})
ipc.on('wrote-pdf', function (event, path) {
$('#path').val(path);
display('success',' Votre fichier a bien été sauvegardé')
})
function display(state,msg,time=true){
add='';
if(state=='success'){
  type = "alert-success";
  title='Succès';
}
if(state=='error'){
  type = "alert-danger";
  title='Erreur';
}
if(state=='info'){
  type = "alert-info";
  title='Info';
}
if(state=='warning'){
  type = "alert-warning";
  title='Attention';
}
html= '<div class="alert '+type+'" role="alert"> \
     <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
        <span aria-hidden="true">&times;</span>\
     </button>\
      <p>'+msg+'</p>\
  </div>'+add;
  $('#display').html(html);

  if(time){
    $("."+type).fadeTo(2000, 350).slideUp(350, function(){    $("."+type).slideUp(350);   });
  }
}
$(document).delegate('#editor', 'keydown', function(e) {
var keyCode = e.keyCode || e.which;

if (keyCode == 9) {
e.preventDefault();
var start = $(this).get(0).selectionStart;
var end = $(this).get(0).selectionEnd;
$(this).val($(this).val().substring(0, start)
            + "\t"
            + $(this).val().substring(end));
$(this).get(0).selectionStart =
$(this).get(0).selectionEnd = start + 1;
}
});
$(window).keypress(function(event) {
if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
saveAsMd();
event.preventDefault();
return false;
});
function httpGet(theUrl)
{
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", theUrl, false );
xmlHttp.send( null );
return btoa(xmlHttp.responseText);
}
function imageInternet(){
var address = $('#imgInt').val()
if(address!='' && address != 'undefined'){
insertA('!['+address+']('+address+' =500x)');
$('.closingButton').click()
}else {
display('error','Le champ pour l\'adresse internet est vide ou non rempli');
}
}
function imageComputer(){
ipc.send('open-file-dialog')
}
ipc.on('selected-file', function (event,file) {
if(file){
file = file[0].replace(/\\/gi,'/');
console.log(file);
insertA('![Légende de l\'image]('+file+' =500x)');
}
});
function openFile(){
if(!Saved()){
 if (confirm("Le document actuel n'est pas sauvegardé voulez vous le fermer quand même ?")) {
   ipc.send('openFile');
}
}else {
ipc.send('openFile');
}
}
ipc.on('selected-open-file',function(event,fileData,filePath){
$('#editor').val(fileData);
$('#path').val(filePath);
$('#saved').val(sha1(fileData))
generatePreview()
})
function Saved(){
if($('#editor').val()){
var editor = sha1(document.getElementById('editor').value);
var sum = document.getElementById('saved').value;
if(sum == editor) return true
else return false
} else{
return true
}
}
function displayleftMenu(){

$('.leftMenu').css('left','0px');
}
function closeLeftMenu(){

$('.leftMenu').css('left','-600px');
}
(function () {
       var holder = document.getElementById('editor');
       var body = document.getElementById('body');
       var prevew = document.getElementById('preview');

       holder.ondragover = () => {
           return false;
       };

       holder.ondragleave = () => {
           return false;
       };

       holder.ondragend = () => {
           return false;
       };
       body.ondragover = () => {
           return false;
       };

       body.ondragleave = () => {
           return false;
       };

       body.ondragend = () => {
           return false;
       };
       preview.ondragover = () => {
           return false;
       };

       preview.ondragleave = () => {
           return false;
       };

       preview.ondragend = () => {
           return false;
       };
       body.ondrop = (e) => {
         e.preventDefault();
       }
       preview.ondrop = (e) => {
         e.preventDefault();
       }
       holder.ondrop = (e) => {
           e.preventDefault();

           for (let f of e.dataTransfer.files) {

               insertA('!['+f.name+']('+f.path+' =300x)')
           }

           return false;
       };
   })();
