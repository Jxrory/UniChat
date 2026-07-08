(()=>{var Nn=Object.defineProperty;var Mn=(t,e,o)=>e in t?Nn(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o;var T=(t,e,o)=>Mn(t,typeof e!="symbol"?e+"":e,o);function Tt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var ue=Tt();function To(t){ue=t}var Oe={exec:()=>null};function v(t,e=""){let o=typeof t=="string"?t:t.source,n={replace:(i,a)=>{let c=typeof a=="string"?a:a.source;return c=c.replace(j.caret,"$1"),o=o.replace(i,c),n},getRegex:()=>new RegExp(o,e)};return n}var j={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}#`),htmlBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}<(?:[a-z].*>|!--)`,"i")},Dn=/^(?:[ \t]*(?:\n|$))+/,Pn=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Un=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,ze=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,$n=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Et=/(?:[*+-]|\d{1,9}[.)])/,Eo=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,So=v(Eo).replace(/bull/g,Et).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Bn=v(Eo).replace(/bull/g,Et).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),St=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Fn=/^[^\n]+/,At=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Hn=v(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",At).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),jn=v(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Et).getRegex(),Qe="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Rt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Gn=v("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Rt).replace("tag",Qe).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Ao=v(St).replace("hr",ze).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex(),qn=v(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Ao).getRegex(),Ct={blockquote:qn,code:Pn,def:Hn,fences:Un,heading:$n,hr:ze,html:Gn,lheading:So,list:jn,newline:Dn,paragraph:Ao,table:Oe,text:Fn},ko=v("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",ze).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex(),Wn={...Ct,lheading:Bn,table:ko,paragraph:v(St).replace("hr",ze).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",ko).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex()},Vn={...Ct,html:v(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Rt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Oe,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:v(St).replace("hr",ze).replace("heading",` *#{1,6} *[^
]`).replace("lheading",So).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Yn=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Zn=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ro=/^( {2,}|\\)\n(?!\s*$)/,Xn=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Je=/[\p{P}\p{S}]/u,It=/[\s\p{P}\p{S}]/u,Co=/[^\s\p{P}\p{S}]/u,Kn=v(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,It).getRegex(),Io=/(?!~)[\p{P}\p{S}]/u,Qn=/(?!~)[\s\p{P}\p{S}]/u,Jn=/(?:[^\s\p{P}\p{S}]|~)/u,er=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,Lo=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,tr=v(Lo,"u").replace(/punct/g,Je).getRegex(),or=v(Lo,"u").replace(/punct/g,Io).getRegex(),Oo="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",nr=v(Oo,"gu").replace(/notPunctSpace/g,Co).replace(/punctSpace/g,It).replace(/punct/g,Je).getRegex(),rr=v(Oo,"gu").replace(/notPunctSpace/g,Jn).replace(/punctSpace/g,Qn).replace(/punct/g,Io).getRegex(),ir=v("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Co).replace(/punctSpace/g,It).replace(/punct/g,Je).getRegex(),ar=v(/\\(punct)/,"gu").replace(/punct/g,Je).getRegex(),sr=v(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),lr=v(Rt).replace("(?:-->|$)","-->").getRegex(),dr=v("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",lr).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Ze=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,cr=v(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Ze).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),zo=v(/^!?\[(label)\]\[(ref)\]/).replace("label",Ze).replace("ref",At).getRegex(),No=v(/^!?\[(ref)\](?:\[\])?/).replace("ref",At).getRegex(),pr=v("reflink|nolink(?!\\()","g").replace("reflink",zo).replace("nolink",No).getRegex(),Lt={_backpedal:Oe,anyPunctuation:ar,autolink:sr,blockSkip:er,br:Ro,code:Zn,del:Oe,emStrongLDelim:tr,emStrongRDelimAst:nr,emStrongRDelimUnd:ir,escape:Yn,link:cr,nolink:No,punctuation:Kn,reflink:zo,reflinkSearch:pr,tag:dr,text:Xn,url:Oe},mr={...Lt,link:v(/^!?\[(label)\]\((.*?)\)/).replace("label",Ze).getRegex(),reflink:v(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Ze).getRegex()},xt={...Lt,emStrongRDelimAst:rr,emStrongLDelim:or,url:v(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},ur={...xt,br:v(Ro).replace("{2,}","*").getRegex(),text:v(xt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ve={normal:Ct,gfm:Wn,pedantic:Vn},Ie={normal:Lt,gfm:xt,breaks:ur,pedantic:mr},hr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},yo=t=>hr[t];function K(t,e){if(e){if(j.escapeTest.test(t))return t.replace(j.escapeReplace,yo)}else if(j.escapeTestNoEncode.test(t))return t.replace(j.escapeReplaceNoEncode,yo);return t}function xo(t){try{t=encodeURI(t).replace(j.percentDecode,"%")}catch(e){return null}return t}function _o(t,e){var a;let o=t.replace(j.findPipe,(c,l,m)=>{let d=!1,p=l;for(;--p>=0&&m[p]==="\\";)d=!d;return d?"|":" |"}),n=o.split(j.splitPipe),i=0;if(n[0].trim()||n.shift(),n.length>0&&!((a=n.at(-1))!=null&&a.trim())&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;i<n.length;i++)n[i]=n[i].trim().replace(j.slashPipe,"|");return n}function Le(t,e,o){let n=t.length;if(n===0)return"";let i=0;for(;i<n;){let a=t.charAt(n-i-1);if(a===e&&!o)i++;else if(a!==e&&o)i++;else break}return t.slice(0,n-i)}function br(t,e){if(t.indexOf(e[1])===-1)return-1;let o=0;for(let n=0;n<t.length;n++)if(t[n]==="\\")n++;else if(t[n]===e[0])o++;else if(t[n]===e[1]&&(o--,o<0))return n;return o>0?-2:-1}function vo(t,e,o,n,i){let a=e.href,c=e.title||null,l=t[1].replace(i.other.outputLinkReplace,"$1");n.state.inLink=!0;let m={type:t[0].charAt(0)==="!"?"image":"link",raw:o,href:a,title:c,text:l,tokens:n.inlineTokens(l)};return n.state.inLink=!1,m}function fr(t,e,o){let n=t.match(o.other.indentCodeCompensation);if(n===null)return e;let i=n[1];return e.split(`
`).map(a=>{let c=a.match(o.other.beginningSpace);if(c===null)return a;let[l]=c;return l.length>=i.length?a.slice(i.length):a}).join(`
`)}var Xe=class{constructor(t){T(this,"options");T(this,"rules");T(this,"lexer");this.options=t||ue}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let o=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?o:Le(o,`
`)}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let o=e[0],n=fr(o,e[3]||"",this.rules);return{type:"code",raw:o,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:n}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let o=e[2].trim();if(this.rules.other.endingHash.test(o)){let n=Le(o,"#");(this.options.pedantic||!n||this.rules.other.endingSpaceChar.test(n))&&(o=n.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:o,tokens:this.lexer.inline(o)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:Le(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let o=Le(e[0],`
`).split(`
`),n="",i="",a=[];for(;o.length>0;){let c=!1,l=[],m;for(m=0;m<o.length;m++)if(this.rules.other.blockquoteStart.test(o[m]))l.push(o[m]),c=!0;else if(!c)l.push(o[m]);else break;o=o.slice(m);let d=l.join(`
`),p=d.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}
${d}`:d,i=i?`${i}
${p}`:p;let x=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(p,a,!0),this.lexer.state.top=x,o.length===0)break;let b=a.at(-1);if((b==null?void 0:b.type)==="code")break;if((b==null?void 0:b.type)==="blockquote"){let z=b,y=z.raw+`
`+o.join(`
`),B=this.blockquote(y);a[a.length-1]=B,n=n.substring(0,n.length-z.raw.length)+B.raw,i=i.substring(0,i.length-z.text.length)+B.text;break}else if((b==null?void 0:b.type)==="list"){let z=b,y=z.raw+`
`+o.join(`
`),B=this.list(y);a[a.length-1]=B,n=n.substring(0,n.length-b.raw.length)+B.raw,i=i.substring(0,i.length-z.raw.length)+B.raw,o=y.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:a,text:i}}}list(t){let e=this.rules.block.list.exec(t);if(e){let o=e[1].trim(),n=o.length>1,i={type:"list",raw:"",ordered:n,start:n?+o.slice(0,-1):"",loose:!1,items:[]};o=n?`\\d{1,9}\\${o.slice(-1)}`:`\\${o}`,this.options.pedantic&&(o=n?o:"[*+-]");let a=this.rules.other.listItemRegex(o),c=!1;for(;t;){let m=!1,d="",p="";if(!(e=a.exec(t))||this.rules.block.hr.test(t))break;d=e[0],t=t.substring(d.length);let x=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,ee=>" ".repeat(3*ee.length)),b=t.split(`
`,1)[0],z=!x.trim(),y=0;if(this.options.pedantic?(y=2,p=x.trimStart()):z?y=e[1].length+1:(y=e[2].search(this.rules.other.nonSpaceChar),y=y>4?1:y,p=x.slice(y),y+=e[1].length),z&&this.rules.other.blankLine.test(b)&&(d+=b+`
`,t=t.substring(b.length+1),m=!0),!m){let ee=this.rules.other.nextBulletRegex(y),Te=this.rules.other.hrRegex(y),be=this.rules.other.fencesBeginRegex(y),F=this.rules.other.headingBeginRegex(y),Y=this.rules.other.htmlBeginRegex(y);for(;t;){let N=t.split(`
`,1)[0],q;if(b=N,this.options.pedantic?(b=b.replace(this.rules.other.listReplaceNesting,"  "),q=b):q=b.replace(this.rules.other.tabCharGlobal,"    "),be.test(b)||F.test(b)||Y.test(b)||ee.test(b)||Te.test(b))break;if(q.search(this.rules.other.nonSpaceChar)>=y||!b.trim())p+=`
`+q.slice(y);else{if(z||x.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||be.test(x)||F.test(x)||Te.test(x))break;p+=`
`+b}!z&&!b.trim()&&(z=!0),d+=N+`
`,t=t.substring(N.length+1),x=q.slice(y)}}i.loose||(c?i.loose=!0:this.rules.other.doubleBlankLine.test(d)&&(c=!0));let B=null,re;this.options.gfm&&(B=this.rules.other.listIsTask.exec(p),B&&(re=B[0]!=="[ ] ",p=p.replace(this.rules.other.listReplaceTask,""))),i.items.push({type:"list_item",raw:d,task:!!B,checked:re,loose:!1,text:p,tokens:[]}),i.raw+=d}let l=i.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let m=0;m<i.items.length;m++)if(this.lexer.state.top=!1,i.items[m].tokens=this.lexer.blockTokens(i.items[m].text,[]),!i.loose){let d=i.items[m].tokens.filter(x=>x.type==="space"),p=d.length>0&&d.some(x=>this.rules.other.anyLine.test(x.raw));i.loose=p}if(i.loose)for(let m=0;m<i.items.length;m++)i.items[m].loose=!0;return i}}html(t){let e=this.rules.block.html.exec(t);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(t){let e=this.rules.block.def.exec(t);if(e){let o=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:o,raw:e[0],href:n,title:i}}}table(t){var c;let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let o=_o(e[1]),n=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=(c=e[3])!=null&&c.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:e[0],header:[],align:[],rows:[]};if(o.length===n.length){for(let l of n)this.rules.other.tableAlignRight.test(l)?a.align.push("right"):this.rules.other.tableAlignCenter.test(l)?a.align.push("center"):this.rules.other.tableAlignLeft.test(l)?a.align.push("left"):a.align.push(null);for(let l=0;l<o.length;l++)a.header.push({text:o[l],tokens:this.lexer.inline(o[l]),header:!0,align:a.align[l]});for(let l of i)a.rows.push(_o(l,a.header.length).map((m,d)=>({text:m,tokens:this.lexer.inline(m),header:!1,align:a.align[d]})));return a}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let o=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:o,tokens:this.lexer.inline(o)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let o=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(o)){if(!this.rules.other.endAngleBracket.test(o))return;let a=Le(o.slice(0,-1),"\\");if((o.length-a.length)%2===0)return}else{let a=br(e[2],"()");if(a===-2)return;if(a>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+a;e[2]=e[2].substring(0,a),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let n=e[2],i="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(n);a&&(n=a[1],i=a[3])}else i=e[3]?e[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(o)?n=n.slice(1):n=n.slice(1,-1)),vo(e,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let o;if((o=this.rules.inline.reflink.exec(t))||(o=this.rules.inline.nolink.exec(t))){let n=(o[2]||o[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=e[n.toLowerCase()];if(!i){let a=o[0].charAt(0);return{type:"text",raw:a,text:a}}return vo(o,i,o[0],this.lexer,this.rules)}}emStrong(t,e,o=""){let n=this.rules.inline.emStrongLDelim.exec(t);if(!n||n[3]&&o.match(this.rules.other.unicodeAlphaNumeric))return;if(!(n[1]||n[2]||"")||!o||this.rules.inline.punctuation.exec(o)){let a=[...n[0]].length-1,c,l,m=a,d=0,p=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*t.length+a);(n=p.exec(e))!=null;){if(c=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!c)continue;if(l=[...c].length,n[3]||n[4]){m+=l;continue}else if((n[5]||n[6])&&a%3&&!((a+l)%3)){d+=l;continue}if(m-=l,m>0)continue;l=Math.min(l,l+m+d);let x=[...n[0]][0].length,b=t.slice(0,a+n.index+x+l);if(Math.min(a,l)%2){let y=b.slice(1,-1);return{type:"em",raw:b,text:y,tokens:this.lexer.inlineTokens(y)}}let z=b.slice(2,-2);return{type:"strong",raw:b,text:z,tokens:this.lexer.inlineTokens(z)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let o=e[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(o),i=this.rules.other.startingSpaceChar.test(o)&&this.rules.other.endingSpaceChar.test(o);return n&&i&&(o=o.substring(1,o.length-1)),{type:"codespan",raw:e[0],text:o}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t){let e=this.rules.inline.del.exec(t);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let o,n;return e[2]==="@"?(o=e[1],n="mailto:"+o):(o=e[1],n=o),{type:"link",raw:e[0],text:o,href:n,tokens:[{type:"text",raw:o,text:o}]}}}url(t){var o,n;let e;if(e=this.rules.inline.url.exec(t)){let i,a;if(e[2]==="@")i=e[0],a="mailto:"+i;else{let c;do c=e[0],e[0]=(n=(o=this.rules.inline._backpedal.exec(e[0]))==null?void 0:o[0])!=null?n:"";while(c!==e[0]);i=e[0],e[1]==="www."?a="http://"+e[0]:a=e[0]}return{type:"link",raw:e[0],text:i,href:a,tokens:[{type:"text",raw:i,text:i}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let o=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:o}}}},oe=class _t{constructor(e){T(this,"tokens");T(this,"options");T(this,"state");T(this,"tokenizer");T(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ue,this.options.tokenizer=this.options.tokenizer||new Xe,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let o={other:j,block:Ve.normal,inline:Ie.normal};this.options.pedantic?(o.block=Ve.pedantic,o.inline=Ie.pedantic):this.options.gfm&&(o.block=Ve.gfm,this.options.breaks?o.inline=Ie.breaks:o.inline=Ie.gfm),this.tokenizer.rules=o}static get rules(){return{block:Ve,inline:Ie}}static lex(e,o){return new _t(o).lex(e)}static lexInline(e,o){return new _t(o).inlineTokens(e)}lex(e){e=e.replace(j.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let o=0;o<this.inlineQueue.length;o++){let n=this.inlineQueue[o];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,o=[],n=!1){var i,a,c;for(this.options.pedantic&&(e=e.replace(j.tabCharGlobal,"    ").replace(j.spaceLine,""));e;){let l;if((a=(i=this.options.extensions)==null?void 0:i.block)!=null&&a.some(d=>(l=d.call({lexer:this},e,o))?(e=e.substring(l.raw.length),o.push(l),!0):!1))continue;if(l=this.tokenizer.space(e)){e=e.substring(l.raw.length);let d=o.at(-1);l.raw.length===1&&d!==void 0?d.raw+=`
`:o.push(l);continue}if(l=this.tokenizer.code(e)){e=e.substring(l.raw.length);let d=o.at(-1);(d==null?void 0:d.type)==="paragraph"||(d==null?void 0:d.type)==="text"?(d.raw+=`
`+l.raw,d.text+=`
`+l.text,this.inlineQueue.at(-1).src=d.text):o.push(l);continue}if(l=this.tokenizer.fences(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.heading(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.hr(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.blockquote(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.list(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.html(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.def(e)){e=e.substring(l.raw.length);let d=o.at(-1);(d==null?void 0:d.type)==="paragraph"||(d==null?void 0:d.type)==="text"?(d.raw+=`
`+l.raw,d.text+=`
`+l.raw,this.inlineQueue.at(-1).src=d.text):this.tokens.links[l.tag]||(this.tokens.links[l.tag]={href:l.href,title:l.title});continue}if(l=this.tokenizer.table(e)){e=e.substring(l.raw.length),o.push(l);continue}if(l=this.tokenizer.lheading(e)){e=e.substring(l.raw.length),o.push(l);continue}let m=e;if((c=this.options.extensions)!=null&&c.startBlock){let d=1/0,p=e.slice(1),x;this.options.extensions.startBlock.forEach(b=>{x=b.call({lexer:this},p),typeof x=="number"&&x>=0&&(d=Math.min(d,x))}),d<1/0&&d>=0&&(m=e.substring(0,d+1))}if(this.state.top&&(l=this.tokenizer.paragraph(m))){let d=o.at(-1);n&&(d==null?void 0:d.type)==="paragraph"?(d.raw+=`
`+l.raw,d.text+=`
`+l.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=d.text):o.push(l),n=m.length!==e.length,e=e.substring(l.raw.length);continue}if(l=this.tokenizer.text(e)){e=e.substring(l.raw.length);let d=o.at(-1);(d==null?void 0:d.type)==="text"?(d.raw+=`
`+l.raw,d.text+=`
`+l.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=d.text):o.push(l);continue}if(e){let d="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return this.state.top=!0,o}inline(e,o=[]){return this.inlineQueue.push({src:e,tokens:o}),o}inlineTokens(e,o=[]){var l,m,d;let n=e,i=null;if(this.tokens.links){let p=Object.keys(this.tokens.links);if(p.length>0)for(;(i=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)p.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(i=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,i.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(i=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)n=n.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let a=!1,c="";for(;e;){a||(c=""),a=!1;let p;if((m=(l=this.options.extensions)==null?void 0:l.inline)!=null&&m.some(b=>(p=b.call({lexer:this},e,o))?(e=e.substring(p.raw.length),o.push(p),!0):!1))continue;if(p=this.tokenizer.escape(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.tag(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.link(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(p.raw.length);let b=o.at(-1);p.type==="text"&&(b==null?void 0:b.type)==="text"?(b.raw+=p.raw,b.text+=p.text):o.push(p);continue}if(p=this.tokenizer.emStrong(e,n,c)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.codespan(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.br(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.del(e)){e=e.substring(p.raw.length),o.push(p);continue}if(p=this.tokenizer.autolink(e)){e=e.substring(p.raw.length),o.push(p);continue}if(!this.state.inLink&&(p=this.tokenizer.url(e))){e=e.substring(p.raw.length),o.push(p);continue}let x=e;if((d=this.options.extensions)!=null&&d.startInline){let b=1/0,z=e.slice(1),y;this.options.extensions.startInline.forEach(B=>{y=B.call({lexer:this},z),typeof y=="number"&&y>=0&&(b=Math.min(b,y))}),b<1/0&&b>=0&&(x=e.substring(0,b+1))}if(p=this.tokenizer.inlineText(x)){e=e.substring(p.raw.length),p.raw.slice(-1)!=="_"&&(c=p.raw.slice(-1)),a=!0;let b=o.at(-1);(b==null?void 0:b.type)==="text"?(b.raw+=p.raw,b.text+=p.text):o.push(p);continue}if(e){let b="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(b);break}else throw new Error(b)}}return o}},Ke=class{constructor(t){T(this,"options");T(this,"parser");this.options=t||ue}space(t){return""}code({text:t,lang:e,escaped:o}){var a;let n=(a=(e||"").match(j.notSpaceStart))==null?void 0:a[0],i=t.replace(j.endingNewline,"")+`
`;return n?'<pre><code class="language-'+K(n)+'">'+(o?i:K(i,!0))+`</code></pre>
`:"<pre><code>"+(o?i:K(i,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,o=t.start,n="";for(let c=0;c<t.items.length;c++){let l=t.items[c];n+=this.listitem(l)}let i=e?"ol":"ul",a=e&&o!==1?' start="'+o+'"':"";return"<"+i+a+`>
`+n+"</"+i+`>
`}listitem(t){var o;let e="";if(t.task){let n=this.checkbox({checked:!!t.checked});t.loose?((o=t.tokens[0])==null?void 0:o.type)==="paragraph"?(t.tokens[0].text=n+" "+t.tokens[0].text,t.tokens[0].tokens&&t.tokens[0].tokens.length>0&&t.tokens[0].tokens[0].type==="text"&&(t.tokens[0].tokens[0].text=n+" "+K(t.tokens[0].tokens[0].text),t.tokens[0].tokens[0].escaped=!0)):t.tokens.unshift({type:"text",raw:n+" ",text:n+" ",escaped:!0}):e+=n+" "}return e+=this.parser.parse(t.tokens,!!t.loose),`<li>${e}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",o="";for(let i=0;i<t.header.length;i++)o+=this.tablecell(t.header[i]);e+=this.tablerow({text:o});let n="";for(let i=0;i<t.rows.length;i++){let a=t.rows[i];o="";for(let c=0;c<a.length;c++)o+=this.tablecell(a[c]);n+=this.tablerow({text:o})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+n+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),o=t.header?"th":"td";return(t.align?`<${o} align="${t.align}">`:`<${o}>`)+e+`</${o}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${K(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:o}){let n=this.parser.parseInline(o),i=xo(t);if(i===null)return n;t=i;let a='<a href="'+t+'"';return e&&(a+=' title="'+K(e)+'"'),a+=">"+n+"</a>",a}image({href:t,title:e,text:o,tokens:n}){n&&(o=this.parser.parseInline(n,this.parser.textRenderer));let i=xo(t);if(i===null)return K(o);t=i;let a=`<img src="${t}" alt="${o}"`;return e&&(a+=` title="${K(e)}"`),a+=">",a}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:K(t.text)}},Ot=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}},ne=class vt{constructor(e){T(this,"options");T(this,"renderer");T(this,"textRenderer");this.options=e||ue,this.options.renderer=this.options.renderer||new Ke,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Ot}static parse(e,o){return new vt(o).parse(e)}static parseInline(e,o){return new vt(o).parseInline(e)}parse(e,o=!0){var i,a;let n="";for(let c=0;c<e.length;c++){let l=e[c];if((a=(i=this.options.extensions)==null?void 0:i.renderers)!=null&&a[l.type]){let d=l,p=this.options.extensions.renderers[d.type].call({parser:this},d);if(p!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(d.type)){n+=p||"";continue}}let m=l;switch(m.type){case"space":{n+=this.renderer.space(m);continue}case"hr":{n+=this.renderer.hr(m);continue}case"heading":{n+=this.renderer.heading(m);continue}case"code":{n+=this.renderer.code(m);continue}case"table":{n+=this.renderer.table(m);continue}case"blockquote":{n+=this.renderer.blockquote(m);continue}case"list":{n+=this.renderer.list(m);continue}case"html":{n+=this.renderer.html(m);continue}case"paragraph":{n+=this.renderer.paragraph(m);continue}case"text":{let d=m,p=this.renderer.text(d);for(;c+1<e.length&&e[c+1].type==="text";)d=e[++c],p+=`
`+this.renderer.text(d);o?n+=this.renderer.paragraph({type:"paragraph",raw:p,text:p,tokens:[{type:"text",raw:p,text:p,escaped:!0}]}):n+=p;continue}default:{let d='Token with "'+m.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return n}parseInline(e,o=this.renderer){var i,a;let n="";for(let c=0;c<e.length;c++){let l=e[c];if((a=(i=this.options.extensions)==null?void 0:i.renderers)!=null&&a[l.type]){let d=this.options.extensions.renderers[l.type].call({parser:this},l);if(d!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(l.type)){n+=d||"";continue}}let m=l;switch(m.type){case"escape":{n+=o.text(m);break}case"html":{n+=o.html(m);break}case"link":{n+=o.link(m);break}case"image":{n+=o.image(m);break}case"strong":{n+=o.strong(m);break}case"em":{n+=o.em(m);break}case"codespan":{n+=o.codespan(m);break}case"br":{n+=o.br(m);break}case"del":{n+=o.del(m);break}case"text":{n+=o.text(m);break}default:{let d='Token with "'+m.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return n}},yt,Ye=(yt=class{constructor(t){T(this,"options");T(this,"block");this.options=t||ue}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}provideLexer(){return this.block?oe.lex:oe.lexInline}provideParser(){return this.block?ne.parse:ne.parseInline}},T(yt,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"])),yt),gr=class{constructor(...t){T(this,"defaults",Tt());T(this,"options",this.setOptions);T(this,"parse",this.parseMarkdown(!0));T(this,"parseInline",this.parseMarkdown(!1));T(this,"Parser",ne);T(this,"Renderer",Ke);T(this,"TextRenderer",Ot);T(this,"Lexer",oe);T(this,"Tokenizer",Xe);T(this,"Hooks",Ye);this.use(...t)}walkTokens(t,e){var n,i;let o=[];for(let a of t)switch(o=o.concat(e.call(this,a)),a.type){case"table":{let c=a;for(let l of c.header)o=o.concat(this.walkTokens(l.tokens,e));for(let l of c.rows)for(let m of l)o=o.concat(this.walkTokens(m.tokens,e));break}case"list":{let c=a;o=o.concat(this.walkTokens(c.items,e));break}default:{let c=a;(i=(n=this.defaults.extensions)==null?void 0:n.childTokens)!=null&&i[c.type]?this.defaults.extensions.childTokens[c.type].forEach(l=>{let m=c[l].flat(1/0);o=o.concat(this.walkTokens(m,e))}):c.tokens&&(o=o.concat(this.walkTokens(c.tokens,e)))}}return o}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(o=>{let n={...o};if(n.async=this.defaults.async||n.async||!1,o.extensions&&(o.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let a=e.renderers[i.name];a?e.renderers[i.name]=function(...c){let l=i.renderer.apply(this,c);return l===!1&&(l=a.apply(this,c)),l}:e.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=e[i.level];a?a.unshift(i.tokenizer):e[i.level]=[i.tokenizer],i.start&&(i.level==="block"?e.startBlock?e.startBlock.push(i.start):e.startBlock=[i.start]:i.level==="inline"&&(e.startInline?e.startInline.push(i.start):e.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(e.childTokens[i.name]=i.childTokens)}),n.extensions=e),o.renderer){let i=this.defaults.renderer||new Ke(this.defaults);for(let a in o.renderer){if(!(a in i))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let c=a,l=o.renderer[c],m=i[c];i[c]=(...d)=>{let p=l.apply(i,d);return p===!1&&(p=m.apply(i,d)),p||""}}n.renderer=i}if(o.tokenizer){let i=this.defaults.tokenizer||new Xe(this.defaults);for(let a in o.tokenizer){if(!(a in i))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let c=a,l=o.tokenizer[c],m=i[c];i[c]=(...d)=>{let p=l.apply(i,d);return p===!1&&(p=m.apply(i,d)),p}}n.tokenizer=i}if(o.hooks){let i=this.defaults.hooks||new Ye;for(let a in o.hooks){if(!(a in i))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let c=a,l=o.hooks[c],m=i[c];Ye.passThroughHooks.has(a)?i[c]=d=>{if(this.defaults.async)return Promise.resolve(l.call(i,d)).then(x=>m.call(i,x));let p=l.call(i,d);return m.call(i,p)}:i[c]=(...d)=>{let p=l.apply(i,d);return p===!1&&(p=m.apply(i,d)),p}}n.hooks=i}if(o.walkTokens){let i=this.defaults.walkTokens,a=o.walkTokens;n.walkTokens=function(c){let l=[];return l.push(a.call(this,c)),i&&(l=l.concat(i.call(this,c))),l}}this.defaults={...this.defaults,...n}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return oe.lex(t,e!=null?e:this.defaults)}parser(t,e){return ne.parse(t,e!=null?e:this.defaults)}parseMarkdown(t){return(o,n)=>{let i={...n},a={...this.defaults,...i},c=this.onError(!!a.silent,!!a.async);if(this.defaults.async===!0&&i.async===!1)return c(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof o=="undefined"||o===null)return c(new Error("marked(): input parameter is undefined or null"));if(typeof o!="string")return c(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(o)+", string expected"));a.hooks&&(a.hooks.options=a,a.hooks.block=t);let l=a.hooks?a.hooks.provideLexer():t?oe.lex:oe.lexInline,m=a.hooks?a.hooks.provideParser():t?ne.parse:ne.parseInline;if(a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(o):o).then(d=>l(d,a)).then(d=>a.hooks?a.hooks.processAllTokens(d):d).then(d=>a.walkTokens?Promise.all(this.walkTokens(d,a.walkTokens)).then(()=>d):d).then(d=>m(d,a)).then(d=>a.hooks?a.hooks.postprocess(d):d).catch(c);try{a.hooks&&(o=a.hooks.preprocess(o));let d=l(o,a);a.hooks&&(d=a.hooks.processAllTokens(d)),a.walkTokens&&this.walkTokens(d,a.walkTokens);let p=m(d,a);return a.hooks&&(p=a.hooks.postprocess(p)),p}catch(d){return c(d)}}}onError(t,e){return o=>{if(o.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let n="<p>An error occurred:</p><pre>"+K(o.message+"",!0)+"</pre>";return e?Promise.resolve(n):n}if(e)return Promise.reject(o);throw o}}},me=new gr;function _(t,e){return me.parse(t,e)}_.options=_.setOptions=function(t){return me.setOptions(t),_.defaults=me.defaults,To(_.defaults),_};_.getDefaults=Tt;_.defaults=ue;_.use=function(...t){return me.use(...t),_.defaults=me.defaults,To(_.defaults),_};_.walkTokens=function(t,e){return me.walkTokens(t,e)};_.parseInline=me.parseInline;_.Parser=ne;_.parser=ne.parse;_.Renderer=Ke;_.TextRenderer=Ot;_.Lexer=oe;_.lexer=oe.lex;_.Tokenizer=Xe;_.Hooks=Ye;_.parse=_;var ci=_.options,pi=_.setOptions,mi=_.use,ui=_.walkTokens,hi=_.parseInline;var bi=ne.parse,fi=oe.lex;function Mo(t,e){(e==null||e>t.length)&&(e=t.length);for(var o=0,n=Array(e);o<e;o++)n[o]=t[o];return n}function wr(t){if(Array.isArray(t))return t}function kr(t,e){var o=t==null?null:typeof Symbol!="undefined"&&t[Symbol.iterator]||t["@@iterator"];if(o!=null){var n,i,a,c,l=[],m=!0,d=!1;try{if(a=(o=o.call(t)).next,e!==0)for(;!(m=(n=a.call(o)).done)&&(l.push(n.value),l.length!==e);m=!0);}catch(p){d=!0,i=p}finally{try{if(!m&&o.return!=null&&(c=o.return(),Object(c)!==c))return}finally{if(d)throw i}}return l}}function yr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function xr(t,e){return wr(t)||kr(t,e)||_r(t,e)||yr()}function _r(t,e){if(t){if(typeof t=="string")return Mo(t,e);var o={}.toString.call(t).slice(8,-1);return o==="Object"&&t.constructor&&(o=t.constructor.name),o==="Map"||o==="Set"?Array.from(t):o==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?Mo(t,e):void 0}}var Zo=Object.entries,Do=Object.setPrototypeOf,vr=Object.isFrozen,Tr=Object.getPrototypeOf,Er=Object.getOwnPropertyDescriptor,U=Object.freeze,$=Object.seal,ve=Object.create,Xo=typeof Reflect!="undefined"&&Reflect,Ut=Xo.apply,$t=Xo.construct;U||(U=function(e){return e});$||($=function(e){return e});Ut||(Ut=function(e,o){for(var n=arguments.length,i=new Array(n>2?n-2:0),a=2;a<n;a++)i[a-2]=arguments[a];return e.apply(o,i)});$t||($t=function(e){for(var o=arguments.length,n=new Array(o>1?o-1:0),i=1;i<o;i++)n[i-1]=arguments[i];return new e(...n)});var Ne=O(Array.prototype.forEach),Sr=O(Array.prototype.lastIndexOf),Po=O(Array.prototype.pop),_e=O(Array.prototype.push),Ar=O(Array.prototype.splice),de=Array.isArray,Pe=O(String.prototype.toLowerCase),zt=O(String.prototype.toString),Uo=O(String.prototype.match),Me=O(String.prototype.replace),$o=O(String.prototype.indexOf),Rr=O(String.prototype.trim),Cr=O(Number.prototype.toString),Ir=O(Boolean.prototype.toString),Bo=typeof BigInt=="undefined"?null:O(BigInt.prototype.toString),Fo=typeof Symbol=="undefined"?null:O(Symbol.prototype.toString),D=O(Object.prototype.hasOwnProperty),De=O(Object.prototype.toString),P=O(RegExp.prototype.test),he=Lr(TypeError);function O(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var o=arguments.length,n=new Array(o>1?o-1:0),i=1;i<o;i++)n[i-1]=arguments[i];return Ut(t,e,n)}}function Lr(t){return function(){for(var e=arguments.length,o=new Array(e),n=0;n<e;n++)o[n]=arguments[n];return $t(t,o)}}function w(t,e){let o=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Pe;if(Do&&Do(t,null),!de(e))return t;let n=e.length;for(;n--;){let i=e[n];if(typeof i=="string"){let a=o(i);a!==i&&(vr(e)||(e[n]=a),i=a)}t[i]=!0}return t}function Or(t){for(let e=0;e<t.length;e++)D(t,e)||(t[e]=null);return t}function G(t){let e=ve(null);for(let n of Zo(t)){var o=xr(n,2);let i=o[0],a=o[1];D(t,i)&&(de(a)?e[i]=Or(a):a&&typeof a=="object"&&a.constructor===Object?e[i]=G(a):e[i]=a)}return e}function zr(t){switch(typeof t){case"string":return t;case"number":return Cr(t);case"boolean":return Ir(t);case"bigint":return Bo?Bo(t):"0";case"symbol":return Fo?Fo(t):"Symbol()";case"undefined":return De(t);case"function":case"object":{if(t===null)return De(t);let e=t,o=J(e,"toString");if(typeof o=="function"){let n=o(e);return typeof n=="string"?n:De(n)}return De(t)}default:return De(t)}}function J(t,e){for(;t!==null;){let n=Er(t,e);if(n){if(n.get)return O(n.get);if(typeof n.value=="function")return O(n.value)}t=Tr(t)}function o(){return null}return o}function Nr(t){try{return P(t,""),!0}catch(e){return!1}}var Ho=U(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Nt=U(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Mt=U(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Mr=U(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Dt=U(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Dr=U(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),jo=U(["#text"]),Go=U(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Pt=U(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),qo=U(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),et=U(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Pr=$(/{{[\w\W]*|^[\w\W]*}}/g),Ur=$(/<%[\w\W]*|^[\w\W]*%>/g),$r=$(/\${[\w\W]*/g),Br=$(/^data-[\-\w.\u00B7-\uFFFF]+$/),Fr=$(/^aria-[\-\w]+$/),Wo=$(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Hr=$(/^(?:\w+script|data):/i),jr=$(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Gr=$(/^html$/i),qr=$(/^[a-z][.\w]*(-[.\w]+)+$/i),Vo=$(/<[/\w!]/g),Wr=$(/<[/\w]/g),Vr=$(/<\/no(script|embed|frames)/i),Yr=$(/\/>/i),Q={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Zr=function(){return typeof window=="undefined"?null:window},Xr=function(e,o){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let n=null,i="data-tt-policy-suffix";o&&o.hasAttribute(i)&&(n=o.getAttribute(i));let a="dompurify"+(n?"#"+n:"");try{return e.createPolicy(a,{createHTML(c){return c},createScriptURL(c){return c}})}catch(c){return console.warn("TrustedTypes policy "+a+" could not be created."),null}},Yo=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},le=function(e,o,n,i){return D(e,o)&&de(e[o])?w(i.base?G(i.base):{},e[o],i.transform):n};function Ko(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Zr(),e=h=>Ko(h);if(e.version="3.4.11",e.removed=[],!t||!t.document||t.document.nodeType!==Q.document||!t.Element)return e.isSupported=!1,e;let o=t.document,n=o,i=n.currentScript;t.DocumentFragment;let a=t.HTMLTemplateElement,c=t.Node,l=t.Element,m=t.NodeFilter,d=t.NamedNodeMap;d===void 0&&(t.NamedNodeMap||t.MozNamedAttrMap),t.HTMLFormElement;let p=t.DOMParser,x=t.trustedTypes,b=l.prototype,z=J(b,"cloneNode"),y=J(b,"remove"),B=J(b,"nextSibling"),re=J(b,"childNodes"),ee=J(b,"parentNode"),Te=J(b,"shadowRoot"),be=J(b,"attributes"),F=c&&c.prototype?J(c.prototype,"nodeType"):null,Y=c&&c.prototype?J(c.prototype,"nodeName"):null;if(typeof a=="function"){let h=o.createElement("template");h.content&&h.content.ownerDocument&&(o=h.content.ownerDocument)}let N,q="",tt,jt=!1,Ee=0,Gt=function(){if(Ee>0)throw he('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},fe=function(r){Gt(),Ee++;try{return N.createHTML(r)}finally{Ee--}},an=function(r){Gt(),Ee++;try{return N.createScriptURL(r)}finally{Ee--}},sn=function(){return jt||(tt=Xr(x,i),jt=!0),tt},$e=o,ot=$e.implementation,qt=$e.createNodeIterator,ln=$e.createDocumentFragment,dn=$e.getElementsByTagName,cn=n.importNode,C=Yo();e.isSupported=typeof Zo=="function"&&typeof ee=="function"&&ot&&ot.createHTMLDocument!==void 0;let pn=Pr,mn=Ur,un=$r,hn=Br,bn=Fr,fn=Hr,Wt=jr,gn=qr,Vt=Wo,E=null,Yt=w({},[...Ho,...Nt,...Mt,...Dt,...jo]),S=null,Zt=w({},[...Go,...Pt,...qo,...et]),A=Object.seal(ve(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Se=null,Xt=null,ie=Object.seal(ve(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),Kt=!0,nt=!0,Qt=!1,Jt=!0,ae=!1,Ae=!0,ce=!1,rt=!1,it=null,at=null,st=!1,ge=!1,Be=!1,Fe=!1,eo=!0,to=!1,oo="user-content-",lt=!0,dt=!1,we={},Z=null,ct=w({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]),no=null,ro=w({},["audio","video","img","source","image","track"]),pt=null,io=w({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),He="http://www.w3.org/1998/Math/MathML",je="http://www.w3.org/2000/svg",X="http://www.w3.org/1999/xhtml",ke=X,mt=!1,ut=null,wn=w({},[He,je,X],zt),ao=U(["mi","mo","mn","ms","mtext"]),ht=w({},ao),so=U(["annotation-xml"]),bt=w({},so),kn=w({},["title","style","font","a","script"]),Re=null,yn=["application/xhtml+xml","text/html"],xn="text/html",R=null,ye=null,_n=o.createElement("form"),lo=function(r){return r instanceof RegExp||r instanceof Function},ft=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(ye&&ye===r)return;(!r||typeof r!="object")&&(r={}),r=G(r),Re=yn.indexOf(r.PARSER_MEDIA_TYPE)===-1?xn:r.PARSER_MEDIA_TYPE,R=Re==="application/xhtml+xml"?zt:Pe,E=le(r,"ALLOWED_TAGS",Yt,{transform:R}),S=le(r,"ALLOWED_ATTR",Zt,{transform:R}),ut=le(r,"ALLOWED_NAMESPACES",wn,{transform:zt}),pt=le(r,"ADD_URI_SAFE_ATTR",io,{transform:R,base:io}),no=le(r,"ADD_DATA_URI_TAGS",ro,{transform:R,base:ro}),Z=le(r,"FORBID_CONTENTS",ct,{transform:R}),Se=le(r,"FORBID_TAGS",G({}),{transform:R}),Xt=le(r,"FORBID_ATTR",G({}),{transform:R}),we=D(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?G(r.USE_PROFILES):r.USE_PROFILES:!1,Kt=r.ALLOW_ARIA_ATTR!==!1,nt=r.ALLOW_DATA_ATTR!==!1,Qt=r.ALLOW_UNKNOWN_PROTOCOLS||!1,Jt=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ae=r.SAFE_FOR_TEMPLATES||!1,Ae=r.SAFE_FOR_XML!==!1,ce=r.WHOLE_DOCUMENT||!1,ge=r.RETURN_DOM||!1,Be=r.RETURN_DOM_FRAGMENT||!1,Fe=r.RETURN_TRUSTED_TYPE||!1,st=r.FORCE_BODY||!1,eo=r.SANITIZE_DOM!==!1,to=r.SANITIZE_NAMED_PROPS||!1,lt=r.KEEP_CONTENT!==!1,dt=r.IN_PLACE||!1,Vt=Nr(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:Wo,ke=typeof r.NAMESPACE=="string"?r.NAMESPACE:X,ht=D(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?G(r.MATHML_TEXT_INTEGRATION_POINTS):w({},ao),bt=D(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?G(r.HTML_INTEGRATION_POINTS):w({},so);let s=D(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?G(r.CUSTOM_ELEMENT_HANDLING):ve(null);if(A=ve(null),D(s,"tagNameCheck")&&lo(s.tagNameCheck)&&(A.tagNameCheck=s.tagNameCheck),D(s,"attributeNameCheck")&&lo(s.attributeNameCheck)&&(A.attributeNameCheck=s.attributeNameCheck),D(s,"allowCustomizedBuiltInElements")&&typeof s.allowCustomizedBuiltInElements=="boolean"&&(A.allowCustomizedBuiltInElements=s.allowCustomizedBuiltInElements),$(A),ae&&(nt=!1),Be&&(ge=!0),we&&(E=w({},jo),S=ve(null),we.html===!0&&(w(E,Ho),w(S,Go)),we.svg===!0&&(w(E,Nt),w(S,Pt),w(S,et)),we.svgFilters===!0&&(w(E,Mt),w(S,Pt),w(S,et)),we.mathMl===!0&&(w(E,Dt),w(S,qo),w(S,et))),ie.tagCheck=null,ie.attributeCheck=null,D(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?ie.tagCheck=r.ADD_TAGS:de(r.ADD_TAGS)&&(E===Yt&&(E=G(E)),w(E,r.ADD_TAGS,R))),D(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?ie.attributeCheck=r.ADD_ATTR:de(r.ADD_ATTR)&&(S===Zt&&(S=G(S)),w(S,r.ADD_ATTR,R))),D(r,"ADD_URI_SAFE_ATTR")&&de(r.ADD_URI_SAFE_ATTR)&&w(pt,r.ADD_URI_SAFE_ATTR,R),D(r,"FORBID_CONTENTS")&&de(r.FORBID_CONTENTS)&&(Z===ct&&(Z=G(Z)),w(Z,r.FORBID_CONTENTS,R)),D(r,"ADD_FORBID_CONTENTS")&&de(r.ADD_FORBID_CONTENTS)&&(Z===ct&&(Z=G(Z)),w(Z,r.ADD_FORBID_CONTENTS,R)),lt&&(E["#text"]=!0),ce&&w(E,["html","head","body"]),E.table&&(w(E,["tbody"]),delete Se.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw he('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw he('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');let u=N;N=r.TRUSTED_TYPES_POLICY;try{q=fe("")}catch(f){throw N=u,f}}else r.TRUSTED_TYPES_POLICY===null?(N=void 0,q=""):(N===void 0&&(N=sn()),N&&typeof q=="string"&&(q=fe("")));U&&U(r),ye=r},co=w({},[...Nt,...Mt,...Mr]),po=w({},[...Dt,...Dr]),vn=function(r,s,u){return s.namespaceURI===X?r==="svg":s.namespaceURI===He?r==="svg"&&(u==="annotation-xml"||ht[u]):!!co[r]},Tn=function(r,s,u){return s.namespaceURI===X?r==="math":s.namespaceURI===je?r==="math"&&bt[u]:!!po[r]},En=function(r,s,u){return s.namespaceURI===je&&!bt[u]||s.namespaceURI===He&&!ht[u]?!1:!po[r]&&(kn[r]||!co[r])},Sn=function(r){let s=ee(r);(!s||!s.tagName)&&(s={namespaceURI:ke,tagName:"template"});let u=Pe(r.tagName),f=Pe(s.tagName);return ut[r.namespaceURI]?r.namespaceURI===je?vn(u,s,f):r.namespaceURI===He?Tn(u,s,f):r.namespaceURI===X?En(u,s,f):!!(Re==="application/xhtml+xml"&&ut[r.namespaceURI]):!1},se=function(r){_e(e.removed,{element:r});try{ee(r).removeChild(r)}catch(s){if(y(r),!ee(r))throw he("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},mo=function(r){let s=re(r);if(s){let f=[];Ne(s,g=>{_e(f,g)}),Ne(f,g=>{try{y(g)}catch(k){}})}let u=be(r);if(u)for(let f=u.length-1;f>=0;--f){let g=u[f],k=g&&g.name;if(typeof k=="string")try{r.removeAttribute(k)}catch(M){}}},pe=function(r,s){try{_e(e.removed,{attribute:s.getAttributeNode(r),from:s})}catch(u){_e(e.removed,{attribute:null,from:s})}if(s.removeAttribute(r),r==="is")if(ge||Be)try{se(s)}catch(u){}else try{s.setAttribute(r,"")}catch(u){}},An=function(r){let s=be(r);if(s)for(let u=s.length-1;u>=0;--u){let f=s[u],g=f&&f.name;if(!(typeof g!="string"||S[R(g)]))try{r.removeAttribute(g)}catch(k){}}},Rn=function(r){let s=[r];for(;s.length>0;){let u=s.pop();(F?F(u):u.nodeType)===Q.element&&An(u);let g=re(u);if(g)for(let k=g.length-1;k>=0;--k)s.push(g[k])}},uo=function(r){let s=null,u=null;if(st)r="<remove></remove>"+r;else{let k=Uo(r,/^[\r\n\t ]+/);u=k&&k[0]}Re==="application/xhtml+xml"&&ke===X&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");let f=N?fe(r):r;if(ke===X)try{s=new p().parseFromString(f,Re)}catch(k){}if(!s||!s.documentElement){s=ot.createDocument(ke,"template",null);try{s.documentElement.innerHTML=mt?q:f}catch(k){}}let g=s.body||s.documentElement;return r&&u&&g.insertBefore(o.createTextNode(u),g.childNodes[0]||null),ke===X?dn.call(s,ce?"html":"body")[0]:ce?s.documentElement:g},ho=function(r){return qt.call(r.ownerDocument||r,r,m.SHOW_ELEMENT|m.SHOW_COMMENT|m.SHOW_TEXT|m.SHOW_PROCESSING_INSTRUCTION|m.SHOW_CDATA_SECTION,null)},Ge=function(r){return r=Me(r,pn," "),r=Me(r,mn," "),r=Me(r,un," "),r},gt=function(r){var s;r.normalize();let u=qt.call(r.ownerDocument||r,r,m.SHOW_TEXT|m.SHOW_COMMENT|m.SHOW_CDATA_SECTION|m.SHOW_PROCESSING_INSTRUCTION,null),f=u.nextNode();for(;f;)f.data=Ge(f.data),f=u.nextNode();let g=(s=r.querySelectorAll)===null||s===void 0?void 0:s.call(r,"template");g&&Ne(g,k=>{xe(k.content)&&gt(k.content)})},qe=function(r){let s=Y?Y(r):null;return typeof s!="string"||R(s)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==be(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==F(r)||r.childNodes!==re(r)},xe=function(r){if(!F||typeof r!="object"||r===null)return!1;try{return F(r)===Q.documentFragment}catch(s){return!1}},Ce=function(r){if(!F||typeof r!="object"||r===null)return!1;try{return typeof F(r)=="number"}catch(s){return!1}};function te(h,r,s){h.length!==0&&Ne(h,u=>{u.call(e,r,s,ye)})}let Cn=function(r,s){return!!(Ae&&r.hasChildNodes()&&!Ce(r.firstElementChild)&&P(Vo,r.textContent)&&P(Vo,r.innerHTML)||Ae&&r.namespaceURI===X&&s==="style"&&Ce(r.firstElementChild)||r.nodeType===Q.processingInstruction||Ae&&r.nodeType===Q.comment&&P(Wr,r.data))},In=function(r,s){if(!Se[s]&&go(s)&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,s)||A.tagNameCheck instanceof Function&&A.tagNameCheck(s)))return!1;if(lt&&!Z[s]){let u=ee(r),f=re(r);if(f&&u){let g=f.length;for(let k=g-1;k>=0;--k){let M=dt?f[k]:z(f[k],!0);u.insertBefore(M,B(r))}}}return se(r),!0},bo=function(r){if(te(C.beforeSanitizeElements,r,null),qe(r))return se(r),!0;let s=R(Y?Y(r):r.nodeName);if(te(C.uponSanitizeElement,r,{tagName:s,allowedTags:E}),Cn(r,s))return se(r),!0;if(Se[s]||!(ie.tagCheck instanceof Function&&ie.tagCheck(s))&&!E[s])return In(r,s);if((F?F(r):r.nodeType)===Q.element&&!Sn(r)||(s==="noscript"||s==="noembed"||s==="noframes")&&P(Vr,r.innerHTML))return se(r),!0;if(ae&&r.nodeType===Q.text){let f=Ge(r.textContent);r.textContent!==f&&(_e(e.removed,{element:r.cloneNode()}),r.textContent=f)}return te(C.afterSanitizeElements,r,null),!1},fo=function(r,s,u){if(Xt[s]||eo&&(s==="id"||s==="name")&&(u in o||u in _n))return!1;let f=S[s]||ie.attributeCheck instanceof Function&&ie.attributeCheck(s,r);if(!(nt&&P(hn,s))){if(!(Kt&&P(bn,s))){if(f){if(!pt[s]){if(!P(Vt,Me(u,Wt,""))){if(!((s==="src"||s==="xlink:href"||s==="href")&&r!=="script"&&$o(u,"data:")===0&&no[r])){if(!(Qt&&!P(fn,Me(u,Wt,"")))){if(u)return!1}}}}}else if(!(go(r)&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,r)||A.tagNameCheck instanceof Function&&A.tagNameCheck(r))&&(A.attributeNameCheck instanceof RegExp&&P(A.attributeNameCheck,s)||A.attributeNameCheck instanceof Function&&A.attributeNameCheck(s,r))||s==="is"&&A.allowCustomizedBuiltInElements&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,u)||A.tagNameCheck instanceof Function&&A.tagNameCheck(u))))return!1}}return!0},Ln=w({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),go=function(r){return!Ln[Pe(r)]&&P(gn,r)},On=function(r,s,u,f){if(N&&typeof x=="object"&&typeof x.getAttributeType=="function"&&!u)switch(x.getAttributeType(r,s)){case"TrustedHTML":return fe(f);case"TrustedScriptURL":return an(f)}return f},zn=function(r,s,u,f){try{u?r.setAttributeNS(u,s,f):r.setAttribute(s,f),qe(r)?se(r):Po(e.removed)}catch(g){pe(s,r)}},wo=function(r){te(C.beforeSanitizeAttributes,r,null);let s=r.attributes;if(!s||qe(r))return;let u={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:S,forceKeepAttr:void 0},f=s.length,g=R(r.nodeName);for(;f--;){let k=s[f],M=k.name,L=k.namespaceURI,W=k.value,V=R(M),kt=W,H=M==="value"?kt:Rr(kt);if(u.attrName=V,u.attrValue=H,u.keepAttr=!0,u.forceKeepAttr=void 0,te(C.uponSanitizeAttribute,r,u),H=u.attrValue,to&&(V==="id"||V==="name")&&$o(H,oo)!==0&&(pe(M,r),H=oo+H),Ae&&P(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,H)){pe(M,r);continue}if(V==="attributename"&&Uo(H,"href")){pe(M,r);continue}if(!u.forceKeepAttr){if(!u.keepAttr){pe(M,r);continue}if(!Jt&&P(Yr,H)){pe(M,r);continue}if(ae&&(H=Ge(H)),!fo(g,V,H)){pe(M,r);continue}H=On(g,V,L,H),H!==kt&&zn(r,M,L,H)}}te(C.afterSanitizeAttributes,r,null)},We=function(r){let s=null,u=ho(r);for(te(C.beforeSanitizeShadowDOM,r,null);s=u.nextNode();)if(te(C.uponSanitizeShadowNode,s,null),bo(s),wo(s),xe(s.content)&&We(s.content),(F?F(s):s.nodeType)===Q.element){let g=Te(s);xe(g)&&(wt(g),We(g))}te(C.afterSanitizeShadowDOM,r,null)},wt=function(r){let s=[{node:r,shadow:null}];for(;s.length>0;){let u=s.pop();if(u.shadow){We(u.shadow);continue}let f=u.node,k=(F?F(f):f.nodeType)===Q.element,M=re(f);if(M)for(let L=M.length-1;L>=0;--L)s.push({node:M[L],shadow:null});if(k){let L=Y?Y(f):null;if(typeof L=="string"&&R(L)==="template"){let W=f.content;xe(W)&&s.push({node:W,shadow:null})}}if(k){let L=Te(f);xe(L)&&s.push({node:null,shadow:L},{node:L,shadow:null})}}};return e.sanitize=function(h){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s=null,u=null,f=null,g=null;if(mt=!h,mt&&(h="<!-->"),typeof h!="string"&&!Ce(h)&&(h=zr(h),typeof h!="string"))throw he("dirty is not a string, aborting");if(!e.isSupported)return h;rt?(E=it,S=at):ft(r),(C.uponSanitizeElement.length>0||C.uponSanitizeAttribute.length>0)&&(E=G(E)),C.uponSanitizeAttribute.length>0&&(S=G(S)),e.removed=[];let k=dt&&typeof h!="string"&&Ce(h);if(k){let W=Y?Y(h):h.nodeName;if(typeof W=="string"){let V=R(W);if(!E[V]||Se[V])throw he("root node is forbidden and cannot be sanitized in-place")}if(qe(h))throw he("root node is clobbered and cannot be sanitized in-place");try{wt(h)}catch(V){throw mo(h),V}}else if(Ce(h))s=uo("<!---->"),u=s.ownerDocument.importNode(h,!0),u.nodeType===Q.element&&u.nodeName==="BODY"||u.nodeName==="HTML"?s=u:s.appendChild(u),wt(u);else{if(!ge&&!ae&&!ce&&h.indexOf("<")===-1)return N&&Fe?fe(h):h;if(s=uo(h),!s)return ge?null:Fe?q:""}s&&st&&se(s.firstChild);let M=ho(k?h:s);try{for(;f=M.nextNode();)bo(f),wo(f),xe(f.content)&&We(f.content)}catch(W){throw k&&mo(h),W}if(k)return Ne(e.removed,W=>{W.element&&Rn(W.element)}),ae&&gt(h),h;if(ge){if(ae&&gt(s),Be)for(g=ln.call(s.ownerDocument);s.firstChild;)g.appendChild(s.firstChild);else g=s;return(S.shadowroot||S.shadowrootmode)&&(g=cn.call(n,g,!0)),g}let L=ce?s.outerHTML:s.innerHTML;return ce&&E["!doctype"]&&s.ownerDocument&&s.ownerDocument.doctype&&s.ownerDocument.doctype.name&&P(Gr,s.ownerDocument.doctype.name)&&(L="<!DOCTYPE "+s.ownerDocument.doctype.name+`>
`+L),ae&&(L=Ge(L)),N&&Fe?fe(L):L},e.setConfig=function(){let h=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};ft(h),rt=!0,it=E,at=S},e.clearConfig=function(){ye=null,rt=!1,it=null,at=null,N=tt,q=""},e.isValidAttribute=function(h,r,s){ye||ft({});let u=R(h),f=R(r);return fo(u,f,s)},e.addHook=function(h,r){typeof r=="function"&&D(C,h)&&_e(C[h],r)},e.removeHook=function(h,r){if(D(C,h)){if(r!==void 0){let s=Sr(C[h],r);return s===-1?void 0:Ar(C[h],s,1)[0]}return Po(C[h])}},e.removeHooks=function(h){D(C,h)&&(C[h]=[])},e.removeAllHooks=function(){C=Yo()},e}var Bt=Ko();var Qo=`/*light */
.markdown-body {
  color-scheme: light;
  /** CSS default easing. Use for hover state changes and micro-interactions. */
  /** Accelerating motion. Use for elements exiting the viewport (moving off-screen). */
  /** Smooth acceleration and deceleration. Use for elements moving or morphing within the viewport. */
  /** Decelerating motion. Use for elements entering the viewport or appearing on screen. */
  /** Constant motion with no acceleration. Use for continuous animations like progress bars or loaders. */
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  font-weight: 400;
  color: #1f2328;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body a {
  text-decoration: underline;
  text-underline-offset: .2rem;
}

.markdown-body .octicon {
  display: inline-block;
  fill: currentColor;
  vertical-align: text-bottom;
}

.markdown-body h1:hover .anchor .octicon-link:before,
.markdown-body h2:hover .anchor .octicon-link:before,
.markdown-body h3:hover .anchor .octicon-link:before,
.markdown-body h4:hover .anchor .octicon-link:before,
.markdown-body h5:hover .anchor .octicon-link:before,
.markdown-body h6:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
  mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
}

.markdown-body details,
.markdown-body figcaption,
.markdown-body figure {
  display: block;
}

.markdown-body summary {
  display: list-item;
}

.markdown-body [hidden] {
  display: none !important;
}

.markdown-body a {
  background-color: rgba(0,0,0,0);
  color: #0969da;
  text-decoration: none;
}

.markdown-body abbr[title] {
  border-bottom: none;
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

.markdown-body b,
.markdown-body strong {
  font-weight: 600;
}

.markdown-body dfn {
  font-style: italic;
}

.markdown-body h1 {
  margin: .67em 0;
  font-weight: 600;
  padding-bottom: .3em;
  font-size: 2em;
  border-bottom: 1px solid #d1d9e0b3;
}

.markdown-body mark {
  background-color: #fff8c5;
  color: #1f2328;
}

.markdown-body small {
  font-size: 90%;
}

.markdown-body sub,
.markdown-body sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.markdown-body sub {
  bottom: -0.25em;
}

.markdown-body sup {
  top: -0.5em;
}

.markdown-body img {
  border-style: none;
  max-width: 100%;
  box-sizing: content-box;
}

.markdown-body code,
.markdown-body kbd,
.markdown-body pre,
.markdown-body samp {
  font-family: monospace;
  font-size: 1em;
}

.markdown-body figure {
  margin: 1em 2.5rem;
}

.markdown-body hr {
  box-sizing: content-box;
  overflow: hidden;
  background: rgba(0,0,0,0);
  border-bottom: 1px solid #d1d9e0b3;
  height: .25em;
  padding: 0;
  margin: 1.5rem 0;
  background-color: #d1d9e0;
  border: 0;
}

.markdown-body input {
  font: inherit;
  margin: 0;
  overflow: visible;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.markdown-body [type=button],
.markdown-body [type=reset],
.markdown-body [type=submit] {
  -webkit-appearance: button;
  appearance: button;
}

.markdown-body [type=checkbox],
.markdown-body [type=radio] {
  box-sizing: border-box;
  padding: 0;
}

.markdown-body [type=number]::-webkit-inner-spin-button,
.markdown-body [type=number]::-webkit-outer-spin-button {
  height: auto;
}

.markdown-body [type=search]::-webkit-search-cancel-button,
.markdown-body [type=search]::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.markdown-body ::-webkit-input-placeholder {
  color: inherit;
  opacity: .54;
}

.markdown-body ::-webkit-file-upload-button {
  -webkit-appearance: button;
  appearance: button;
  font: inherit;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ::placeholder {
  color: #59636e;
  opacity: 1;
}

.markdown-body hr::before {
  display: table;
  content: "";
}

.markdown-body hr::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  font-variant: tabular-nums;
}

.markdown-body td,
.markdown-body th {
  padding: 0;
}

.markdown-body details summary {
  cursor: pointer;
}

.markdown-body a:focus,
.markdown-body [role=button]:focus,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=checkbox]:focus {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:focus:not(:focus-visible),
.markdown-body [role=button]:focus:not(:focus-visible),
.markdown-body input[type=radio]:focus:not(:focus-visible),
.markdown-body input[type=checkbox]:focus:not(:focus-visible) {
  outline: solid 1px rgba(0,0,0,0);
}

.markdown-body a:focus-visible,
.markdown-body [role=button]:focus-visible,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus-visible {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:not([class]):focus,
.markdown-body a:not([class]):focus-visible,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus,
.markdown-body input[type=checkbox]:focus-visible {
  outline-offset: 0;
}

.markdown-body kbd {
  display: inline-block;
  padding: 0.25rem;
  font: 11px ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  line-height: 10px;
  color: #1f2328;
  vertical-align: middle;
  background-color: #f6f8fa;
  border: solid 1px var(--borderColor-muted);
  border-bottom-color: var(--borderColor-muted);
  border-radius: 6px;
  box-shadow: inset 0 -1px 0 var(--borderColor-muted);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h2 {
  font-weight: 600;
  padding-bottom: .3em;
  font-size: 1.5em;
  border-bottom: 1px solid #d1d9e0b3;
}

.markdown-body h3 {
  font-weight: 600;
  font-size: 1.25em;
}

.markdown-body h4 {
  font-weight: 600;
  font-size: 1em;
}

.markdown-body h5 {
  font-weight: 600;
  font-size: .875em;
}

.markdown-body h6 {
  font-weight: 600;
  font-size: .85em;
  color: #59636e;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: #59636e;
  border-left: .25em solid #d1d9e0;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 2em;
}

.markdown-body ol ol,
.markdown-body ul ol {
  list-style-type: lower-roman;
}

.markdown-body ul ul ol,
.markdown-body ul ol ol,
.markdown-body ol ul ol,
.markdown-body ol ol ol {
  list-style-type: lower-alpha;
}

.markdown-body dd {
  margin-left: 0;
}

.markdown-body tt,
.markdown-body code,
.markdown-body samp {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 12px;
}

.markdown-body pre {
  margin-top: 0;
  margin-bottom: 0;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 12px;
  word-wrap: normal;
}

.markdown-body .octicon {
  display: inline-block;
  overflow: visible !important;
  vertical-align: text-bottom;
  fill: currentColor;
}

.markdown-body input::-webkit-outer-spin-button,
.markdown-body input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.markdown-body .mr-2 {
  margin-right: 0.5rem !important;
}

.markdown-body::before {
  display: table;
  content: "";
}

.markdown-body::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body>*:first-child {
  margin-top: 0 !important;
}

.markdown-body>*:last-child {
  margin-bottom: 0 !important;
}

.markdown-body a:not([href]) {
  color: inherit;
  text-decoration: none;
}

.markdown-body .absent {
  color: #d1242f;
}

.markdown-body .anchor {
  float: left;
  padding-right: 0.25rem;
  margin-left: -20px;
  line-height: 1;
}

.markdown-body .anchor:focus {
  outline: none;
}

.markdown-body p,
.markdown-body blockquote,
.markdown-body ul,
.markdown-body ol,
.markdown-body dl,
.markdown-body table,
.markdown-body pre,
.markdown-body details {
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-body blockquote>:first-child {
  margin-top: 0;
}

.markdown-body blockquote>:last-child {
  margin-bottom: 0;
}

.markdown-body h1 .octicon-link,
.markdown-body h2 .octicon-link,
.markdown-body h3 .octicon-link,
.markdown-body h4 .octicon-link,
.markdown-body h5 .octicon-link,
.markdown-body h6 .octicon-link {
  color: #1f2328;
  vertical-align: middle;
  visibility: hidden;
}

.markdown-body h1:hover .anchor,
.markdown-body h2:hover .anchor,
.markdown-body h3:hover .anchor,
.markdown-body h4:hover .anchor,
.markdown-body h5:hover .anchor,
.markdown-body h6:hover .anchor {
  text-decoration: none;
}

.markdown-body h1:hover .anchor .octicon-link,
.markdown-body h2:hover .anchor .octicon-link,
.markdown-body h3:hover .anchor .octicon-link,
.markdown-body h4:hover .anchor .octicon-link,
.markdown-body h5:hover .anchor .octicon-link,
.markdown-body h6:hover .anchor .octicon-link {
  visibility: visible;
}

.markdown-body h1 tt,
.markdown-body h1 code,
.markdown-body h2 tt,
.markdown-body h2 code,
.markdown-body h3 tt,
.markdown-body h3 code,
.markdown-body h4 tt,
.markdown-body h4 code,
.markdown-body h5 tt,
.markdown-body h5 code,
.markdown-body h6 tt,
.markdown-body h6 code {
  padding: 0 .2em;
  font-size: inherit;
}

.markdown-body summary h1,
.markdown-body summary h2,
.markdown-body summary h3,
.markdown-body summary h4,
.markdown-body summary h5,
.markdown-body summary h6 {
  display: inline-block;
}

.markdown-body summary h1 .anchor,
.markdown-body summary h2 .anchor,
.markdown-body summary h3 .anchor,
.markdown-body summary h4 .anchor,
.markdown-body summary h5 .anchor,
.markdown-body summary h6 .anchor {
  margin-left: -40px;
}

.markdown-body summary h1,
.markdown-body summary h2 {
  padding-bottom: 0;
  border-bottom: 0;
}

.markdown-body ul.no-list,
.markdown-body ol.no-list {
  padding: 0;
  list-style-type: none;
}

.markdown-body ol[type="a s"] {
  list-style-type: lower-alpha;
}

.markdown-body ol[type="A s"] {
  list-style-type: upper-alpha;
}

.markdown-body ol[type="i s"] {
  list-style-type: lower-roman;
}

.markdown-body ol[type="I s"] {
  list-style-type: upper-roman;
}

.markdown-body ol[type="1"] {
  list-style-type: decimal;
}

.markdown-body div>ol:not([type]) {
  list-style-type: decimal;
}

.markdown-body ul ul,
.markdown-body ul ol,
.markdown-body ol ol,
.markdown-body ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body li>p {
  margin-top: 1rem;
}

.markdown-body li+li {
  margin-top: .25em;
}

.markdown-body dl {
  padding: 0;
}

.markdown-body dl dt {
  padding: 0;
  margin-top: 1rem;
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
}

.markdown-body dl dd {
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.markdown-body table th {
  font-weight: 600;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #d1d9e0;
}

.markdown-body table td>:last-child {
  margin-bottom: 0;
}

.markdown-body table tr {
  background-color: #ffffff;
  border-top: 1px solid #d1d9e0b3;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-body table img {
  background-color: rgba(0,0,0,0);
}

.markdown-body img[align=right] {
  padding-left: 20px;
}

.markdown-body img[align=left] {
  padding-right: 20px;
}

.markdown-body .emoji {
  max-width: none;
  vertical-align: text-top;
  background-color: rgba(0,0,0,0);
}

.markdown-body span.frame {
  display: block;
  overflow: hidden;
}

.markdown-body span.frame>span {
  display: block;
  float: left;
  width: auto;
  padding: 7px;
  margin: 13px 0 0;
  overflow: hidden;
  border: 1px solid #d1d9e0;
}

.markdown-body span.frame span img {
  display: block;
  float: left;
}

.markdown-body span.frame span span {
  display: block;
  padding: 5px 0 0;
  clear: both;
  color: #1f2328;
}

.markdown-body span.align-center {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-center>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: center;
}

.markdown-body span.align-center span img {
  margin: 0 auto;
  text-align: center;
}

.markdown-body span.align-right {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-right>span {
  display: block;
  margin: 13px 0 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body span.align-right span img {
  margin: 0;
  text-align: right;
}

.markdown-body span.float-left {
  display: block;
  float: left;
  margin-right: 13px;
  overflow: hidden;
}

.markdown-body span.float-left span {
  margin: 13px 0 0;
}

.markdown-body span.float-right {
  display: block;
  float: right;
  margin-left: 13px;
  overflow: hidden;
}

.markdown-body span.float-right>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body code,
.markdown-body tt {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: #818b981f;
  border-radius: 6px;
}

.markdown-body code br,
.markdown-body tt br {
  display: none;
}

.markdown-body del code {
  text-decoration: inherit;
}

.markdown-body samp {
  font-size: 85%;
}

.markdown-body pre code {
  font-size: 100%;
}

.markdown-body pre>code {
  padding: 0;
  margin: 0;
  word-break: normal;
  white-space: pre;
  background: rgba(0,0,0,0);
  border: 0;
}

.markdown-body .highlight {
  margin-bottom: 1rem;
}

.markdown-body .highlight pre {
  margin-bottom: 0;
  word-break: normal;
}

.markdown-body .highlight pre,
.markdown-body pre {
  padding: 1rem;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  color: #1f2328;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-body pre code,
.markdown-body pre tt {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: rgba(0,0,0,0);
  border: 0;
}

.markdown-body .csv-data td,
.markdown-body .csv-data th {
  padding: 5px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.markdown-body .csv-data .blob-num {
  padding: 10px 0.5rem 9px;
  text-align: right;
  background: #ffffff;
  border: 0;
}

.markdown-body .csv-data tr {
  border-top: 0;
}

.markdown-body .csv-data th {
  font-weight: 600;
  background: #f6f8fa;
  border-top: 0;
}

.markdown-body [data-footnote-ref]::before {
  content: "[";
}

.markdown-body [data-footnote-ref]::after {
  content: "]";
}

.markdown-body .footnotes {
  font-size: 12px;
  color: #59636e;
  border-top: 1px solid #d1d9e0;
}

.markdown-body .footnotes ol {
  padding-left: 1rem;
}

.markdown-body .footnotes ol ul {
  display: inline-block;
  padding-left: 1rem;
  margin-top: 1rem;
}

.markdown-body .footnotes li {
  position: relative;
}

.markdown-body .footnotes li:target::before {
  position: absolute;
  top: calc(0.5rem*-1);
  right: calc(0.5rem*-1);
  bottom: calc(0.5rem*-1);
  left: calc(1.5rem*-1);
  pointer-events: none;
  content: "";
  border: 2px solid #0969da;
  border-radius: 6px;
}

.markdown-body .footnotes li:target {
  color: #1f2328;
}

.markdown-body .footnotes .data-footnote-backref g-emoji {
  font-family: monospace;
}

.markdown-body .pl-c {
  color: #59636e;
}

.markdown-body .pl-c1,
.markdown-body .pl-s .pl-v {
  color: #0550ae;
}

.markdown-body .pl-e,
.markdown-body .pl-en {
  color: #6639ba;
}

.markdown-body .pl-smi,
.markdown-body .pl-s .pl-s1 {
  color: #1f2328;
}

.markdown-body .pl-ent {
  color: #0550ae;
}

.markdown-body .pl-k {
  color: #cf222e;
}

.markdown-body .pl-s,
.markdown-body .pl-pds,
.markdown-body .pl-s .pl-pse .pl-s1,
.markdown-body .pl-sr,
.markdown-body .pl-sr .pl-cce,
.markdown-body .pl-sr .pl-sre,
.markdown-body .pl-sr .pl-sra {
  color: #0a3069;
}

.markdown-body .pl-v,
.markdown-body .pl-smw {
  color: #953800;
}

.markdown-body .pl-bu {
  color: #82071e;
}

.markdown-body .pl-ii {
  color: var(--fgColor-danger);
  background-color: var(--bgColor-danger-muted);
}

.markdown-body .pl-c2 {
  color: #f6f8fa;
  background-color: #cf222e;
}

.markdown-body .pl-sr .pl-cce {
  font-weight: bold;
  color: #116329;
}

.markdown-body .pl-ml {
  color: #3b2300;
}

.markdown-body .pl-mh,
.markdown-body .pl-mh .pl-en,
.markdown-body .pl-ms {
  font-weight: bold;
  color: #0550ae;
}

.markdown-body .pl-mi {
  font-style: italic;
  color: #1f2328;
}

.markdown-body .pl-mb {
  font-weight: bold;
  color: #1f2328;
}

.markdown-body .pl-md {
  color: #82071e;
  background-color: #ffebe9;
}

.markdown-body .pl-mi1 {
  color: #116329;
  background-color: #dafbe1;
}

.markdown-body .pl-mc {
  color: #953800;
  background-color: #ffd8b5;
}

.markdown-body .pl-mi2 {
  color: #d1d9e0;
  background-color: #0550ae;
}

.markdown-body .pl-mdr {
  font-weight: bold;
  color: #8250df;
}

.markdown-body .pl-ba {
  color: #59636e;
}

.markdown-body .pl-sg {
  color: #818b98;
}

.markdown-body .pl-corl {
  text-decoration: underline;
  color: #0a3069;
}

.markdown-body [role=button]:focus:not(:focus-visible),
.markdown-body [role=tabpanel][tabindex="0"]:focus:not(:focus-visible),
.markdown-body button:focus:not(:focus-visible),
.markdown-body summary:focus:not(:focus-visible),
.markdown-body a:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.markdown-body [tabindex="0"]:focus:not(:focus-visible),
.markdown-body details-dialog:focus:not(:focus-visible) {
  outline: none;
}

.markdown-body g-emoji {
  display: inline-block;
  min-width: 1ch;
  font-family: "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: 1em;
  font-style: normal !important;
  font-weight: 400;
  line-height: 1;
  vertical-align: -0.075em;
}

.markdown-body g-emoji img {
  width: 1em;
  height: 1em;
}

.markdown-body a:has(>p,>div,>pre,>blockquote) {
  display: block;
}

.markdown-body a:has(>p,>div,>pre,>blockquote):not(:has(.snippet-clipboard-content,>pre)) {
  width: fit-content;
}

.markdown-body a:has(>p,>div,>pre,>blockquote):has(.snippet-clipboard-content,>pre):focus-visible {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: 2px;
}

.markdown-body .task-list-item {
  list-style-type: none;
}

.markdown-body .task-list-item label {
  font-weight: 400;
}

.markdown-body .task-list-item.enabled label {
  cursor: pointer;
}

.markdown-body .task-list-item+.task-list-item {
  margin-top: 0.25rem;
}

.markdown-body .task-list-item .handle {
  display: none;
}

.markdown-body .task-list-item-checkbox {
  margin: 0 .2em .25em -1.4em;
  vertical-align: middle;
}

.markdown-body ul:dir(rtl) .task-list-item-checkbox {
  margin: 0 -1.6em .25em .2em;
}

.markdown-body ol:dir(rtl) .task-list-item-checkbox {
  margin: 0 -1.6em .25em .2em;
}

.markdown-body .contains-task-list:hover .task-list-item-convert-container,
.markdown-body .contains-task-list:focus-within .task-list-item-convert-container {
  display: block;
  width: auto;
  height: 24px;
  overflow: visible;
  clip-path: none;
}

.markdown-body ::-webkit-calendar-picker-indicator {
  filter: invert(50%);
}

.markdown-body .markdown-alert {
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  color: inherit;
  border-left: .25em solid #d1d9e0;
}

.markdown-body .markdown-alert>:first-child {
  margin-top: 0;
}

.markdown-body .markdown-alert>:last-child {
  margin-bottom: 0;
}

.markdown-body .markdown-alert .markdown-alert-title {
  display: flex;
  font-weight: 500;
  align-items: center;
  line-height: 1;
}

.markdown-body .markdown-alert.markdown-alert-note {
  border-left-color: #0969da;
}

.markdown-body .markdown-alert.markdown-alert-note .markdown-alert-title {
  color: #0969da;
}

.markdown-body .markdown-alert.markdown-alert-important {
  border-left-color: #8250df;
}

.markdown-body .markdown-alert.markdown-alert-important .markdown-alert-title {
  color: #8250df;
}

.markdown-body .markdown-alert.markdown-alert-warning {
  border-left-color: #9a6700;
}

.markdown-body .markdown-alert.markdown-alert-warning .markdown-alert-title {
  color: #9a6700;
}

.markdown-body .markdown-alert.markdown-alert-tip {
  border-left-color: #1a7f37;
}

.markdown-body .markdown-alert.markdown-alert-tip .markdown-alert-title {
  color: #1a7f37;
}

.markdown-body .markdown-alert.markdown-alert-caution {
  border-left-color: #cf222e;
}

.markdown-body .markdown-alert.markdown-alert-caution .markdown-alert-title {
  color: #d1242f;
}

.markdown-body>*:first-child>.heading-element:first-child {
  margin-top: 0 !important;
}

.markdown-body .highlight pre:has(+.zeroclipboard-container) {
  min-height: 52px;
}

`;var Jo=`/*dark */
.markdown-body {
  color-scheme: dark;
  /** CSS default easing. Use for hover state changes and micro-interactions. */
  /** Accelerating motion. Use for elements exiting the viewport (moving off-screen). */
  /** Smooth acceleration and deceleration. Use for elements moving or morphing within the viewport. */
  /** Decelerating motion. Use for elements entering the viewport or appearing on screen. */
  /** Constant motion with no acceleration. Use for continuous animations like progress bars or loaders. */
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  font-weight: 400;
  color: #f0f6fc;
  background-color: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body a {
  text-decoration: underline;
  text-underline-offset: .2rem;
}

.markdown-body .octicon {
  display: inline-block;
  fill: currentColor;
  vertical-align: text-bottom;
}

.markdown-body h1:hover .anchor .octicon-link:before,
.markdown-body h2:hover .anchor .octicon-link:before,
.markdown-body h3:hover .anchor .octicon-link:before,
.markdown-body h4:hover .anchor .octicon-link:before,
.markdown-body h5:hover .anchor .octicon-link:before,
.markdown-body h6:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
  mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");
}

.markdown-body details,
.markdown-body figcaption,
.markdown-body figure {
  display: block;
}

.markdown-body summary {
  display: list-item;
}

.markdown-body [hidden] {
  display: none !important;
}

.markdown-body a {
  background-color: rgba(0,0,0,0);
  color: #4493f8;
  text-decoration: none;
}

.markdown-body abbr[title] {
  border-bottom: none;
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

.markdown-body b,
.markdown-body strong {
  font-weight: 600;
}

.markdown-body dfn {
  font-style: italic;
}

.markdown-body h1 {
  margin: .67em 0;
  font-weight: 600;
  padding-bottom: .3em;
  font-size: 2em;
  border-bottom: 1px solid #3d444db3;
}

.markdown-body mark {
  background-color: #bb800926;
  color: #f0f6fc;
}

.markdown-body small {
  font-size: 90%;
}

.markdown-body sub,
.markdown-body sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.markdown-body sub {
  bottom: -0.25em;
}

.markdown-body sup {
  top: -0.5em;
}

.markdown-body img {
  border-style: none;
  max-width: 100%;
  box-sizing: content-box;
}

.markdown-body code,
.markdown-body kbd,
.markdown-body pre,
.markdown-body samp {
  font-family: monospace;
  font-size: 1em;
}

.markdown-body figure {
  margin: 1em 2.5rem;
}

.markdown-body hr {
  box-sizing: content-box;
  overflow: hidden;
  background: rgba(0,0,0,0);
  border-bottom: 1px solid #3d444db3;
  height: .25em;
  padding: 0;
  margin: 1.5rem 0;
  background-color: #3d444d;
  border: 0;
}

.markdown-body input {
  font: inherit;
  margin: 0;
  overflow: visible;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.markdown-body [type=button],
.markdown-body [type=reset],
.markdown-body [type=submit] {
  -webkit-appearance: button;
  appearance: button;
}

.markdown-body [type=checkbox],
.markdown-body [type=radio] {
  box-sizing: border-box;
  padding: 0;
}

.markdown-body [type=number]::-webkit-inner-spin-button,
.markdown-body [type=number]::-webkit-outer-spin-button {
  height: auto;
}

.markdown-body [type=search]::-webkit-search-cancel-button,
.markdown-body [type=search]::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.markdown-body ::-webkit-input-placeholder {
  color: inherit;
  opacity: .54;
}

.markdown-body ::-webkit-file-upload-button {
  -webkit-appearance: button;
  appearance: button;
  font: inherit;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ::placeholder {
  color: #9198a1;
  opacity: 1;
}

.markdown-body hr::before {
  display: table;
  content: "";
}

.markdown-body hr::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  font-variant: tabular-nums;
}

.markdown-body td,
.markdown-body th {
  padding: 0;
}

.markdown-body details summary {
  cursor: pointer;
}

.markdown-body a:focus,
.markdown-body [role=button]:focus,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=checkbox]:focus {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:focus:not(:focus-visible),
.markdown-body [role=button]:focus:not(:focus-visible),
.markdown-body input[type=radio]:focus:not(:focus-visible),
.markdown-body input[type=checkbox]:focus:not(:focus-visible) {
  outline: solid 1px rgba(0,0,0,0);
}

.markdown-body a:focus-visible,
.markdown-body [role=button]:focus-visible,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus-visible {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -2px;
  box-shadow: none;
}

.markdown-body a:not([class]):focus,
.markdown-body a:not([class]):focus-visible,
.markdown-body input[type=radio]:focus,
.markdown-body input[type=radio]:focus-visible,
.markdown-body input[type=checkbox]:focus,
.markdown-body input[type=checkbox]:focus-visible {
  outline-offset: 0;
}

.markdown-body kbd {
  display: inline-block;
  padding: 0.25rem;
  font: 11px ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  line-height: 10px;
  color: #f0f6fc;
  vertical-align: middle;
  background-color: #151b23;
  border: solid 1px var(--borderColor-muted);
  border-bottom-color: var(--borderColor-muted);
  border-radius: 6px;
  box-shadow: inset 0 -1px 0 var(--borderColor-muted);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h2 {
  font-weight: 600;
  padding-bottom: .3em;
  font-size: 1.5em;
  border-bottom: 1px solid #3d444db3;
}

.markdown-body h3 {
  font-weight: 600;
  font-size: 1.25em;
}

.markdown-body h4 {
  font-weight: 600;
  font-size: 1em;
}

.markdown-body h5 {
  font-weight: 600;
  font-size: .875em;
}

.markdown-body h6 {
  font-weight: 600;
  font-size: .85em;
  color: #9198a1;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: #9198a1;
  border-left: .25em solid #3d444d;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 2em;
}

.markdown-body ol ol,
.markdown-body ul ol {
  list-style-type: lower-roman;
}

.markdown-body ul ul ol,
.markdown-body ul ol ol,
.markdown-body ol ul ol,
.markdown-body ol ol ol {
  list-style-type: lower-alpha;
}

.markdown-body dd {
  margin-left: 0;
}

.markdown-body tt,
.markdown-body code,
.markdown-body samp {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 12px;
}

.markdown-body pre {
  margin-top: 0;
  margin-bottom: 0;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 12px;
  word-wrap: normal;
}

.markdown-body .octicon {
  display: inline-block;
  overflow: visible !important;
  vertical-align: text-bottom;
  fill: currentColor;
}

.markdown-body input::-webkit-outer-spin-button,
.markdown-body input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.markdown-body .mr-2 {
  margin-right: 0.5rem !important;
}

.markdown-body::before {
  display: table;
  content: "";
}

.markdown-body::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body>*:first-child {
  margin-top: 0 !important;
}

.markdown-body>*:last-child {
  margin-bottom: 0 !important;
}

.markdown-body a:not([href]) {
  color: inherit;
  text-decoration: none;
}

.markdown-body .absent {
  color: #f85149;
}

.markdown-body .anchor {
  float: left;
  padding-right: 0.25rem;
  margin-left: -20px;
  line-height: 1;
}

.markdown-body .anchor:focus {
  outline: none;
}

.markdown-body p,
.markdown-body blockquote,
.markdown-body ul,
.markdown-body ol,
.markdown-body dl,
.markdown-body table,
.markdown-body pre,
.markdown-body details {
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-body blockquote>:first-child {
  margin-top: 0;
}

.markdown-body blockquote>:last-child {
  margin-bottom: 0;
}

.markdown-body h1 .octicon-link,
.markdown-body h2 .octicon-link,
.markdown-body h3 .octicon-link,
.markdown-body h4 .octicon-link,
.markdown-body h5 .octicon-link,
.markdown-body h6 .octicon-link {
  color: #f0f6fc;
  vertical-align: middle;
  visibility: hidden;
}

.markdown-body h1:hover .anchor,
.markdown-body h2:hover .anchor,
.markdown-body h3:hover .anchor,
.markdown-body h4:hover .anchor,
.markdown-body h5:hover .anchor,
.markdown-body h6:hover .anchor {
  text-decoration: none;
}

.markdown-body h1:hover .anchor .octicon-link,
.markdown-body h2:hover .anchor .octicon-link,
.markdown-body h3:hover .anchor .octicon-link,
.markdown-body h4:hover .anchor .octicon-link,
.markdown-body h5:hover .anchor .octicon-link,
.markdown-body h6:hover .anchor .octicon-link {
  visibility: visible;
}

.markdown-body h1 tt,
.markdown-body h1 code,
.markdown-body h2 tt,
.markdown-body h2 code,
.markdown-body h3 tt,
.markdown-body h3 code,
.markdown-body h4 tt,
.markdown-body h4 code,
.markdown-body h5 tt,
.markdown-body h5 code,
.markdown-body h6 tt,
.markdown-body h6 code {
  padding: 0 .2em;
  font-size: inherit;
}

.markdown-body summary h1,
.markdown-body summary h2,
.markdown-body summary h3,
.markdown-body summary h4,
.markdown-body summary h5,
.markdown-body summary h6 {
  display: inline-block;
}

.markdown-body summary h1 .anchor,
.markdown-body summary h2 .anchor,
.markdown-body summary h3 .anchor,
.markdown-body summary h4 .anchor,
.markdown-body summary h5 .anchor,
.markdown-body summary h6 .anchor {
  margin-left: -40px;
}

.markdown-body summary h1,
.markdown-body summary h2 {
  padding-bottom: 0;
  border-bottom: 0;
}

.markdown-body ul.no-list,
.markdown-body ol.no-list {
  padding: 0;
  list-style-type: none;
}

.markdown-body ol[type="a s"] {
  list-style-type: lower-alpha;
}

.markdown-body ol[type="A s"] {
  list-style-type: upper-alpha;
}

.markdown-body ol[type="i s"] {
  list-style-type: lower-roman;
}

.markdown-body ol[type="I s"] {
  list-style-type: upper-roman;
}

.markdown-body ol[type="1"] {
  list-style-type: decimal;
}

.markdown-body div>ol:not([type]) {
  list-style-type: decimal;
}

.markdown-body ul ul,
.markdown-body ul ol,
.markdown-body ol ol,
.markdown-body ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body li>p {
  margin-top: 1rem;
}

.markdown-body li+li {
  margin-top: .25em;
}

.markdown-body dl {
  padding: 0;
}

.markdown-body dl dt {
  padding: 0;
  margin-top: 1rem;
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
}

.markdown-body dl dd {
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.markdown-body table th {
  font-weight: 600;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #3d444d;
}

.markdown-body table td>:last-child {
  margin-bottom: 0;
}

.markdown-body table tr {
  background-color: #0d1117;
  border-top: 1px solid #3d444db3;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #151b23;
}

.markdown-body table img {
  background-color: rgba(0,0,0,0);
}

.markdown-body img[align=right] {
  padding-left: 20px;
}

.markdown-body img[align=left] {
  padding-right: 20px;
}

.markdown-body .emoji {
  max-width: none;
  vertical-align: text-top;
  background-color: rgba(0,0,0,0);
}

.markdown-body span.frame {
  display: block;
  overflow: hidden;
}

.markdown-body span.frame>span {
  display: block;
  float: left;
  width: auto;
  padding: 7px;
  margin: 13px 0 0;
  overflow: hidden;
  border: 1px solid #3d444d;
}

.markdown-body span.frame span img {
  display: block;
  float: left;
}

.markdown-body span.frame span span {
  display: block;
  padding: 5px 0 0;
  clear: both;
  color: #f0f6fc;
}

.markdown-body span.align-center {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-center>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: center;
}

.markdown-body span.align-center span img {
  margin: 0 auto;
  text-align: center;
}

.markdown-body span.align-right {
  display: block;
  overflow: hidden;
  clear: both;
}

.markdown-body span.align-right>span {
  display: block;
  margin: 13px 0 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body span.align-right span img {
  margin: 0;
  text-align: right;
}

.markdown-body span.float-left {
  display: block;
  float: left;
  margin-right: 13px;
  overflow: hidden;
}

.markdown-body span.float-left span {
  margin: 13px 0 0;
}

.markdown-body span.float-right {
  display: block;
  float: right;
  margin-left: 13px;
  overflow: hidden;
}

.markdown-body span.float-right>span {
  display: block;
  margin: 13px auto 0;
  overflow: hidden;
  text-align: right;
}

.markdown-body code,
.markdown-body tt {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: #656c7633;
  border-radius: 6px;
}

.markdown-body code br,
.markdown-body tt br {
  display: none;
}

.markdown-body del code {
  text-decoration: inherit;
}

.markdown-body samp {
  font-size: 85%;
}

.markdown-body pre code {
  font-size: 100%;
}

.markdown-body pre>code {
  padding: 0;
  margin: 0;
  word-break: normal;
  white-space: pre;
  background: rgba(0,0,0,0);
  border: 0;
}

.markdown-body .highlight {
  margin-bottom: 1rem;
}

.markdown-body .highlight pre {
  margin-bottom: 0;
  word-break: normal;
}

.markdown-body .highlight pre,
.markdown-body pre {
  padding: 1rem;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  color: #f0f6fc;
  background-color: #151b23;
  border-radius: 6px;
}

.markdown-body pre code,
.markdown-body pre tt {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: rgba(0,0,0,0);
  border: 0;
}

.markdown-body .csv-data td,
.markdown-body .csv-data th {
  padding: 5px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.markdown-body .csv-data .blob-num {
  padding: 10px 0.5rem 9px;
  text-align: right;
  background: #0d1117;
  border: 0;
}

.markdown-body .csv-data tr {
  border-top: 0;
}

.markdown-body .csv-data th {
  font-weight: 600;
  background: #151b23;
  border-top: 0;
}

.markdown-body [data-footnote-ref]::before {
  content: "[";
}

.markdown-body [data-footnote-ref]::after {
  content: "]";
}

.markdown-body .footnotes {
  font-size: 12px;
  color: #9198a1;
  border-top: 1px solid #3d444d;
}

.markdown-body .footnotes ol {
  padding-left: 1rem;
}

.markdown-body .footnotes ol ul {
  display: inline-block;
  padding-left: 1rem;
  margin-top: 1rem;
}

.markdown-body .footnotes li {
  position: relative;
}

.markdown-body .footnotes li:target::before {
  position: absolute;
  top: calc(0.5rem*-1);
  right: calc(0.5rem*-1);
  bottom: calc(0.5rem*-1);
  left: calc(1.5rem*-1);
  pointer-events: none;
  content: "";
  border: 2px solid #1f6feb;
  border-radius: 6px;
}

.markdown-body .footnotes li:target {
  color: #f0f6fc;
}

.markdown-body .footnotes .data-footnote-backref g-emoji {
  font-family: monospace;
}

.markdown-body .pl-c {
  color: #9198a1;
}

.markdown-body .pl-c1,
.markdown-body .pl-s .pl-v {
  color: #79c0ff;
}

.markdown-body .pl-e,
.markdown-body .pl-en {
  color: #d2a8ff;
}

.markdown-body .pl-smi,
.markdown-body .pl-s .pl-s1 {
  color: #f0f6fc;
}

.markdown-body .pl-ent {
  color: #7ee787;
}

.markdown-body .pl-k {
  color: #ff7b72;
}

.markdown-body .pl-s,
.markdown-body .pl-pds,
.markdown-body .pl-s .pl-pse .pl-s1,
.markdown-body .pl-sr,
.markdown-body .pl-sr .pl-cce,
.markdown-body .pl-sr .pl-sre,
.markdown-body .pl-sr .pl-sra {
  color: #a5d6ff;
}

.markdown-body .pl-v,
.markdown-body .pl-smw {
  color: #ffa657;
}

.markdown-body .pl-bu {
  color: #f85149;
}

.markdown-body .pl-ii {
  color: var(--fgColor-danger);
  background-color: var(--bgColor-danger-muted);
}

.markdown-body .pl-c2 {
  color: #f0f6fc;
  background-color: #b62324;
}

.markdown-body .pl-sr .pl-cce {
  font-weight: bold;
  color: #7ee787;
}

.markdown-body .pl-ml {
  color: #f2cc60;
}

.markdown-body .pl-mh,
.markdown-body .pl-mh .pl-en,
.markdown-body .pl-ms {
  font-weight: bold;
  color: #1f6feb;
}

.markdown-body .pl-mi {
  font-style: italic;
  color: #f0f6fc;
}

.markdown-body .pl-mb {
  font-weight: bold;
  color: #f0f6fc;
}

.markdown-body .pl-md {
  color: #ffdcd7;
  background-color: #67060c;
}

.markdown-body .pl-mi1 {
  color: #aff5b4;
  background-color: #033a16;
}

.markdown-body .pl-mc {
  color: #ffdfb6;
  background-color: #5a1e02;
}

.markdown-body .pl-mi2 {
  color: #f0f6fc;
  background-color: #1158c7;
}

.markdown-body .pl-mdr {
  font-weight: bold;
  color: #d2a8ff;
}

.markdown-body .pl-ba {
  color: #9198a1;
}

.markdown-body .pl-sg {
  color: #3d444d;
}

.markdown-body .pl-corl {
  text-decoration: underline;
  color: #a5d6ff;
}

.markdown-body [role=button]:focus:not(:focus-visible),
.markdown-body [role=tabpanel][tabindex="0"]:focus:not(:focus-visible),
.markdown-body button:focus:not(:focus-visible),
.markdown-body summary:focus:not(:focus-visible),
.markdown-body a:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.markdown-body [tabindex="0"]:focus:not(:focus-visible),
.markdown-body details-dialog:focus:not(:focus-visible) {
  outline: none;
}

.markdown-body g-emoji {
  display: inline-block;
  min-width: 1ch;
  font-family: "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: 1em;
  font-style: normal !important;
  font-weight: 400;
  line-height: 1;
  vertical-align: -0.075em;
}

.markdown-body g-emoji img {
  width: 1em;
  height: 1em;
}

.markdown-body a:has(>p,>div,>pre,>blockquote) {
  display: block;
}

.markdown-body a:has(>p,>div,>pre,>blockquote):not(:has(.snippet-clipboard-content,>pre)) {
  width: fit-content;
}

.markdown-body a:has(>p,>div,>pre,>blockquote):has(.snippet-clipboard-content,>pre):focus-visible {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: 2px;
}

.markdown-body .task-list-item {
  list-style-type: none;
}

.markdown-body .task-list-item label {
  font-weight: 400;
}

.markdown-body .task-list-item.enabled label {
  cursor: pointer;
}

.markdown-body .task-list-item+.task-list-item {
  margin-top: 0.25rem;
}

.markdown-body .task-list-item .handle {
  display: none;
}

.markdown-body .task-list-item-checkbox {
  margin: 0 .2em .25em -1.4em;
  vertical-align: middle;
}

.markdown-body ul:dir(rtl) .task-list-item-checkbox {
  margin: 0 -1.6em .25em .2em;
}

.markdown-body ol:dir(rtl) .task-list-item-checkbox {
  margin: 0 -1.6em .25em .2em;
}

.markdown-body .contains-task-list:hover .task-list-item-convert-container,
.markdown-body .contains-task-list:focus-within .task-list-item-convert-container {
  display: block;
  width: auto;
  height: 24px;
  overflow: visible;
  clip-path: none;
}

.markdown-body ::-webkit-calendar-picker-indicator {
  filter: invert(50%);
}

.markdown-body .markdown-alert {
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  color: inherit;
  border-left: .25em solid #3d444d;
}

.markdown-body .markdown-alert>:first-child {
  margin-top: 0;
}

.markdown-body .markdown-alert>:last-child {
  margin-bottom: 0;
}

.markdown-body .markdown-alert .markdown-alert-title {
  display: flex;
  font-weight: 500;
  align-items: center;
  line-height: 1;
}

.markdown-body .markdown-alert.markdown-alert-note {
  border-left-color: #1f6feb;
}

.markdown-body .markdown-alert.markdown-alert-note .markdown-alert-title {
  color: #4493f8;
}

.markdown-body .markdown-alert.markdown-alert-important {
  border-left-color: #8957e5;
}

.markdown-body .markdown-alert.markdown-alert-important .markdown-alert-title {
  color: #ab7df8;
}

.markdown-body .markdown-alert.markdown-alert-warning {
  border-left-color: #9e6a03;
}

.markdown-body .markdown-alert.markdown-alert-warning .markdown-alert-title {
  color: #d29922;
}

.markdown-body .markdown-alert.markdown-alert-tip {
  border-left-color: #238636;
}

.markdown-body .markdown-alert.markdown-alert-tip .markdown-alert-title {
  color: #3fb950;
}

.markdown-body .markdown-alert.markdown-alert-caution {
  border-left-color: #da3633;
}

.markdown-body .markdown-alert.markdown-alert-caution .markdown-alert-title {
  color: #f85149;
}

.markdown-body>*:first-child>.heading-element:first-child {
  margin-top: 0 !important;
}

.markdown-body .highlight pre:has(+.zeroclipboard-container) {
  min-height: 52px;
}

`;var Ft="unichat_widget_source_id",Ht="unichat_widget_conversation_id",Jr="unichat_widget_inbox",Ue=[],ei=Jo.replace(/\.markdown-body/g,"#unichat-widget .uw-msg.contact .markdown-body");_.setOptions({breaks:!0,gfm:!0,headerIds:!1,mangle:!1});var ti={ALLOWED_TAGS:["p","em","strong","code","pre","ul","ol","li","a","blockquote","hr","br","h1","h2","h3","h4","h5","h6","img","table","thead","tbody","tr","th","td","del","span","div"],ALLOWED_ATTR:["href","alt","src","class","loading","referrerpolicy","title"],ALLOW_DATA_ATTR:!1},en=!1;function oi(){en||(Bt.addHook("afterSanitizeAttributes",function(t){t.tagName==="A"&&(t.setAttribute("target","_blank"),t.setAttribute("rel","noopener noreferrer")),t.tagName==="IMG"&&(t.setAttribute("loading","lazy"),t.setAttribute("referrerpolicy","no-referrer"))}),en=!0)}function on(t){if(!t)return"";oi();var e=_.parse(t,{async:!1});return Bt.sanitize(e,ti)}function ni(){return crypto&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=Math.random()*16|0;return(t==="x"?e:e&3|8).toString(16)})}function ri(){var t=localStorage.getItem(Ft);return t||(t=ni(),localStorage.setItem(Ft,t)),t}function ii(t){if(!document.getElementById("unichat-widget-styles")){var e=document.createElement("style");e.id="unichat-widget-styles",e.textContent=t,document.head.appendChild(e)}}function nn(){return'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'}function rn(){return'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}function ai(){return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'}var si=["#unichat-widget * { box-sizing:border-box; margin:0; padding:0; }","#unichat-widget {","  font-family: var(--widget-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);","  position: fixed;","  bottom: var(--widget-position-bottom, 20px);","  right: var(--widget-position-right, 20px);","  z-index: 2147483645;","  --uw-primary: var(--widget-primary-color, #4F46E5);","  --uw-primary-dark: color-mix(in srgb, var(--uw-primary) 85%, #000);","  --uw-radius: 16px;","}","#unichat-widget .uw-btn {","  width: 58px; height: 58px; border-radius: 50%;","  background: var(--uw-primary);","  border: none; cursor: pointer;","  display: flex; align-items: center; justify-content: center;","  box-shadow: 0 6px 20px -4px color-mix(in srgb, var(--uw-primary) 50%, transparent),","              0 2px 8px rgba(0,0,0,0.08);","  transition: transform 0.15s ease, box-shadow 0.15s ease;","}","#unichat-widget .uw-btn:hover {","  transform: translateY(-2px);","  box-shadow: 0 10px 28px -4px color-mix(in srgb, var(--uw-primary) 55%, transparent),","              0 4px 12px rgba(0,0,0,0.1);","}","#unichat-widget .uw-btn:active { transform: translateY(0) scale(0.96); }","#unichat-widget .uw-panel {","  position: absolute; bottom: 70px; right: 0;","  width: 360px; height: 520px;","  background: #fff; border-radius: var(--uw-radius);","  box-shadow: 0 24px 60px -12px rgba(0,0,0,0.18),","              0 8px 24px -8px rgba(0,0,0,0.1);","  display: none; flex-direction: column; overflow: hidden;","  animation: uw-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);","}","@keyframes uw-slide-up {","  from { opacity:0; transform:translateY(12px) scale(0.98); }","  to { opacity:1; transform:translateY(0) scale(1); }","}","@media (max-width:480px) {","  #unichat-widget .uw-panel {","    position: fixed; top: 0; left: 0;","    width: 100%; height: 100vh; border-radius: 0;","  }","  @supports (height: 100dvh) {","    #unichat-widget .uw-panel { height: 100dvh; }","  }","  #unichat-widget .uw-panel.uw-vv-active {","    top: var(--uw-vv-top, 0px);","    height: var(--uw-vv-height, 100vh);","  }","}","#unichat-widget .uw-header {","  background: var(--uw-primary);","  color: #fff; padding: 18px 20px; display: flex;","  align-items: center; justify-content: space-between; flex-shrink: 0;","}","#unichat-widget .uw-header h3 { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }","#unichat-widget .uw-close {","  background: rgba(255,255,255,0.15); border: none; color: #fff;","  cursor: pointer; opacity: 0.9; padding: 6px; line-height: 0;","  border-radius: 8px; transition: background 0.15s;","}","#unichat-widget .uw-close:hover { background: rgba(255,255,255,0.25); opacity: 1; }","#unichat-widget .uw-messages {","  flex: 1; overflow-y: auto; padding: 20px 16px;","  display: flex; flex-direction: column; gap: 10px;","  background: #FAFAFA;","  -webkit-overflow-scrolling: touch;","}","#unichat-widget .uw-messages::-webkit-scrollbar { width: 5px; }","#unichat-widget .uw-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }","#unichat-widget .uw-msg {","  max-width: 82%; padding: 10px 14px; border-radius: 16px;","  font-size: 14px; line-height: 1.5; word-wrap: break-word;","}","#unichat-widget .uw-msg.contact {","  align-self: flex-end;","  background: var(--uw-primary); color: #fff;","  border-bottom-right-radius: 5px;","  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);","}","#unichat-widget .uw-msg.agent {","  align-self: flex-start;","  background: #fff; color: #1F2937; border-bottom-left-radius: 5px;","  box-shadow: 0 1px 3px rgba(0,0,0,0.06);","  border: 1px solid #EEF0F2;","}","#unichat-widget .uw-input-bar {","  display: flex; align-items: flex-end; padding: 12px 14px; gap: 10px;","  border-top: 1px solid #EEF0F2; flex-shrink: 0; background: #fff;","}","#unichat-widget .uw-input {","  flex: 1; border: 1px solid #E5E7EB; border-radius: 20px;","  padding: 9px 14px; font-size: 14px; line-height: 1.4; outline: none; font-family: inherit;","  resize: none; min-height: 38px; max-height: 120px; overflow-y: auto;","  transition: border-color 0.15s, box-shadow 0.15s;","}","#unichat-widget .uw-input:focus {","  border-color: var(--uw-primary);","  box-shadow: 0 0 0 3px color-mix(in srgb, var(--uw-primary) 12%, transparent);","}","#unichat-widget .uw-input::placeholder { color: #B0B4BC; }","#unichat-widget .uw-send {","  background: var(--uw-primary);","  border: none; color: #fff; width: 38px; height: 38px;","  border-radius: 50%; cursor: pointer;","  display: flex; align-items: center; justify-content: center;","  flex-shrink: 0; transition: transform 0.15s, opacity 0.15s; line-height: 0;","  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);","}","#unichat-widget .uw-send:hover:not(:disabled) { transform: scale(1.08); }","#unichat-widget .uw-send:active:not(:disabled) { transform: scale(0.94); }","#unichat-widget .uw-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }","#unichat-widget .uw-activity {","  text-align: center; color: #9CA3AF; font-size: 12px; padding: 6px 16px;","  font-style: italic; line-height: 1.5; word-wrap: break-word;","}","#unichat-widget .uw-empty {","  text-align: center; color: #B0B4BC; font-size: 14px; padding: 48px 20px;","  line-height: 1.6;","}","@media (max-width:480px) {","  #unichat-widget .uw-input { font-size: 16px; }","}"].join(`
`),li=["#unichat-widget .uw-msg .markdown-body,","#unichat-widget .uw-activity .markdown-body {","  font-size: 14px;","  line-height: 1.5;","  color: inherit;","  background: transparent;","  font-family: inherit;","  word-wrap: break-word;","}","#unichat-widget .uw-msg .markdown-body p { margin: 0 0 6px; }","#unichat-widget .uw-msg .markdown-body p:last-child { margin-bottom: 0; }","#unichat-widget .uw-msg .markdown-body h1,","#unichat-widget .uw-msg .markdown-body h2,","#unichat-widget .uw-msg .markdown-body h3,","#unichat-widget .uw-msg .markdown-body h4,","#unichat-widget .uw-msg .markdown-body h5,","#unichat-widget .uw-msg .markdown-body h6 {","  margin: 10px 0 4px; font-weight: 600; line-height: 1.3;","}","#unichat-widget .uw-msg .markdown-body h1 { font-size: 18px; }","#unichat-widget .uw-msg .markdown-body h2 { font-size: 16px; }","#unichat-widget .uw-msg .markdown-body h3 { font-size: 15px; padding-bottom: 0.3em; }","#unichat-widget .uw-msg .markdown-body h4 { font-size: 14px; }","#unichat-widget .uw-msg .markdown-body h5,","#unichat-widget .uw-msg .markdown-body h6 { font-size: 13px; }","#unichat-widget .uw-msg .markdown-body h1:first-child,","#unichat-widget .uw-msg .markdown-body h2:first-child,","#unichat-widget .uw-msg .markdown-body h3:first-child,","#unichat-widget .uw-msg .markdown-body h4:first-child,","#unichat-widget .uw-msg .markdown-body h5:first-child,","#unichat-widget .uw-msg .markdown-body h6:first-child { margin-top: 0; }","#unichat-widget .uw-msg .markdown-body ul,","#unichat-widget .uw-msg .markdown-body ol { margin: 4px 0 6px; padding-left: 22px; }","#unichat-widget .uw-msg .markdown-body li { margin: 2px 0; }","#unichat-widget .uw-msg .markdown-body li + li { margin-top: 2px; }","#unichat-widget .uw-msg .markdown-body code {","  font-size: 12.5px; padding: 0.2em 0.4em; word-break: break-all;","}","#unichat-widget .uw-msg .markdown-body pre { margin: 6px 0; padding: 10px 12px; }","#unichat-widget .uw-msg .markdown-body pre code { font-size: 12px; }","#unichat-widget .uw-msg .markdown-body table {","  display: table; width: 100%; font-size: 13px; margin: 6px 0;","  border-collapse: separate; border-spacing: 0;","  border-radius: 8px; overflow: hidden;","}","#unichat-widget .uw-msg .markdown-body th,","#unichat-widget .uw-msg .markdown-body td {","  padding: 6px 10px; border: none;","  border-top: 1px solid rgba(127, 127, 127, 0.2);","  word-break: break-word;","}","#unichat-widget .uw-msg .markdown-body th {","  border-top: none;","  border-bottom: 1px solid rgba(127, 127, 127, 0.28);","  font-weight: 600;","}","#unichat-widget .uw-msg .markdown-body tbody tr:last-child td { border-bottom: none; }","#unichat-widget .uw-msg .markdown-body blockquote { margin: 4px 0; padding: 2px 12px; }","#unichat-widget .uw-msg .markdown-body hr { margin: 10px 0; }","#unichat-widget .uw-msg .markdown-body img { border-radius: 10px; margin: 4px 0; }","#unichat-widget .uw-msg .markdown-body a { color: inherit; word-break: break-all; }","#unichat-widget .uw-msg.contact .markdown-body {","  background: transparent; color: #fff;","  font-size: 14px; font-family: inherit; line-height: 1.5;","}","#unichat-widget .uw-msg.contact .markdown-body p,","#unichat-widget .uw-msg.contact .markdown-body h1,","#unichat-widget .uw-msg.contact .markdown-body h2,","#unichat-widget .uw-msg.contact .markdown-body h3,","#unichat-widget .uw-msg.contact .markdown-body h4,","#unichat-widget .uw-msg.contact .markdown-body h5,","#unichat-widget .uw-msg.contact .markdown-body h6,","#unichat-widget .uw-msg.contact .markdown-body li { color: #fff; }","#unichat-widget .uw-msg.contact .markdown-body blockquote { color: rgba(255,255,255,0.7); }","#unichat-widget .uw-msg.contact .markdown-body h1,","#unichat-widget .uw-msg.contact .markdown-body h2 { border-bottom-color: rgba(255,255,255,0.2); }","#unichat-widget .uw-msg.contact .markdown-body table {","  display: table; width: 100%;","  border-collapse: separate; border-spacing: 0;","  border-radius: 8px; overflow: hidden;","  border: 1px solid rgba(255,255,255,0.2);","}","#unichat-widget .uw-msg.contact .markdown-body th,","#unichat-widget .uw-msg.contact .markdown-body td { border: 1px solid rgba(255,255,255,0.2); }","#unichat-widget .uw-msg.contact .markdown-body table tr { background: rgba(0,0,0,0.2); }","#unichat-widget .uw-msg.contact .markdown-body table tr:nth-child(2n) { background: rgba(0,0,0,0.32); }","#unichat-widget .uw-msg.contact .markdown-body pre { background: rgba(0,0,0,0.3); color: #f0f6fc; }","#unichat-widget .uw-msg.contact .markdown-body code { background: rgba(255,255,255,0.13); }","#unichat-widget .uw-activity .markdown-body { font-style: italic; }","#unichat-widget .uw-activity .markdown-body p { margin: 0; }"].join(`
`);function I(t){var e=this;this.inbox=t.inbox,this.embedKey=t.embedKey,this.sourceId=ri(),this.conversationId=localStorage.getItem(Ht),this._baseUrl=t.baseUrl||"",this._eventSource=null,this._callbacks={},this._panelOpen=!1,this._sending=!1,this._destroyed=!1,this._uiReady=!1,this._historyLoaded=!1,localStorage.setItem(Jr,this.inbox),ii(si+`
`+Qo+`
`+ei+`
`+li),this._buildDOM(),this._bindEvents(),this._setupVisualViewport(),this.conversationId&&this._loadHistory().then(function(){e._subscribeSSE()}),this._uiReady=!0,this._emit("ready")}I.prototype._buildDOM=function(){var t=document.createElement("div");t.id="unichat-widget",this._btn=document.createElement("button"),this._btn.className="uw-btn",this._btn.innerHTML=nn(),this._btn.setAttribute("aria-label","Open chat"),this._panel=document.createElement("div"),this._panel.className="uw-panel";var e=document.createElement("div");e.className="uw-header",e.innerHTML="<h3>Chat</h3>",this._closeBtn=document.createElement("button"),this._closeBtn.className="uw-close",this._closeBtn.setAttribute("aria-label","Close"),this._closeBtn.innerHTML=rn(),e.appendChild(this._closeBtn),this._messagesEl=document.createElement("div"),this._messagesEl.className="uw-messages",this._emptyEl=document.createElement("div"),this._emptyEl.className="uw-empty",this._emptyEl.textContent="No messages yet",this._messagesEl.appendChild(this._emptyEl);var o=document.createElement("div");o.className="uw-input-bar",this._inputEl=document.createElement("textarea"),this._inputEl.className="uw-input",this._inputEl.rows=1,this._inputEl.placeholder="Type a message...",this._sendBtn=document.createElement("button"),this._sendBtn.className="uw-send",this._sendBtn.setAttribute("aria-label","Send"),this._sendBtn.disabled=!0,this._sendBtn.innerHTML=ai(),o.appendChild(this._inputEl),o.appendChild(this._sendBtn),this._panel.appendChild(e),this._panel.appendChild(this._messagesEl),this._panel.appendChild(o),t.appendChild(this._btn),t.appendChild(this._panel),document.body.appendChild(t)};I.prototype._bindEvents=function(){var t=this;this._btn.addEventListener("click",function(){t.toggle()}),this._closeBtn.addEventListener("click",function(){t.close()}),this._inputEl.addEventListener("input",function(){t._sendBtn.disabled=!t._inputEl.value.trim(),t._autoResize()}),this._inputEl.addEventListener("keydown",function(e){e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&(e.preventDefault(),t._doSend())}),this._sendBtn.addEventListener("click",function(){t._doSend()})};I.prototype._setupVisualViewport=function(){var t=window.visualViewport;if(t){var e=this;this._panel.classList.add("uw-vv-active"),this._onVVResize=function(){e._panel.style.setProperty("--uw-vv-height",t.height+"px"),e._panel.style.setProperty("--uw-vv-top",t.offsetTop+"px")},t.addEventListener("resize",this._onVVResize),t.addEventListener("scroll",this._onVVResize),this._onVVResize()}};I.prototype._autoResize=function(){this._inputEl.style.height="auto",this._inputEl.style.height=this._inputEl.scrollHeight+"px"};I.prototype._doSend=function(){if(!this._sending){var t=this._inputEl.value.trim();t&&(this._inputEl.value="",this._inputEl.style.height="auto",this._sendBtn.disabled=!0,this.send(t))}};I.prototype.toggle=function(){this._panelOpen?this.close():this.open()};I.prototype.open=function(){this._destroyed||(this._panelOpen=!0,this._panel.style.display="flex",this._btn.innerHTML=rn(),this._messagesEl.scrollTop=this._messagesEl.scrollHeight)};I.prototype.close=function(){this._panelOpen=!1,this._panel.style.display="none",this._btn.innerHTML=nn()};I.prototype.send=function(t){var e=this;this._sending=!0;var o=this._addMessage(t,"contact");return fetch(this._baseUrl+"/widget/"+this.inbox+"/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embed_key:this.embedKey,source_id:this.sourceId,content:t,content_type:"text"})}).then(function(n){if(!n.ok)throw new Error("Send failed: "+n.status);return n.json()}).then(function(n){n.conversation_id&&(e.conversationId=n.conversation_id,localStorage.setItem(Ht,n.conversation_id),e._subscribeSSE())}).catch(function(n){throw o&&o.parentNode&&o.parentNode.removeChild(o),e._emit("error",n),n}).finally(function(){e._sending=!1})};I.prototype._addActivity=function(t){this._emptyEl&&this._emptyEl.parentNode&&(this._emptyEl.parentNode.removeChild(this._emptyEl),this._emptyEl=null);var e=document.createElement("div");e.className="uw-activity";var o=document.createElement("div");return o.className="markdown-body",o.innerHTML=on(t),e.appendChild(o),this._messagesEl.appendChild(e),this._messagesEl.scrollTop=this._messagesEl.scrollHeight,e};I.prototype._addMessage=function(t,e){this._emptyEl&&this._emptyEl.parentNode&&(this._emptyEl.parentNode.removeChild(this._emptyEl),this._emptyEl=null);var o=document.createElement("div");o.className="uw-msg "+e;var n=document.createElement("div");return n.className="markdown-body",n.innerHTML=on(t),o.appendChild(n),this._messagesEl.appendChild(o),this._messagesEl.scrollTop=this._messagesEl.scrollHeight,o};I.prototype._loadHistory=function(){var t=this;if(!this.conversationId)return Promise.resolve();this._historyLoaded=!1;var e=this._baseUrl+"/widget/conversations/"+this.conversationId+"/messages?embed_key="+encodeURIComponent(this.embedKey);return fetch(e).then(function(o){if(!o.ok)throw new Error("History fetch failed: "+o.status);return o.json()}).then(function(o){var n=o.messages||[];n.forEach(function(i){if(i.message_type==="activity"||i.sender_type==="system")t._addActivity(i.content);else{var a=i.sender_type==="contact"?"contact":"agent";t._addMessage(i.content,a)}}),t._historyLoaded=!0}).catch(function(o){t._emit("error",o)})};I.prototype._subscribeSSE=function(){if(this.conversationId&&!this._eventSource){var t=this,e=this._baseUrl+"/widget/conversations/"+this.conversationId+"/sse?embed_key="+encodeURIComponent(this.embedKey);this._eventSource=new EventSource(e),this._eventSource.addEventListener("message",function(o){try{var n=JSON.parse(o.data);n.message_type==="activity"||n.sender_type==="system"?(t._addActivity(n.content),t._emit("message",n)):n.sender_type!=="contact"&&(t._addMessage(n.content,"agent"),t._emit("message",n))}catch(i){}}),this._eventSource.addEventListener("error",function(){})}};I.prototype._unsubscribeSSE=function(){this._eventSource&&(this._eventSource.close(),this._eventSource=null)};I.prototype.identify=function(t,e){var o=this;return!t||!e?Promise.reject(new Error("userId and userHash required")):fetch(this._baseUrl+"/widget/"+this.inbox+"/identify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embed_key:this.embedKey,source_id:this.sourceId,new_user_id:t,user_hash:e})}).then(function(n){if(!n.ok)throw new Error("Identify failed: "+n.status);return n.json()}).then(function(n){return o._unsubscribeSSE(),o.conversationId=n.conversation_id,o.sourceId=n.source_id,localStorage.setItem(Ht,n.conversation_id),localStorage.setItem(Ft,n.source_id),o._clearMessages(),o._loadHistory().then(function(){o._subscribeSSE()}),o._emit("identified",{conversation_id:n.conversation_id,source_id:n.source_id}),n}).catch(function(n){throw o._emit("error",n),n})};I.prototype._clearMessages=function(){this._messagesEl.innerHTML="",this._emptyEl=document.createElement("div"),this._emptyEl.className="uw-empty",this._emptyEl.textContent="No messages yet",this._messagesEl.appendChild(this._emptyEl)};I.prototype.on=function(t,e){this._callbacks[t]||(this._callbacks[t]=[]),this._callbacks[t].push(e)};I.prototype.destroy=function(){if(!this._destroyed){this._destroyed=!0,this._unsubscribeSSE(),this._onVVResize&&window.visualViewport&&(window.visualViewport.removeEventListener("resize",this._onVVResize),window.visualViewport.removeEventListener("scroll",this._onVVResize));var t=document.getElementById("unichat-widget");t&&t.parentNode&&t.parentNode.removeChild(t);var e=Ue.indexOf(this);if(e!==-1&&Ue.splice(e,1),Ue.length===0){var o=document.getElementById("unichat-widget-styles");o&&o.parentNode&&o.parentNode.removeChild(o)}}};I.prototype._emit=function(t,e){var o=this._callbacks[t];if(o)for(var n=0;n<o.length;n++)o[n](e)};function tn(){for(var t=document.getElementsByTagName("script"),e=0;e<t.length;e++){var o=t[e],n=o.getAttribute("data-inbox"),i=o.getAttribute("data-embed-key");if(n&&i){var a=o.getAttribute("data-base-url")||"",c=new I({inbox:n,embedKey:i,baseUrl:a});return Ue.push(c),c}}}window.UnichatWidget={init:function(t){var e=new I(t);return Ue.push(e),e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",tn):tn();})();
