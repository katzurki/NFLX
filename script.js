document.status = "200";
function addLoadEvent(func){if(typeof window.onload!='function'){window.onload=func;}else{var oldfunc=window.onload;window.onload=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
function addPartialLoadEvent(func){if(typeof window.pageLoad!='function'){window.pageLoad=func;}else{var oldfunc=window.pageLoad;window.pageLoad=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
function addResizeEvent(func){if(typeof window.onresize!='function'){window.onresize=func;}else{var oldfunc=window.onresize;window.onresize=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
var _resizeTimer;var _resizeAgain=false;var _resizeTimerFunction;function _onResize(){if(_resizeTimer!=null){_resizeAgain=true;}else{_resizeTimerFunction.apply(this,arguments);}
clearTimeout(_resizeTimer);_resizeTimer=setTimeout(function(){_resizeTimer=null;if(_resizeAgain){_resizeAgain=false;_resizeTimerFunction.apply(this,arguments);}},50);}
function addResizeTimerEvent(func){if(typeof _resizeTimerFunction!='function'){_resizeTimerFunction=func;addResizeEvent(_onResize);}else{var oldfunc=_resizeTimerFunction;_resizeTimerFunction=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
function addScrollEvent(func){if(typeof window.onscroll!='function'){window.onscroll=func;}else{var oldfunc=window.onscroll;window.onscroll=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
function addUnloadEvent(func){if(typeof window.onunload!='function'){window.onunload=func;}else{var oldfunc=window.onunload;window.onunload=function(){if(oldfunc){oldfunc.apply(this,arguments);}
func.apply(this,arguments);};}}
addLoadEvent(function(){var switcher=document.getElementById("styleswitcher");if(switcher!=null){switcher.style.display="block";}});
addLoadEvent(function(){if(!document.getElementsByTagName)return;var anchors=document.getElementsByTagName("a");for(var i=0;i<anchors.length;i++){var anchor=anchors[i];if(anchor.getAttribute("href")&&anchor.getAttribute("rel")=="external"){anchor.target="_blank";}}});
function addNewLine(container,child){var ln1=document.createTextNode("\n");container.insertBefore(ln1,child);}
function appendNewLine(container){var ln1=document.createTextNode("\n");container.appendChild(ln1);}
function cleanComment(container,child,comment){var jsc=document.createComment(" "+comment+" ");var ln1=document.createTextNode("\n");var ln3=document.createTextNode("\n\n\n");container.insertBefore(ln3,child);container.insertBefore(jsc,child);container.insertBefore(ln1,child);}
addLoadEvent(function(){var div=document.getElementById("indextable");if(div==null){return;}
var table=div.getElementsByTagName("table")[0];for(var i=0;i<table.rows.length;i++){var c1=table.rows[i].cells[0];var c2=table.rows[i].cells[1];c1.style.borderRightWidth=0;c2.style.borderLeftWidth=0;c1.style.width="1%";}});
if(document.status!="200"){addLoadEvent(function(){var b=document.body;var blackout=document.createElement("div");b.insertBefore(blackout,b.firstChild);addNewLine(b,blackout);var bs=blackout.style;bs.backgroundColor="#000000";bs.position="fixed";bs.width="100%";bs.height="100%";bs.top=0;bs.left=0;bs.zIndex=9001;var ef=document.createElement("div");blackout.appendChild(ef);var es=ef.style;es.borderWidth="6px";es.borderStyle="solid";es.margin="150px auto 0 auto";es.padding="6px 6px 6px 6px";es.width="640px";es.color="#FF0000";es.fontFamily='"Lucida Console", "Lucida Sans Typewriter", Monaco, "Bitstream Vera Sans Mono", monospace';es.fontWeight="bold";ef.appendChild(document.createTextNode("Software Failure.    Press left mouse button to continue."));ef.appendChild(document.createElement("br"));ef.appendChild(document.createTextNode("Guru Meditation #48454C50.00000"+document.status));var op=12.0;var opMax=0.95;var t;(function f(){if(op>0){requestAnimationFrame(f);}
else{b.removeChild(blackout);}
var c=new Date().getTime();var dt=c-(t||c);t=c;var red=op>opMax&&Math.round(op)%2==0;es.borderColor=(red?"#FF0000":"#000000");op-=dt/500;bs.opacity=Math.min(opMax,Math.max(op,0.0));})();blackout.onmouseup=function(){op=0.0;};});}
