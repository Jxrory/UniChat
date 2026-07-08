(()=>{var No=Object.defineProperty;var zo=(t,e,n)=>e in t?No(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var v=(t,e,n)=>zo(t,typeof e!="symbol"?e+"":e,n);function vt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var he=vt();function vn(t){he=t}var Oe={exec:()=>null};function T(t,e=""){let n=typeof t=="string"?t:t.source,o={replace:(i,a)=>{let d=typeof a=="string"?a:a.source;return d=d.replace(G.caret,"$1"),n=n.replace(i,d),o},getRegex:()=>new RegExp(n,e)};return o}var G={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}#`),htmlBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}<(?:[a-z].*>|!--)`,"i")},Do=/^(?:[ \t]*(?:\n|$))+/,Mo=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Po=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Ne=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,$o=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Et=/(?:[*+-]|\d{1,9}[.)])/,En=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Sn=T(En).replace(/bull/g,Et).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Uo=T(En).replace(/bull/g,Et).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),St=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Bo=/^[^\n]+/,At=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Fo=T(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",At).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ho=T(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Et).getRegex(),Qe="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Rt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Go=T("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Rt).replace("tag",Qe).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),An=T(St).replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex(),jo=T(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",An).getRegex(),It={blockquote:jo,code:Mo,def:Fo,fences:Po,heading:$o,hr:Ne,html:Go,lheading:Sn,list:Ho,newline:Do,paragraph:An,table:Oe,text:Bo},kn=T("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex(),qo={...It,lheading:Uo,table:kn,paragraph:T(St).replace("hr",Ne).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",kn).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Qe).getRegex()},Wo={...It,html:T(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Rt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Oe,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:T(St).replace("hr",Ne).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Sn).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Vo=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Yo=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Rn=/^( {2,}|\\)\n(?!\s*$)/,Zo=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Je=/[\p{P}\p{S}]/u,Ct=/[\s\p{P}\p{S}]/u,In=/[^\s\p{P}\p{S}]/u,Xo=T(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Ct).getRegex(),Cn=/(?!~)[\p{P}\p{S}]/u,Ko=/(?!~)[\s\p{P}\p{S}]/u,Qo=/(?:[^\s\p{P}\p{S}]|~)/u,Jo=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,Ln=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,er=T(Ln,"u").replace(/punct/g,Je).getRegex(),tr=T(Ln,"u").replace(/punct/g,Cn).getRegex(),On="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",nr=T(On,"gu").replace(/notPunctSpace/g,In).replace(/punctSpace/g,Ct).replace(/punct/g,Je).getRegex(),or=T(On,"gu").replace(/notPunctSpace/g,Qo).replace(/punctSpace/g,Ko).replace(/punct/g,Cn).getRegex(),rr=T("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,In).replace(/punctSpace/g,Ct).replace(/punct/g,Je).getRegex(),ir=T(/\\(punct)/,"gu").replace(/punct/g,Je).getRegex(),ar=T(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),sr=T(Rt).replace("(?:-->|$)","-->").getRegex(),lr=T("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",sr).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Ze=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,cr=T(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Ze).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Nn=T(/^!?\[(label)\]\[(ref)\]/).replace("label",Ze).replace("ref",At).getRegex(),zn=T(/^!?\[(ref)\](?:\[\])?/).replace("ref",At).getRegex(),dr=T("reflink|nolink(?!\\()","g").replace("reflink",Nn).replace("nolink",zn).getRegex(),Lt={_backpedal:Oe,anyPunctuation:ir,autolink:ar,blockSkip:Jo,br:Rn,code:Yo,del:Oe,emStrongLDelim:er,emStrongRDelimAst:nr,emStrongRDelimUnd:rr,escape:Vo,link:cr,nolink:zn,punctuation:Xo,reflink:Nn,reflinkSearch:dr,tag:lr,text:Zo,url:Oe},ur={...Lt,link:T(/^!?\[(label)\]\((.*?)\)/).replace("label",Ze).getRegex(),reflink:T(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Ze).getRegex()},xt={...Lt,emStrongRDelimAst:or,emStrongLDelim:tr,url:T(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},pr={...xt,br:T(Rn).replace("{2,}","*").getRegex(),text:T(xt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ve={normal:It,gfm:qo,pedantic:Wo},Ce={normal:Lt,gfm:xt,breaks:pr,pedantic:ur},hr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},yn=t=>hr[t];function K(t,e){if(e){if(G.escapeTest.test(t))return t.replace(G.escapeReplace,yn)}else if(G.escapeTestNoEncode.test(t))return t.replace(G.escapeReplaceNoEncode,yn);return t}function xn(t){try{t=encodeURI(t).replace(G.percentDecode,"%")}catch(e){return null}return t}function _n(t,e){var a;let n=t.replace(G.findPipe,(d,l,p)=>{let c=!1,u=l;for(;--u>=0&&p[u]==="\\";)c=!c;return c?"|":" |"}),o=n.split(G.splitPipe),i=0;if(o[0].trim()||o.shift(),o.length>0&&!((a=o.at(-1))!=null&&a.trim())&&o.pop(),e)if(o.length>e)o.splice(e);else for(;o.length<e;)o.push("");for(;i<o.length;i++)o[i]=o[i].trim().replace(G.slashPipe,"|");return o}function Le(t,e,n){let o=t.length;if(o===0)return"";let i=0;for(;i<o;){let a=t.charAt(o-i-1);if(a===e&&!n)i++;else if(a!==e&&n)i++;else break}return t.slice(0,o-i)}function mr(t,e){if(t.indexOf(e[1])===-1)return-1;let n=0;for(let o=0;o<t.length;o++)if(t[o]==="\\")o++;else if(t[o]===e[0])n++;else if(t[o]===e[1]&&(n--,n<0))return o;return n>0?-2:-1}function Tn(t,e,n,o,i){let a=e.href,d=e.title||null,l=t[1].replace(i.other.outputLinkReplace,"$1");o.state.inLink=!0;let p={type:t[0].charAt(0)==="!"?"image":"link",raw:n,href:a,title:d,text:l,tokens:o.inlineTokens(l)};return o.state.inLink=!1,p}function fr(t,e,n){let o=t.match(n.other.indentCodeCompensation);if(o===null)return e;let i=o[1];return e.split(`
`).map(a=>{let d=a.match(n.other.beginningSpace);if(d===null)return a;let[l]=d;return l.length>=i.length?a.slice(i.length):a}).join(`
`)}var Xe=class{constructor(t){v(this,"options");v(this,"rules");v(this,"lexer");this.options=t||he}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let n=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?n:Le(n,`
`)}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let n=e[0],o=fr(n,e[3]||"",this.rules);return{type:"code",raw:n,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:o}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let n=e[2].trim();if(this.rules.other.endingHash.test(n)){let o=Le(n,"#");(this.options.pedantic||!o||this.rules.other.endingSpaceChar.test(o))&&(n=o.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:Le(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let n=Le(e[0],`
`).split(`
`),o="",i="",a=[];for(;n.length>0;){let d=!1,l=[],p;for(p=0;p<n.length;p++)if(this.rules.other.blockquoteStart.test(n[p]))l.push(n[p]),d=!0;else if(!d)l.push(n[p]);else break;n=n.slice(p);let c=l.join(`
`),u=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");o=o?`${o}
${c}`:c,i=i?`${i}
${u}`:u;let x=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,a,!0),this.lexer.state.top=x,n.length===0)break;let f=a.at(-1);if((f==null?void 0:f.type)==="code")break;if((f==null?void 0:f.type)==="blockquote"){let N=f,y=N.raw+`
`+n.join(`
`),B=this.blockquote(y);a[a.length-1]=B,o=o.substring(0,o.length-N.raw.length)+B.raw,i=i.substring(0,i.length-N.text.length)+B.text;break}else if((f==null?void 0:f.type)==="list"){let N=f,y=N.raw+`
`+n.join(`
`),B=this.list(y);a[a.length-1]=B,o=o.substring(0,o.length-f.raw.length)+B.raw,i=i.substring(0,i.length-N.raw.length)+B.raw,n=y.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:o,tokens:a,text:i}}}list(t){let e=this.rules.block.list.exec(t);if(e){let n=e[1].trim(),o=n.length>1,i={type:"list",raw:"",ordered:o,start:o?+n.slice(0,-1):"",loose:!1,items:[]};n=o?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=o?n:"[*+-]");let a=this.rules.other.listItemRegex(n),d=!1;for(;t;){let p=!1,c="",u="";if(!(e=a.exec(t))||this.rules.block.hr.test(t))break;c=e[0],t=t.substring(c.length);let x=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,ee=>" ".repeat(3*ee.length)),f=t.split(`
`,1)[0],N=!x.trim(),y=0;if(this.options.pedantic?(y=2,u=x.trimStart()):N?y=e[1].length+1:(y=e[2].search(this.rules.other.nonSpaceChar),y=y>4?1:y,u=x.slice(y),y+=e[1].length),N&&this.rules.other.blankLine.test(f)&&(c+=f+`
`,t=t.substring(f.length+1),p=!0),!p){let ee=this.rules.other.nextBulletRegex(y),ve=this.rules.other.hrRegex(y),fe=this.rules.other.fencesBeginRegex(y),F=this.rules.other.headingBeginRegex(y),Y=this.rules.other.htmlBeginRegex(y);for(;t;){let z=t.split(`
`,1)[0],q;if(f=z,this.options.pedantic?(f=f.replace(this.rules.other.listReplaceNesting,"  "),q=f):q=f.replace(this.rules.other.tabCharGlobal,"    "),fe.test(f)||F.test(f)||Y.test(f)||ee.test(f)||ve.test(f))break;if(q.search(this.rules.other.nonSpaceChar)>=y||!f.trim())u+=`
`+q.slice(y);else{if(N||x.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||fe.test(x)||F.test(x)||ve.test(x))break;u+=`
`+f}!N&&!f.trim()&&(N=!0),c+=z+`
`,t=t.substring(z.length+1),x=q.slice(y)}}i.loose||(d?i.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(d=!0));let B=null,re;this.options.gfm&&(B=this.rules.other.listIsTask.exec(u),B&&(re=B[0]!=="[ ] ",u=u.replace(this.rules.other.listReplaceTask,""))),i.items.push({type:"list_item",raw:c,task:!!B,checked:re,loose:!1,text:u,tokens:[]}),i.raw+=c}let l=i.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let p=0;p<i.items.length;p++)if(this.lexer.state.top=!1,i.items[p].tokens=this.lexer.blockTokens(i.items[p].text,[]),!i.loose){let c=i.items[p].tokens.filter(x=>x.type==="space"),u=c.length>0&&c.some(x=>this.rules.other.anyLine.test(x.raw));i.loose=u}if(i.loose)for(let p=0;p<i.items.length;p++)i.items[p].loose=!0;return i}}html(t){let e=this.rules.block.html.exec(t);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(t){let e=this.rules.block.def.exec(t);if(e){let n=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),o=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:n,raw:e[0],href:o,title:i}}}table(t){var d;let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let n=_n(e[1]),o=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=(d=e[3])!=null&&d.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:e[0],header:[],align:[],rows:[]};if(n.length===o.length){for(let l of o)this.rules.other.tableAlignRight.test(l)?a.align.push("right"):this.rules.other.tableAlignCenter.test(l)?a.align.push("center"):this.rules.other.tableAlignLeft.test(l)?a.align.push("left"):a.align.push(null);for(let l=0;l<n.length;l++)a.header.push({text:n[l],tokens:this.lexer.inline(n[l]),header:!0,align:a.align[l]});for(let l of i)a.rows.push(_n(l,a.header.length).map((p,c)=>({text:p,tokens:this.lexer.inline(p),header:!1,align:a.align[c]})));return a}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let n=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:n,tokens:this.lexer.inline(n)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let n=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let a=Le(n.slice(0,-1),"\\");if((n.length-a.length)%2===0)return}else{let a=mr(e[2],"()");if(a===-2)return;if(a>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+a;e[2]=e[2].substring(0,a),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let o=e[2],i="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(o);a&&(o=a[1],i=a[3])}else i=e[3]?e[3].slice(1,-1):"";return o=o.trim(),this.rules.other.startAngleBracket.test(o)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?o=o.slice(1):o=o.slice(1,-1)),Tn(e,{href:o&&o.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let n;if((n=this.rules.inline.reflink.exec(t))||(n=this.rules.inline.nolink.exec(t))){let o=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=e[o.toLowerCase()];if(!i){let a=n[0].charAt(0);return{type:"text",raw:a,text:a}}return Tn(n,i,n[0],this.lexer,this.rules)}}emStrong(t,e,n=""){let o=this.rules.inline.emStrongLDelim.exec(t);if(!o||o[3]&&n.match(this.rules.other.unicodeAlphaNumeric))return;if(!(o[1]||o[2]||"")||!n||this.rules.inline.punctuation.exec(n)){let a=[...o[0]].length-1,d,l,p=a,c=0,u=o[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(u.lastIndex=0,e=e.slice(-1*t.length+a);(o=u.exec(e))!=null;){if(d=o[1]||o[2]||o[3]||o[4]||o[5]||o[6],!d)continue;if(l=[...d].length,o[3]||o[4]){p+=l;continue}else if((o[5]||o[6])&&a%3&&!((a+l)%3)){c+=l;continue}if(p-=l,p>0)continue;l=Math.min(l,l+p+c);let x=[...o[0]][0].length,f=t.slice(0,a+o.index+x+l);if(Math.min(a,l)%2){let y=f.slice(1,-1);return{type:"em",raw:f,text:y,tokens:this.lexer.inlineTokens(y)}}let N=f.slice(2,-2);return{type:"strong",raw:f,text:N,tokens:this.lexer.inlineTokens(N)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let n=e[2].replace(this.rules.other.newLineCharGlobal," "),o=this.rules.other.nonSpaceChar.test(n),i=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return o&&i&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:e[0],text:n}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t){let e=this.rules.inline.del.exec(t);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let n,o;return e[2]==="@"?(n=e[1],o="mailto:"+n):(n=e[1],o=n),{type:"link",raw:e[0],text:n,href:o,tokens:[{type:"text",raw:n,text:n}]}}}url(t){var n,o;let e;if(e=this.rules.inline.url.exec(t)){let i,a;if(e[2]==="@")i=e[0],a="mailto:"+i;else{let d;do d=e[0],e[0]=(o=(n=this.rules.inline._backpedal.exec(e[0]))==null?void 0:n[0])!=null?o:"";while(d!==e[0]);i=e[0],e[1]==="www."?a="http://"+e[0]:a=e[0]}return{type:"link",raw:e[0],text:i,href:a,tokens:[{type:"text",raw:i,text:i}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let n=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:n}}}},ne=class _t{constructor(e){v(this,"tokens");v(this,"options");v(this,"state");v(this,"tokenizer");v(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||he,this.options.tokenizer=this.options.tokenizer||new Xe,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={other:G,block:Ve.normal,inline:Ce.normal};this.options.pedantic?(n.block=Ve.pedantic,n.inline=Ce.pedantic):this.options.gfm&&(n.block=Ve.gfm,this.options.breaks?n.inline=Ce.breaks:n.inline=Ce.gfm),this.tokenizer.rules=n}static get rules(){return{block:Ve,inline:Ce}}static lex(e,n){return new _t(n).lex(e)}static lexInline(e,n){return new _t(n).inlineTokens(e)}lex(e){e=e.replace(G.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let n=0;n<this.inlineQueue.length;n++){let o=this.inlineQueue[n];this.inlineTokens(o.src,o.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,n=[],o=!1){var i,a,d;for(this.options.pedantic&&(e=e.replace(G.tabCharGlobal,"    ").replace(G.spaceLine,""));e;){let l;if((a=(i=this.options.extensions)==null?void 0:i.block)!=null&&a.some(c=>(l=c.call({lexer:this},e,n))?(e=e.substring(l.raw.length),n.push(l),!0):!1))continue;if(l=this.tokenizer.space(e)){e=e.substring(l.raw.length);let c=n.at(-1);l.raw.length===1&&c!==void 0?c.raw+=`
`:n.push(l);continue}if(l=this.tokenizer.code(e)){e=e.substring(l.raw.length);let c=n.at(-1);(c==null?void 0:c.type)==="paragraph"||(c==null?void 0:c.type)==="text"?(c.raw+=`
`+l.raw,c.text+=`
`+l.text,this.inlineQueue.at(-1).src=c.text):n.push(l);continue}if(l=this.tokenizer.fences(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.heading(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.hr(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.blockquote(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.list(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.html(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.def(e)){e=e.substring(l.raw.length);let c=n.at(-1);(c==null?void 0:c.type)==="paragraph"||(c==null?void 0:c.type)==="text"?(c.raw+=`
`+l.raw,c.text+=`
`+l.raw,this.inlineQueue.at(-1).src=c.text):this.tokens.links[l.tag]||(this.tokens.links[l.tag]={href:l.href,title:l.title});continue}if(l=this.tokenizer.table(e)){e=e.substring(l.raw.length),n.push(l);continue}if(l=this.tokenizer.lheading(e)){e=e.substring(l.raw.length),n.push(l);continue}let p=e;if((d=this.options.extensions)!=null&&d.startBlock){let c=1/0,u=e.slice(1),x;this.options.extensions.startBlock.forEach(f=>{x=f.call({lexer:this},u),typeof x=="number"&&x>=0&&(c=Math.min(c,x))}),c<1/0&&c>=0&&(p=e.substring(0,c+1))}if(this.state.top&&(l=this.tokenizer.paragraph(p))){let c=n.at(-1);o&&(c==null?void 0:c.type)==="paragraph"?(c.raw+=`
`+l.raw,c.text+=`
`+l.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=c.text):n.push(l),o=p.length!==e.length,e=e.substring(l.raw.length);continue}if(l=this.tokenizer.text(e)){e=e.substring(l.raw.length);let c=n.at(-1);(c==null?void 0:c.type)==="text"?(c.raw+=`
`+l.raw,c.text+=`
`+l.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=c.text):n.push(l);continue}if(e){let c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return this.state.top=!0,n}inline(e,n=[]){return this.inlineQueue.push({src:e,tokens:n}),n}inlineTokens(e,n=[]){var l,p,c;let o=e,i=null;if(this.tokens.links){let u=Object.keys(this.tokens.links);if(u.length>0)for(;(i=this.tokenizer.rules.inline.reflinkSearch.exec(o))!=null;)u.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(i=this.tokenizer.rules.inline.anyPunctuation.exec(o))!=null;)o=o.slice(0,i.index)+"++"+o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(i=this.tokenizer.rules.inline.blockSkip.exec(o))!=null;)o=o.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let a=!1,d="";for(;e;){a||(d=""),a=!1;let u;if((p=(l=this.options.extensions)==null?void 0:l.inline)!=null&&p.some(f=>(u=f.call({lexer:this},e,n))?(e=e.substring(u.raw.length),n.push(u),!0):!1))continue;if(u=this.tokenizer.escape(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.tag(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.link(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(u.raw.length);let f=n.at(-1);u.type==="text"&&(f==null?void 0:f.type)==="text"?(f.raw+=u.raw,f.text+=u.text):n.push(u);continue}if(u=this.tokenizer.emStrong(e,o,d)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.codespan(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.br(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.del(e)){e=e.substring(u.raw.length),n.push(u);continue}if(u=this.tokenizer.autolink(e)){e=e.substring(u.raw.length),n.push(u);continue}if(!this.state.inLink&&(u=this.tokenizer.url(e))){e=e.substring(u.raw.length),n.push(u);continue}let x=e;if((c=this.options.extensions)!=null&&c.startInline){let f=1/0,N=e.slice(1),y;this.options.extensions.startInline.forEach(B=>{y=B.call({lexer:this},N),typeof y=="number"&&y>=0&&(f=Math.min(f,y))}),f<1/0&&f>=0&&(x=e.substring(0,f+1))}if(u=this.tokenizer.inlineText(x)){e=e.substring(u.raw.length),u.raw.slice(-1)!=="_"&&(d=u.raw.slice(-1)),a=!0;let f=n.at(-1);(f==null?void 0:f.type)==="text"?(f.raw+=u.raw,f.text+=u.text):n.push(u);continue}if(e){let f="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(f);break}else throw new Error(f)}}return n}},Ke=class{constructor(t){v(this,"options");v(this,"parser");this.options=t||he}space(t){return""}code({text:t,lang:e,escaped:n}){var a;let o=(a=(e||"").match(G.notSpaceStart))==null?void 0:a[0],i=t.replace(G.endingNewline,"")+`
`;return o?'<pre><code class="language-'+K(o)+'">'+(n?i:K(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:K(i,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,n=t.start,o="";for(let d=0;d<t.items.length;d++){let l=t.items[d];o+=this.listitem(l)}let i=e?"ol":"ul",a=e&&n!==1?' start="'+n+'"':"";return"<"+i+a+`>
`+o+"</"+i+`>
`}listitem(t){var n;let e="";if(t.task){let o=this.checkbox({checked:!!t.checked});t.loose?((n=t.tokens[0])==null?void 0:n.type)==="paragraph"?(t.tokens[0].text=o+" "+t.tokens[0].text,t.tokens[0].tokens&&t.tokens[0].tokens.length>0&&t.tokens[0].tokens[0].type==="text"&&(t.tokens[0].tokens[0].text=o+" "+K(t.tokens[0].tokens[0].text),t.tokens[0].tokens[0].escaped=!0)):t.tokens.unshift({type:"text",raw:o+" ",text:o+" ",escaped:!0}):e+=o+" "}return e+=this.parser.parse(t.tokens,!!t.loose),`<li>${e}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",n="";for(let i=0;i<t.header.length;i++)n+=this.tablecell(t.header[i]);e+=this.tablerow({text:n});let o="";for(let i=0;i<t.rows.length;i++){let a=t.rows[i];n="";for(let d=0;d<a.length;d++)n+=this.tablecell(a[d]);o+=this.tablerow({text:n})}return o&&(o=`<tbody>${o}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+o+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),n=t.header?"th":"td";return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${K(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:n}){let o=this.parser.parseInline(n),i=xn(t);if(i===null)return o;t=i;let a='<a href="'+t+'"';return e&&(a+=' title="'+K(e)+'"'),a+=">"+o+"</a>",a}image({href:t,title:e,text:n,tokens:o}){o&&(n=this.parser.parseInline(o,this.parser.textRenderer));let i=xn(t);if(i===null)return K(n);t=i;let a=`<img src="${t}" alt="${n}"`;return e&&(a+=` title="${K(e)}"`),a+=">",a}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:K(t.text)}},Ot=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}},oe=class Tt{constructor(e){v(this,"options");v(this,"renderer");v(this,"textRenderer");this.options=e||he,this.options.renderer=this.options.renderer||new Ke,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Ot}static parse(e,n){return new Tt(n).parse(e)}static parseInline(e,n){return new Tt(n).parseInline(e)}parse(e,n=!0){var i,a;let o="";for(let d=0;d<e.length;d++){let l=e[d];if((a=(i=this.options.extensions)==null?void 0:i.renderers)!=null&&a[l.type]){let c=l,u=this.options.extensions.renderers[c.type].call({parser:this},c);if(u!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(c.type)){o+=u||"";continue}}let p=l;switch(p.type){case"space":{o+=this.renderer.space(p);continue}case"hr":{o+=this.renderer.hr(p);continue}case"heading":{o+=this.renderer.heading(p);continue}case"code":{o+=this.renderer.code(p);continue}case"table":{o+=this.renderer.table(p);continue}case"blockquote":{o+=this.renderer.blockquote(p);continue}case"list":{o+=this.renderer.list(p);continue}case"html":{o+=this.renderer.html(p);continue}case"paragraph":{o+=this.renderer.paragraph(p);continue}case"text":{let c=p,u=this.renderer.text(c);for(;d+1<e.length&&e[d+1].type==="text";)c=e[++d],u+=`
`+this.renderer.text(c);n?o+=this.renderer.paragraph({type:"paragraph",raw:u,text:u,tokens:[{type:"text",raw:u,text:u,escaped:!0}]}):o+=u;continue}default:{let c='Token with "'+p.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return o}parseInline(e,n=this.renderer){var i,a;let o="";for(let d=0;d<e.length;d++){let l=e[d];if((a=(i=this.options.extensions)==null?void 0:i.renderers)!=null&&a[l.type]){let c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(l.type)){o+=c||"";continue}}let p=l;switch(p.type){case"escape":{o+=n.text(p);break}case"html":{o+=n.html(p);break}case"link":{o+=n.link(p);break}case"image":{o+=n.image(p);break}case"strong":{o+=n.strong(p);break}case"em":{o+=n.em(p);break}case"codespan":{o+=n.codespan(p);break}case"br":{o+=n.br(p);break}case"del":{o+=n.del(p);break}case"text":{o+=n.text(p);break}default:{let c='Token with "'+p.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return o}},yt,Ye=(yt=class{constructor(t){v(this,"options");v(this,"block");this.options=t||he}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}provideLexer(){return this.block?ne.lex:ne.lexInline}provideParser(){return this.block?oe.parse:oe.parseInline}},v(yt,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"])),yt),gr=class{constructor(...t){v(this,"defaults",vt());v(this,"options",this.setOptions);v(this,"parse",this.parseMarkdown(!0));v(this,"parseInline",this.parseMarkdown(!1));v(this,"Parser",oe);v(this,"Renderer",Ke);v(this,"TextRenderer",Ot);v(this,"Lexer",ne);v(this,"Tokenizer",Xe);v(this,"Hooks",Ye);this.use(...t)}walkTokens(t,e){var o,i;let n=[];for(let a of t)switch(n=n.concat(e.call(this,a)),a.type){case"table":{let d=a;for(let l of d.header)n=n.concat(this.walkTokens(l.tokens,e));for(let l of d.rows)for(let p of l)n=n.concat(this.walkTokens(p.tokens,e));break}case"list":{let d=a;n=n.concat(this.walkTokens(d.items,e));break}default:{let d=a;(i=(o=this.defaults.extensions)==null?void 0:o.childTokens)!=null&&i[d.type]?this.defaults.extensions.childTokens[d.type].forEach(l=>{let p=d[l].flat(1/0);n=n.concat(this.walkTokens(p,e))}):d.tokens&&(n=n.concat(this.walkTokens(d.tokens,e)))}}return n}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(n=>{let o={...n};if(o.async=this.defaults.async||o.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let a=e.renderers[i.name];a?e.renderers[i.name]=function(...d){let l=i.renderer.apply(this,d);return l===!1&&(l=a.apply(this,d)),l}:e.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=e[i.level];a?a.unshift(i.tokenizer):e[i.level]=[i.tokenizer],i.start&&(i.level==="block"?e.startBlock?e.startBlock.push(i.start):e.startBlock=[i.start]:i.level==="inline"&&(e.startInline?e.startInline.push(i.start):e.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(e.childTokens[i.name]=i.childTokens)}),o.extensions=e),n.renderer){let i=this.defaults.renderer||new Ke(this.defaults);for(let a in n.renderer){if(!(a in i))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let d=a,l=n.renderer[d],p=i[d];i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=p.apply(i,c)),u||""}}o.renderer=i}if(n.tokenizer){let i=this.defaults.tokenizer||new Xe(this.defaults);for(let a in n.tokenizer){if(!(a in i))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let d=a,l=n.tokenizer[d],p=i[d];i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=p.apply(i,c)),u}}o.tokenizer=i}if(n.hooks){let i=this.defaults.hooks||new Ye;for(let a in n.hooks){if(!(a in i))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let d=a,l=n.hooks[d],p=i[d];Ye.passThroughHooks.has(a)?i[d]=c=>{if(this.defaults.async)return Promise.resolve(l.call(i,c)).then(x=>p.call(i,x));let u=l.call(i,c);return p.call(i,u)}:i[d]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=p.apply(i,c)),u}}o.hooks=i}if(n.walkTokens){let i=this.defaults.walkTokens,a=n.walkTokens;o.walkTokens=function(d){let l=[];return l.push(a.call(this,d)),i&&(l=l.concat(i.call(this,d))),l}}this.defaults={...this.defaults,...o}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return ne.lex(t,e!=null?e:this.defaults)}parser(t,e){return oe.parse(t,e!=null?e:this.defaults)}parseMarkdown(t){return(n,o)=>{let i={...o},a={...this.defaults,...i},d=this.onError(!!a.silent,!!a.async);if(this.defaults.async===!0&&i.async===!1)return d(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof n=="undefined"||n===null)return d(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return d(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));a.hooks&&(a.hooks.options=a,a.hooks.block=t);let l=a.hooks?a.hooks.provideLexer():t?ne.lex:ne.lexInline,p=a.hooks?a.hooks.provideParser():t?oe.parse:oe.parseInline;if(a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(n):n).then(c=>l(c,a)).then(c=>a.hooks?a.hooks.processAllTokens(c):c).then(c=>a.walkTokens?Promise.all(this.walkTokens(c,a.walkTokens)).then(()=>c):c).then(c=>p(c,a)).then(c=>a.hooks?a.hooks.postprocess(c):c).catch(d);try{a.hooks&&(n=a.hooks.preprocess(n));let c=l(n,a);a.hooks&&(c=a.hooks.processAllTokens(c)),a.walkTokens&&this.walkTokens(c,a.walkTokens);let u=p(c,a);return a.hooks&&(u=a.hooks.postprocess(u)),u}catch(c){return d(c)}}}onError(t,e){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let o="<p>An error occurred:</p><pre>"+K(n.message+"",!0)+"</pre>";return e?Promise.resolve(o):o}if(e)return Promise.reject(n);throw n}}},pe=new gr;function _(t,e){return pe.parse(t,e)}_.options=_.setOptions=function(t){return pe.setOptions(t),_.defaults=pe.defaults,vn(_.defaults),_};_.getDefaults=vt;_.defaults=he;_.use=function(...t){return pe.use(...t),_.defaults=pe.defaults,vn(_.defaults),_};_.walkTokens=function(t,e){return pe.walkTokens(t,e)};_.parseInline=pe.parseInline;_.Parser=oe;_.parser=oe.parse;_.Renderer=Ke;_.TextRenderer=Ot;_.Lexer=ne;_.lexer=ne.lex;_.Tokenizer=Xe;_.Hooks=Ye;_.parse=_;var si=_.options,li=_.setOptions,ci=_.use,di=_.walkTokens,ui=_.parseInline;var pi=oe.parse,hi=ne.lex;function Dn(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,o=Array(e);n<e;n++)o[n]=t[n];return o}function br(t){if(Array.isArray(t))return t}function wr(t,e){var n=t==null?null:typeof Symbol!="undefined"&&t[Symbol.iterator]||t["@@iterator"];if(n!=null){var o,i,a,d,l=[],p=!0,c=!1;try{if(a=(n=n.call(t)).next,e!==0)for(;!(p=(o=a.call(n)).done)&&(l.push(o.value),l.length!==e);p=!0);}catch(u){c=!0,i=u}finally{try{if(!p&&n.return!=null&&(d=n.return(),Object(d)!==d))return}finally{if(c)throw i}}return l}}function kr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function yr(t,e){return br(t)||wr(t,e)||xr(t,e)||kr()}function xr(t,e){if(t){if(typeof t=="string")return Dn(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Dn(t,e):void 0}}var Zn=Object.entries,Mn=Object.setPrototypeOf,_r=Object.isFrozen,Tr=Object.getPrototypeOf,vr=Object.getOwnPropertyDescriptor,$=Object.freeze,U=Object.seal,Te=Object.create,Xn=typeof Reflect!="undefined"&&Reflect,$t=Xn.apply,Ut=Xn.construct;$||($=function(e){return e});U||(U=function(e){return e});$t||($t=function(e,n){for(var o=arguments.length,i=new Array(o>2?o-2:0),a=2;a<o;a++)i[a-2]=arguments[a];return e.apply(n,i)});Ut||(Ut=function(e){for(var n=arguments.length,o=new Array(n>1?n-1:0),i=1;i<n;i++)o[i-1]=arguments[i];return new e(...o)});var ze=O(Array.prototype.forEach),Er=O(Array.prototype.lastIndexOf),Pn=O(Array.prototype.pop),_e=O(Array.prototype.push),Sr=O(Array.prototype.splice),ce=Array.isArray,Pe=O(String.prototype.toLowerCase),Nt=O(String.prototype.toString),$n=O(String.prototype.match),De=O(String.prototype.replace),Un=O(String.prototype.indexOf),Ar=O(String.prototype.trim),Rr=O(Number.prototype.toString),Ir=O(Boolean.prototype.toString),Bn=typeof BigInt=="undefined"?null:O(BigInt.prototype.toString),Fn=typeof Symbol=="undefined"?null:O(Symbol.prototype.toString),M=O(Object.prototype.hasOwnProperty),Me=O(Object.prototype.toString),P=O(RegExp.prototype.test),me=Cr(TypeError);function O(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var n=arguments.length,o=new Array(n>1?n-1:0),i=1;i<n;i++)o[i-1]=arguments[i];return $t(t,e,o)}}function Cr(t){return function(){for(var e=arguments.length,n=new Array(e),o=0;o<e;o++)n[o]=arguments[o];return Ut(t,n)}}function w(t,e){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Pe;if(Mn&&Mn(t,null),!ce(e))return t;let o=e.length;for(;o--;){let i=e[o];if(typeof i=="string"){let a=n(i);a!==i&&(_r(e)||(e[o]=a),i=a)}t[i]=!0}return t}function Lr(t){for(let e=0;e<t.length;e++)M(t,e)||(t[e]=null);return t}function j(t){let e=Te(null);for(let o of Zn(t)){var n=yr(o,2);let i=n[0],a=n[1];M(t,i)&&(ce(a)?e[i]=Lr(a):a&&typeof a=="object"&&a.constructor===Object?e[i]=j(a):e[i]=a)}return e}function Or(t){switch(typeof t){case"string":return t;case"number":return Rr(t);case"boolean":return Ir(t);case"bigint":return Bn?Bn(t):"0";case"symbol":return Fn?Fn(t):"Symbol()";case"undefined":return Me(t);case"function":case"object":{if(t===null)return Me(t);let e=t,n=J(e,"toString");if(typeof n=="function"){let o=n(e);return typeof o=="string"?o:Me(o)}return Me(t)}default:return Me(t)}}function J(t,e){for(;t!==null;){let o=vr(t,e);if(o){if(o.get)return O(o.get);if(typeof o.value=="function")return O(o.value)}t=Tr(t)}function n(){return null}return n}function Nr(t){try{return P(t,""),!0}catch(e){return!1}}var Hn=$(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),zt=$(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Dt=$(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),zr=$(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Mt=$(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Dr=$(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Gn=$(["#text"]),jn=$(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Pt=$(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),qn=$(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),et=$(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Mr=U(/{{[\w\W]*|^[\w\W]*}}/g),Pr=U(/<%[\w\W]*|^[\w\W]*%>/g),$r=U(/\${[\w\W]*/g),Ur=U(/^data-[\-\w.\u00B7-\uFFFF]+$/),Br=U(/^aria-[\-\w]+$/),Wn=U(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Fr=U(/^(?:\w+script|data):/i),Hr=U(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Gr=U(/^html$/i),jr=U(/^[a-z][.\w]*(-[.\w]+)+$/i),Vn=U(/<[/\w!]/g),qr=U(/<[/\w]/g),Wr=U(/<\/no(script|embed|frames)/i),Vr=U(/\/>/i),Q={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Yr=function(){return typeof window=="undefined"?null:window},Zr=function(e,n){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let o=null,i="data-tt-policy-suffix";n&&n.hasAttribute(i)&&(o=n.getAttribute(i));let a="dompurify"+(o?"#"+o:"");try{return e.createPolicy(a,{createHTML(d){return d},createScriptURL(d){return d}})}catch(d){return console.warn("TrustedTypes policy "+a+" could not be created."),null}},Yn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},le=function(e,n,o,i){return M(e,n)&&ce(e[n])?w(i.base?j(i.base):{},e[n],i.transform):o};function Kn(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Yr(),e=m=>Kn(m);if(e.version="3.4.11",e.removed=[],!t||!t.document||t.document.nodeType!==Q.document||!t.Element)return e.isSupported=!1,e;let n=t.document,o=n,i=o.currentScript;t.DocumentFragment;let a=t.HTMLTemplateElement,d=t.Node,l=t.Element,p=t.NodeFilter,c=t.NamedNodeMap;c===void 0&&(t.NamedNodeMap||t.MozNamedAttrMap),t.HTMLFormElement;let u=t.DOMParser,x=t.trustedTypes,f=l.prototype,N=J(f,"cloneNode"),y=J(f,"remove"),B=J(f,"nextSibling"),re=J(f,"childNodes"),ee=J(f,"parentNode"),ve=J(f,"shadowRoot"),fe=J(f,"attributes"),F=d&&d.prototype?J(d.prototype,"nodeType"):null,Y=d&&d.prototype?J(d.prototype,"nodeName"):null;if(typeof a=="function"){let m=n.createElement("template");m.content&&m.content.ownerDocument&&(n=m.content.ownerDocument)}let z,q="",tt,Gt=!1,Ee=0,jt=function(){if(Ee>0)throw me('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},ge=function(r){jt(),Ee++;try{return z.createHTML(r)}finally{Ee--}},ro=function(r){jt(),Ee++;try{return z.createScriptURL(r)}finally{Ee--}},io=function(){return Gt||(tt=Zr(x,i),Gt=!0),tt},Ue=n,nt=Ue.implementation,qt=Ue.createNodeIterator,ao=Ue.createDocumentFragment,so=Ue.getElementsByTagName,lo=o.importNode,I=Yn();e.isSupported=typeof Zn=="function"&&typeof ee=="function"&&nt&&nt.createHTMLDocument!==void 0;let co=Mr,uo=Pr,po=$r,ho=Ur,mo=Br,fo=Fr,Wt=Hr,go=jr,Vt=Wn,E=null,Yt=w({},[...Hn,...zt,...Dt,...Mt,...Gn]),S=null,Zt=w({},[...jn,...Pt,...qn,...et]),A=Object.seal(Te(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Se=null,Xt=null,ie=Object.seal(Te(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),Kt=!0,ot=!0,Qt=!1,Jt=!0,ae=!1,Ae=!0,de=!1,rt=!1,it=null,at=null,st=!1,be=!1,Be=!1,Fe=!1,en=!0,tn=!1,nn="user-content-",lt=!0,ct=!1,we={},Z=null,dt=w({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]),on=null,rn=w({},["audio","video","img","source","image","track"]),ut=null,an=w({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),He="http://www.w3.org/1998/Math/MathML",Ge="http://www.w3.org/2000/svg",X="http://www.w3.org/1999/xhtml",ke=X,pt=!1,ht=null,bo=w({},[He,Ge,X],Nt),sn=$(["mi","mo","mn","ms","mtext"]),mt=w({},sn),ln=$(["annotation-xml"]),ft=w({},ln),wo=w({},["title","style","font","a","script"]),Re=null,ko=["application/xhtml+xml","text/html"],yo="text/html",R=null,ye=null,xo=n.createElement("form"),cn=function(r){return r instanceof RegExp||r instanceof Function},gt=function(){let r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(ye&&ye===r)return;(!r||typeof r!="object")&&(r={}),r=j(r),Re=ko.indexOf(r.PARSER_MEDIA_TYPE)===-1?yo:r.PARSER_MEDIA_TYPE,R=Re==="application/xhtml+xml"?Nt:Pe,E=le(r,"ALLOWED_TAGS",Yt,{transform:R}),S=le(r,"ALLOWED_ATTR",Zt,{transform:R}),ht=le(r,"ALLOWED_NAMESPACES",bo,{transform:Nt}),ut=le(r,"ADD_URI_SAFE_ATTR",an,{transform:R,base:an}),on=le(r,"ADD_DATA_URI_TAGS",rn,{transform:R,base:rn}),Z=le(r,"FORBID_CONTENTS",dt,{transform:R}),Se=le(r,"FORBID_TAGS",j({}),{transform:R}),Xt=le(r,"FORBID_ATTR",j({}),{transform:R}),we=M(r,"USE_PROFILES")?r.USE_PROFILES&&typeof r.USE_PROFILES=="object"?j(r.USE_PROFILES):r.USE_PROFILES:!1,Kt=r.ALLOW_ARIA_ATTR!==!1,ot=r.ALLOW_DATA_ATTR!==!1,Qt=r.ALLOW_UNKNOWN_PROTOCOLS||!1,Jt=r.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ae=r.SAFE_FOR_TEMPLATES||!1,Ae=r.SAFE_FOR_XML!==!1,de=r.WHOLE_DOCUMENT||!1,be=r.RETURN_DOM||!1,Be=r.RETURN_DOM_FRAGMENT||!1,Fe=r.RETURN_TRUSTED_TYPE||!1,st=r.FORCE_BODY||!1,en=r.SANITIZE_DOM!==!1,tn=r.SANITIZE_NAMED_PROPS||!1,lt=r.KEEP_CONTENT!==!1,ct=r.IN_PLACE||!1,Vt=Nr(r.ALLOWED_URI_REGEXP)?r.ALLOWED_URI_REGEXP:Wn,ke=typeof r.NAMESPACE=="string"?r.NAMESPACE:X,mt=M(r,"MATHML_TEXT_INTEGRATION_POINTS")&&r.MATHML_TEXT_INTEGRATION_POINTS&&typeof r.MATHML_TEXT_INTEGRATION_POINTS=="object"?j(r.MATHML_TEXT_INTEGRATION_POINTS):w({},sn),ft=M(r,"HTML_INTEGRATION_POINTS")&&r.HTML_INTEGRATION_POINTS&&typeof r.HTML_INTEGRATION_POINTS=="object"?j(r.HTML_INTEGRATION_POINTS):w({},ln);let s=M(r,"CUSTOM_ELEMENT_HANDLING")&&r.CUSTOM_ELEMENT_HANDLING&&typeof r.CUSTOM_ELEMENT_HANDLING=="object"?j(r.CUSTOM_ELEMENT_HANDLING):Te(null);if(A=Te(null),M(s,"tagNameCheck")&&cn(s.tagNameCheck)&&(A.tagNameCheck=s.tagNameCheck),M(s,"attributeNameCheck")&&cn(s.attributeNameCheck)&&(A.attributeNameCheck=s.attributeNameCheck),M(s,"allowCustomizedBuiltInElements")&&typeof s.allowCustomizedBuiltInElements=="boolean"&&(A.allowCustomizedBuiltInElements=s.allowCustomizedBuiltInElements),U(A),ae&&(ot=!1),Be&&(be=!0),we&&(E=w({},Gn),S=Te(null),we.html===!0&&(w(E,Hn),w(S,jn)),we.svg===!0&&(w(E,zt),w(S,Pt),w(S,et)),we.svgFilters===!0&&(w(E,Dt),w(S,Pt),w(S,et)),we.mathMl===!0&&(w(E,Mt),w(S,qn),w(S,et))),ie.tagCheck=null,ie.attributeCheck=null,M(r,"ADD_TAGS")&&(typeof r.ADD_TAGS=="function"?ie.tagCheck=r.ADD_TAGS:ce(r.ADD_TAGS)&&(E===Yt&&(E=j(E)),w(E,r.ADD_TAGS,R))),M(r,"ADD_ATTR")&&(typeof r.ADD_ATTR=="function"?ie.attributeCheck=r.ADD_ATTR:ce(r.ADD_ATTR)&&(S===Zt&&(S=j(S)),w(S,r.ADD_ATTR,R))),M(r,"ADD_URI_SAFE_ATTR")&&ce(r.ADD_URI_SAFE_ATTR)&&w(ut,r.ADD_URI_SAFE_ATTR,R),M(r,"FORBID_CONTENTS")&&ce(r.FORBID_CONTENTS)&&(Z===dt&&(Z=j(Z)),w(Z,r.FORBID_CONTENTS,R)),M(r,"ADD_FORBID_CONTENTS")&&ce(r.ADD_FORBID_CONTENTS)&&(Z===dt&&(Z=j(Z)),w(Z,r.ADD_FORBID_CONTENTS,R)),lt&&(E["#text"]=!0),de&&w(E,["html","head","body"]),E.table&&(w(E,["tbody"]),delete Se.tbody),r.TRUSTED_TYPES_POLICY){if(typeof r.TRUSTED_TYPES_POLICY.createHTML!="function")throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof r.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');let h=z;z=r.TRUSTED_TYPES_POLICY;try{q=ge("")}catch(g){throw z=h,g}}else r.TRUSTED_TYPES_POLICY===null?(z=void 0,q=""):(z===void 0&&(z=io()),z&&typeof q=="string"&&(q=ge("")));$&&$(r),ye=r},dn=w({},[...zt,...Dt,...zr]),un=w({},[...Mt,...Dr]),_o=function(r,s,h){return s.namespaceURI===X?r==="svg":s.namespaceURI===He?r==="svg"&&(h==="annotation-xml"||mt[h]):!!dn[r]},To=function(r,s,h){return s.namespaceURI===X?r==="math":s.namespaceURI===Ge?r==="math"&&ft[h]:!!un[r]},vo=function(r,s,h){return s.namespaceURI===Ge&&!ft[h]||s.namespaceURI===He&&!mt[h]?!1:!un[r]&&(wo[r]||!dn[r])},Eo=function(r){let s=ee(r);(!s||!s.tagName)&&(s={namespaceURI:ke,tagName:"template"});let h=Pe(r.tagName),g=Pe(s.tagName);return ht[r.namespaceURI]?r.namespaceURI===Ge?_o(h,s,g):r.namespaceURI===He?To(h,s,g):r.namespaceURI===X?vo(h,s,g):!!(Re==="application/xhtml+xml"&&ht[r.namespaceURI]):!1},se=function(r){_e(e.removed,{element:r});try{ee(r).removeChild(r)}catch(s){if(y(r),!ee(r))throw me("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},pn=function(r){let s=re(r);if(s){let g=[];ze(s,b=>{_e(g,b)}),ze(g,b=>{try{y(b)}catch(k){}})}let h=fe(r);if(h)for(let g=h.length-1;g>=0;--g){let b=h[g],k=b&&b.name;if(typeof k=="string")try{r.removeAttribute(k)}catch(D){}}},ue=function(r,s){try{_e(e.removed,{attribute:s.getAttributeNode(r),from:s})}catch(h){_e(e.removed,{attribute:null,from:s})}if(s.removeAttribute(r),r==="is")if(be||Be)try{se(s)}catch(h){}else try{s.setAttribute(r,"")}catch(h){}},So=function(r){let s=fe(r);if(s)for(let h=s.length-1;h>=0;--h){let g=s[h],b=g&&g.name;if(!(typeof b!="string"||S[R(b)]))try{r.removeAttribute(b)}catch(k){}}},Ao=function(r){let s=[r];for(;s.length>0;){let h=s.pop();(F?F(h):h.nodeType)===Q.element&&So(h);let b=re(h);if(b)for(let k=b.length-1;k>=0;--k)s.push(b[k])}},hn=function(r){let s=null,h=null;if(st)r="<remove></remove>"+r;else{let k=$n(r,/^[\r\n\t ]+/);h=k&&k[0]}Re==="application/xhtml+xml"&&ke===X&&(r='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+r+"</body></html>");let g=z?ge(r):r;if(ke===X)try{s=new u().parseFromString(g,Re)}catch(k){}if(!s||!s.documentElement){s=nt.createDocument(ke,"template",null);try{s.documentElement.innerHTML=pt?q:g}catch(k){}}let b=s.body||s.documentElement;return r&&h&&b.insertBefore(n.createTextNode(h),b.childNodes[0]||null),ke===X?so.call(s,de?"html":"body")[0]:de?s.documentElement:b},mn=function(r){return qt.call(r.ownerDocument||r,r,p.SHOW_ELEMENT|p.SHOW_COMMENT|p.SHOW_TEXT|p.SHOW_PROCESSING_INSTRUCTION|p.SHOW_CDATA_SECTION,null)},je=function(r){return r=De(r,co," "),r=De(r,uo," "),r=De(r,po," "),r},bt=function(r){var s;r.normalize();let h=qt.call(r.ownerDocument||r,r,p.SHOW_TEXT|p.SHOW_COMMENT|p.SHOW_CDATA_SECTION|p.SHOW_PROCESSING_INSTRUCTION,null),g=h.nextNode();for(;g;)g.data=je(g.data),g=h.nextNode();let b=(s=r.querySelectorAll)===null||s===void 0?void 0:s.call(r,"template");b&&ze(b,k=>{xe(k.content)&&bt(k.content)})},qe=function(r){let s=Y?Y(r):null;return typeof s!="string"||R(s)!=="form"?!1:typeof r.nodeName!="string"||typeof r.textContent!="string"||typeof r.removeChild!="function"||r.attributes!==fe(r)||typeof r.removeAttribute!="function"||typeof r.setAttribute!="function"||typeof r.namespaceURI!="string"||typeof r.insertBefore!="function"||typeof r.hasChildNodes!="function"||r.nodeType!==F(r)||r.childNodes!==re(r)},xe=function(r){if(!F||typeof r!="object"||r===null)return!1;try{return F(r)===Q.documentFragment}catch(s){return!1}},Ie=function(r){if(!F||typeof r!="object"||r===null)return!1;try{return typeof F(r)=="number"}catch(s){return!1}};function te(m,r,s){m.length!==0&&ze(m,h=>{h.call(e,r,s,ye)})}let Ro=function(r,s){return!!(Ae&&r.hasChildNodes()&&!Ie(r.firstElementChild)&&P(Vn,r.textContent)&&P(Vn,r.innerHTML)||Ae&&r.namespaceURI===X&&s==="style"&&Ie(r.firstElementChild)||r.nodeType===Q.processingInstruction||Ae&&r.nodeType===Q.comment&&P(qr,r.data))},Io=function(r,s){if(!Se[s]&&bn(s)&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,s)||A.tagNameCheck instanceof Function&&A.tagNameCheck(s)))return!1;if(lt&&!Z[s]){let h=ee(r),g=re(r);if(g&&h){let b=g.length;for(let k=b-1;k>=0;--k){let D=ct?g[k]:N(g[k],!0);h.insertBefore(D,B(r))}}}return se(r),!0},fn=function(r){if(te(I.beforeSanitizeElements,r,null),qe(r))return se(r),!0;let s=R(Y?Y(r):r.nodeName);if(te(I.uponSanitizeElement,r,{tagName:s,allowedTags:E}),Ro(r,s))return se(r),!0;if(Se[s]||!(ie.tagCheck instanceof Function&&ie.tagCheck(s))&&!E[s])return Io(r,s);if((F?F(r):r.nodeType)===Q.element&&!Eo(r)||(s==="noscript"||s==="noembed"||s==="noframes")&&P(Wr,r.innerHTML))return se(r),!0;if(ae&&r.nodeType===Q.text){let g=je(r.textContent);r.textContent!==g&&(_e(e.removed,{element:r.cloneNode()}),r.textContent=g)}return te(I.afterSanitizeElements,r,null),!1},gn=function(r,s,h){if(Xt[s]||en&&(s==="id"||s==="name")&&(h in n||h in xo))return!1;let g=S[s]||ie.attributeCheck instanceof Function&&ie.attributeCheck(s,r);if(!(ot&&P(ho,s))){if(!(Kt&&P(mo,s))){if(g){if(!ut[s]){if(!P(Vt,De(h,Wt,""))){if(!((s==="src"||s==="xlink:href"||s==="href")&&r!=="script"&&Un(h,"data:")===0&&on[r])){if(!(Qt&&!P(fo,De(h,Wt,"")))){if(h)return!1}}}}}else if(!(bn(r)&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,r)||A.tagNameCheck instanceof Function&&A.tagNameCheck(r))&&(A.attributeNameCheck instanceof RegExp&&P(A.attributeNameCheck,s)||A.attributeNameCheck instanceof Function&&A.attributeNameCheck(s,r))||s==="is"&&A.allowCustomizedBuiltInElements&&(A.tagNameCheck instanceof RegExp&&P(A.tagNameCheck,h)||A.tagNameCheck instanceof Function&&A.tagNameCheck(h))))return!1}}return!0},Co=w({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),bn=function(r){return!Co[Pe(r)]&&P(go,r)},Lo=function(r,s,h,g){if(z&&typeof x=="object"&&typeof x.getAttributeType=="function"&&!h)switch(x.getAttributeType(r,s)){case"TrustedHTML":return ge(g);case"TrustedScriptURL":return ro(g)}return g},Oo=function(r,s,h,g){try{h?r.setAttributeNS(h,s,g):r.setAttribute(s,g),qe(r)?se(r):Pn(e.removed)}catch(b){ue(s,r)}},wn=function(r){te(I.beforeSanitizeAttributes,r,null);let s=r.attributes;if(!s||qe(r))return;let h={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:S,forceKeepAttr:void 0},g=s.length,b=R(r.nodeName);for(;g--;){let k=s[g],D=k.name,L=k.namespaceURI,W=k.value,V=R(D),kt=W,H=D==="value"?kt:Ar(kt);if(h.attrName=V,h.attrValue=H,h.keepAttr=!0,h.forceKeepAttr=void 0,te(I.uponSanitizeAttribute,r,h),H=h.attrValue,tn&&(V==="id"||V==="name")&&Un(H,nn)!==0&&(ue(D,r),H=nn+H),Ae&&P(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,H)){ue(D,r);continue}if(V==="attributename"&&$n(H,"href")){ue(D,r);continue}if(!h.forceKeepAttr){if(!h.keepAttr){ue(D,r);continue}if(!Jt&&P(Vr,H)){ue(D,r);continue}if(ae&&(H=je(H)),!gn(b,V,H)){ue(D,r);continue}H=Lo(b,V,L,H),H!==kt&&Oo(r,D,L,H)}}te(I.afterSanitizeAttributes,r,null)},We=function(r){let s=null,h=mn(r);for(te(I.beforeSanitizeShadowDOM,r,null);s=h.nextNode();)if(te(I.uponSanitizeShadowNode,s,null),fn(s),wn(s),xe(s.content)&&We(s.content),(F?F(s):s.nodeType)===Q.element){let b=ve(s);xe(b)&&(wt(b),We(b))}te(I.afterSanitizeShadowDOM,r,null)},wt=function(r){let s=[{node:r,shadow:null}];for(;s.length>0;){let h=s.pop();if(h.shadow){We(h.shadow);continue}let g=h.node,k=(F?F(g):g.nodeType)===Q.element,D=re(g);if(D)for(let L=D.length-1;L>=0;--L)s.push({node:D[L],shadow:null});if(k){let L=Y?Y(g):null;if(typeof L=="string"&&R(L)==="template"){let W=g.content;xe(W)&&s.push({node:W,shadow:null})}}if(k){let L=ve(g);xe(L)&&s.push({node:null,shadow:L},{node:L,shadow:null})}}};return e.sanitize=function(m){let r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s=null,h=null,g=null,b=null;if(pt=!m,pt&&(m="<!-->"),typeof m!="string"&&!Ie(m)&&(m=Or(m),typeof m!="string"))throw me("dirty is not a string, aborting");if(!e.isSupported)return m;rt?(E=it,S=at):gt(r),(I.uponSanitizeElement.length>0||I.uponSanitizeAttribute.length>0)&&(E=j(E)),I.uponSanitizeAttribute.length>0&&(S=j(S)),e.removed=[];let k=ct&&typeof m!="string"&&Ie(m);if(k){let W=Y?Y(m):m.nodeName;if(typeof W=="string"){let V=R(W);if(!E[V]||Se[V])throw me("root node is forbidden and cannot be sanitized in-place")}if(qe(m))throw me("root node is clobbered and cannot be sanitized in-place");try{wt(m)}catch(V){throw pn(m),V}}else if(Ie(m))s=hn("<!---->"),h=s.ownerDocument.importNode(m,!0),h.nodeType===Q.element&&h.nodeName==="BODY"||h.nodeName==="HTML"?s=h:s.appendChild(h),wt(h);else{if(!be&&!ae&&!de&&m.indexOf("<")===-1)return z&&Fe?ge(m):m;if(s=hn(m),!s)return be?null:Fe?q:""}s&&st&&se(s.firstChild);let D=mn(k?m:s);try{for(;g=D.nextNode();)fn(g),wn(g),xe(g.content)&&We(g.content)}catch(W){throw k&&pn(m),W}if(k)return ze(e.removed,W=>{W.element&&Ao(W.element)}),ae&&bt(m),m;if(be){if(ae&&bt(s),Be)for(b=ao.call(s.ownerDocument);s.firstChild;)b.appendChild(s.firstChild);else b=s;return(S.shadowroot||S.shadowrootmode)&&(b=lo.call(o,b,!0)),b}let L=de?s.outerHTML:s.innerHTML;return de&&E["!doctype"]&&s.ownerDocument&&s.ownerDocument.doctype&&s.ownerDocument.doctype.name&&P(Gr,s.ownerDocument.doctype.name)&&(L="<!DOCTYPE "+s.ownerDocument.doctype.name+`>
`+L),ae&&(L=je(L)),z&&Fe?ge(L):L},e.setConfig=function(){let m=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};gt(m),rt=!0,it=E,at=S},e.clearConfig=function(){ye=null,rt=!1,it=null,at=null,z=tt,q=""},e.isValidAttribute=function(m,r,s){ye||gt({});let h=R(m),g=R(r);return gn(h,g,s)},e.addHook=function(m,r){typeof r=="function"&&M(I,m)&&_e(I[m],r)},e.removeHook=function(m,r){if(M(I,m)){if(r!==void 0){let s=Er(I[m],r);return s===-1?void 0:Sr(I[m],s,1)[0]}return Pn(I[m])}},e.removeHooks=function(m){M(I,m)&&(I[m]=[])},e.removeAllHooks=function(){I=Yn()},e}var Bt=Kn();var Qn=`/*light */
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

`;var Ft="unichat_widget_source_id",Ht="unichat_widget_conversation_id",Kr="unichat_widget_inbox",$e=[];_.setOptions({breaks:!0,gfm:!0,headerIds:!1,mangle:!1});var Qr={ALLOWED_TAGS:["p","em","strong","code","pre","ul","ol","li","a","blockquote","hr","br","h1","h2","h3","h4","h5","h6","img","table","thead","tbody","tr","th","td","del","span","div"],ALLOWED_ATTR:["href","alt","src","class","loading","referrerpolicy","title"],ALLOW_DATA_ATTR:!1},Jn=!1;function Jr(){Jn||(Bt.addHook("afterSanitizeAttributes",function(t){t.tagName==="A"&&(t.setAttribute("target","_blank"),t.setAttribute("rel","noopener noreferrer")),t.tagName==="IMG"&&(t.setAttribute("loading","lazy"),t.setAttribute("referrerpolicy","no-referrer"))}),Jn=!0)}function to(t){if(!t)return"";Jr();var e=_.parse(t,{async:!1});return Bt.sanitize(e,Qr)}function ei(){return crypto&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=Math.random()*16|0;return(t==="x"?e:e&3|8).toString(16)})}function ti(){var t=localStorage.getItem(Ft);return t||(t=ei(),localStorage.setItem(Ft,t)),t}function ni(t){if(!document.getElementById("unichat-widget-styles")){var e=document.createElement("style");e.id="unichat-widget-styles",e.textContent=t,document.head.appendChild(e)}}function no(){return'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'}function oo(){return'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}function oi(){return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'}var ri=["#unichat-widget * { box-sizing:border-box; margin:0; padding:0; }","#unichat-widget {","  font-family: var(--widget-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);","  position: fixed;","  bottom: var(--widget-position-bottom, 20px);","  right: var(--widget-position-right, 20px);","  z-index: 2147483645;","  --uw-primary: var(--widget-primary-color, #4F46E5);","  --uw-primary-dark: color-mix(in srgb, var(--uw-primary) 85%, #000);","  --uw-radius: 16px;","}","#unichat-widget .uw-btn {","  width: 58px; height: 58px; border-radius: 50%;","  background: var(--uw-primary);","  border: none; cursor: pointer;","  display: flex; align-items: center; justify-content: center;","  box-shadow: 0 6px 20px -4px color-mix(in srgb, var(--uw-primary) 50%, transparent),","              0 2px 8px rgba(0,0,0,0.08);","  transition: transform 0.15s ease, box-shadow 0.15s ease;","}","#unichat-widget .uw-btn:hover {","  transform: translateY(-2px);","  box-shadow: 0 10px 28px -4px color-mix(in srgb, var(--uw-primary) 55%, transparent),","              0 4px 12px rgba(0,0,0,0.1);","}","#unichat-widget .uw-btn:active { transform: translateY(0) scale(0.96); }","#unichat-widget .uw-panel {","  position: absolute; bottom: 70px; right: 0;","  width: 360px; height: 520px;","  background: #fff; border-radius: var(--uw-radius);","  box-shadow: 0 24px 60px -12px rgba(0,0,0,0.18),","              0 8px 24px -8px rgba(0,0,0,0.1);","  display: none; flex-direction: column; overflow: hidden;","  animation: uw-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);","}","@keyframes uw-slide-up {","  from { opacity:0; transform:translateY(12px) scale(0.98); }","  to { opacity:1; transform:translateY(0) scale(1); }","}","@media (max-width:480px) {","  #unichat-widget .uw-panel {","    position: fixed; top: 0; left: 0;","    width: 100%; height: 100vh; border-radius: 0;","  }","  @supports (height: 100dvh) {","    #unichat-widget .uw-panel { height: 100dvh; }","  }","  #unichat-widget .uw-panel.uw-vv-active {","    top: var(--uw-vv-top, 0px);","    height: var(--uw-vv-height, 100vh);","  }","}","#unichat-widget .uw-header {","  background: var(--uw-primary);","  color: #fff; padding: 18px 20px; display: flex;","  align-items: center; justify-content: space-between; flex-shrink: 0;","}","#unichat-widget .uw-header h3 { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }","#unichat-widget .uw-close {","  background: rgba(255,255,255,0.15); border: none; color: #fff;","  cursor: pointer; opacity: 0.9; padding: 6px; line-height: 0;","  border-radius: 8px; transition: background 0.15s;","}","#unichat-widget .uw-close:hover { background: rgba(255,255,255,0.25); opacity: 1; }","#unichat-widget .uw-messages {","  flex: 1; overflow-y: auto; padding: 20px 16px;","  display: flex; flex-direction: column; gap: 10px;","  background: #FAFAFA;","  -webkit-overflow-scrolling: touch;","}","#unichat-widget .uw-messages::-webkit-scrollbar { width: 5px; }","#unichat-widget .uw-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }","#unichat-widget .uw-msg {","  max-width: 82%; padding: 10px 14px; border-radius: 16px;","  font-size: 14px; line-height: 1.5; word-wrap: break-word;","}","#unichat-widget .uw-msg.contact {","  align-self: flex-end;","  background: var(--uw-primary); color: #fff;","  border-bottom-right-radius: 5px;","  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);","}","#unichat-widget .uw-msg.agent {","  align-self: flex-start;","  background: #fff; color: #1F2937; border-bottom-left-radius: 5px;","  box-shadow: 0 1px 3px rgba(0,0,0,0.06);","  border: 1px solid #EEF0F2;","}","#unichat-widget .uw-input-bar {","  display: flex; align-items: flex-end; padding: 12px 14px; gap: 10px;","  border-top: 1px solid #EEF0F2; flex-shrink: 0; background: #fff;","}","#unichat-widget .uw-input {","  flex: 1; border: 1px solid #E5E7EB; border-radius: 20px;","  padding: 9px 14px; font-size: 14px; line-height: 1.4; outline: none; font-family: inherit;","  resize: none; min-height: 38px; max-height: 120px; overflow-y: auto;","  transition: border-color 0.15s, box-shadow 0.15s;","}","#unichat-widget .uw-input:focus {","  border-color: var(--uw-primary);","  box-shadow: 0 0 0 3px color-mix(in srgb, var(--uw-primary) 12%, transparent);","}","#unichat-widget .uw-input::placeholder { color: #B0B4BC; }","#unichat-widget .uw-send {","  background: var(--uw-primary);","  border: none; color: #fff; width: 38px; height: 38px;","  border-radius: 50%; cursor: pointer;","  display: flex; align-items: center; justify-content: center;","  flex-shrink: 0; transition: transform 0.15s, opacity 0.15s; line-height: 0;","  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--uw-primary) 40%, transparent);","}","#unichat-widget .uw-send:hover:not(:disabled) { transform: scale(1.08); }","#unichat-widget .uw-send:active:not(:disabled) { transform: scale(0.94); }","#unichat-widget .uw-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }","#unichat-widget .uw-activity {","  text-align: center; color: #9CA3AF; font-size: 12px; padding: 6px 16px;","  font-style: italic; line-height: 1.5; word-wrap: break-word;","}","#unichat-widget .uw-empty {","  text-align: center; color: #B0B4BC; font-size: 14px; padding: 48px 20px;","  line-height: 1.6;","}","@media (max-width:480px) {","  #unichat-widget .uw-input { font-size: 16px; }","}"].join(`
`),ii=["#unichat-widget .uw-msg .markdown-body,","#unichat-widget .uw-activity .markdown-body {","  font-size: 14px;","  line-height: 1.5;","  color: inherit;","  background: transparent;","  font-family: inherit;","  word-wrap: break-word;","}","#unichat-widget .uw-msg .markdown-body p { margin: 0 0 6px; }","#unichat-widget .uw-msg .markdown-body p:last-child { margin-bottom: 0; }","#unichat-widget .uw-msg .markdown-body h1,","#unichat-widget .uw-msg .markdown-body h2,","#unichat-widget .uw-msg .markdown-body h3,","#unichat-widget .uw-msg .markdown-body h4,","#unichat-widget .uw-msg .markdown-body h5,","#unichat-widget .uw-msg .markdown-body h6 {","  margin: 10px 0 4px; font-weight: 600; line-height: 1.3;","}","#unichat-widget .uw-msg .markdown-body h1 { font-size: 18px; }","#unichat-widget .uw-msg .markdown-body h2 { font-size: 16px; }","#unichat-widget .uw-msg .markdown-body h3 { font-size: 15px; padding-bottom: 0.3em; }","#unichat-widget .uw-msg .markdown-body h4 { font-size: 14px; }","#unichat-widget .uw-msg .markdown-body h5,","#unichat-widget .uw-msg .markdown-body h6 { font-size: 13px; }","#unichat-widget .uw-msg .markdown-body h1:first-child,","#unichat-widget .uw-msg .markdown-body h2:first-child,","#unichat-widget .uw-msg .markdown-body h3:first-child,","#unichat-widget .uw-msg .markdown-body h4:first-child,","#unichat-widget .uw-msg .markdown-body h5:first-child,","#unichat-widget .uw-msg .markdown-body h6:first-child { margin-top: 0; }","#unichat-widget .uw-msg .markdown-body ul,","#unichat-widget .uw-msg .markdown-body ol { margin: 4px 0 6px; padding-left: 22px; }","#unichat-widget .uw-msg .markdown-body li { margin: 2px 0; }","#unichat-widget .uw-msg .markdown-body li + li { margin-top: 2px; }","#unichat-widget .uw-msg .markdown-body code {","  font-size: 12.5px; padding: 0.2em 0.4em; word-break: break-all;","}","#unichat-widget .uw-msg .markdown-body pre { margin: 6px 0; padding: 10px 12px; }","#unichat-widget .uw-msg .markdown-body pre code { font-size: 12px; }","#unichat-widget .uw-msg .markdown-body table {","  display: table; width: 100%; font-size: 13px; margin: 6px 0;","  border-collapse: separate; border-spacing: 0;","  border-radius: 8px; overflow: hidden;","}","#unichat-widget .uw-msg .markdown-body th,","#unichat-widget .uw-msg .markdown-body td {","  padding: 6px 10px; border: none;","  border-top: 1px solid rgba(127, 127, 127, 0.2);","  word-break: break-word;","}","#unichat-widget .uw-msg .markdown-body th {","  border-top: none;","  border-bottom: 2px solid rgba(127, 127, 127, 0.28);","  font-weight: 600;","}","#unichat-widget .uw-msg .markdown-body tbody tr:last-child td { border-bottom: none; }","#unichat-widget .uw-msg .markdown-body blockquote { margin: 4px 0; padding: 2px 12px; }","#unichat-widget .uw-msg .markdown-body hr { margin: 10px 0; }","#unichat-widget .uw-msg .markdown-body img { border-radius: 10px; margin: 4px 0; }","#unichat-widget .uw-msg .markdown-body a { color: inherit; word-break: break-all; }","#unichat-widget .uw-msg.contact .markdown-body pre { background: #151b23; }","#unichat-widget .uw-msg.contact .markdown-body code { background: #656c7633; }","#unichat-widget .uw-msg.contact .markdown-body blockquote { border-left-color: #3d444d; color: #9198a1; }","#unichat-widget .uw-msg.contact .markdown-body table { border: 1px solid #3d444d; border-radius: 8px; }","#unichat-widget .uw-msg.contact .markdown-body th,","#unichat-widget .uw-msg.contact .markdown-body td { border: 1px solid #3d444d; padding: 6px 10px; }","#unichat-widget .uw-msg.contact .markdown-body th { font-weight: 600; }","#unichat-widget .uw-msg.contact .markdown-body table tr { background: #0d1117; }","#unichat-widget .uw-msg.contact .markdown-body table tr:nth-child(2n) { background: #151b23; }","#unichat-widget .uw-msg.contact .markdown-body hr { background: #3d444d; }","#unichat-widget .uw-activity .markdown-body { font-style: italic; }","#unichat-widget .uw-activity .markdown-body p { margin: 0; }"].join(`
`);function C(t){var e=this;this.inbox=t.inbox,this.embedKey=t.embedKey,this.sourceId=ti(),this.conversationId=localStorage.getItem(Ht),this._baseUrl=t.baseUrl||"",this._eventSource=null,this._callbacks={},this._panelOpen=!1,this._sending=!1,this._destroyed=!1,this._uiReady=!1,this._historyLoaded=!1,localStorage.setItem(Kr,this.inbox),ni(ri+`
`+Qn+`
`+ii),this._buildDOM(),this._bindEvents(),this._setupVisualViewport(),this.conversationId&&this._loadHistory().then(function(){e._subscribeSSE()}),this._uiReady=!0,this._emit("ready")}C.prototype._buildDOM=function(){var t=document.createElement("div");t.id="unichat-widget",this._btn=document.createElement("button"),this._btn.className="uw-btn",this._btn.innerHTML=no(),this._btn.setAttribute("aria-label","Open chat"),this._panel=document.createElement("div"),this._panel.className="uw-panel";var e=document.createElement("div");e.className="uw-header",e.innerHTML="<h3>Chat</h3>",this._closeBtn=document.createElement("button"),this._closeBtn.className="uw-close",this._closeBtn.setAttribute("aria-label","Close"),this._closeBtn.innerHTML=oo(),e.appendChild(this._closeBtn),this._messagesEl=document.createElement("div"),this._messagesEl.className="uw-messages",this._emptyEl=document.createElement("div"),this._emptyEl.className="uw-empty",this._emptyEl.textContent="No messages yet",this._messagesEl.appendChild(this._emptyEl);var n=document.createElement("div");n.className="uw-input-bar",this._inputEl=document.createElement("textarea"),this._inputEl.className="uw-input",this._inputEl.rows=1,this._inputEl.placeholder="Type a message...",this._sendBtn=document.createElement("button"),this._sendBtn.className="uw-send",this._sendBtn.setAttribute("aria-label","Send"),this._sendBtn.disabled=!0,this._sendBtn.innerHTML=oi(),n.appendChild(this._inputEl),n.appendChild(this._sendBtn),this._panel.appendChild(e),this._panel.appendChild(this._messagesEl),this._panel.appendChild(n),t.appendChild(this._btn),t.appendChild(this._panel),document.body.appendChild(t)};C.prototype._bindEvents=function(){var t=this;this._btn.addEventListener("click",function(){t.toggle()}),this._closeBtn.addEventListener("click",function(){t.close()}),this._inputEl.addEventListener("input",function(){t._sendBtn.disabled=!t._inputEl.value.trim(),t._autoResize()}),this._inputEl.addEventListener("keydown",function(e){e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&(e.preventDefault(),t._doSend())}),this._sendBtn.addEventListener("click",function(){t._doSend()})};C.prototype._setupVisualViewport=function(){var t=window.visualViewport;if(t){var e=this;this._panel.classList.add("uw-vv-active"),this._onVVResize=function(){e._panel.style.setProperty("--uw-vv-height",t.height+"px"),e._panel.style.setProperty("--uw-vv-top",t.offsetTop+"px")},t.addEventListener("resize",this._onVVResize),t.addEventListener("scroll",this._onVVResize),this._onVVResize()}};C.prototype._autoResize=function(){this._inputEl.style.height="auto",this._inputEl.style.height=this._inputEl.scrollHeight+"px"};C.prototype._doSend=function(){if(!this._sending){var t=this._inputEl.value.trim();t&&(this._inputEl.value="",this._inputEl.style.height="auto",this._sendBtn.disabled=!0,this.send(t))}};C.prototype.toggle=function(){this._panelOpen?this.close():this.open()};C.prototype.open=function(){this._destroyed||(this._panelOpen=!0,this._panel.style.display="flex",this._btn.innerHTML=oo(),this._messagesEl.scrollTop=this._messagesEl.scrollHeight)};C.prototype.close=function(){this._panelOpen=!1,this._panel.style.display="none",this._btn.innerHTML=no()};C.prototype.send=function(t){var e=this;this._sending=!0;var n=this._addMessage(t,"contact");return fetch(this._baseUrl+"/widget/"+this.inbox+"/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embed_key:this.embedKey,source_id:this.sourceId,content:t,content_type:"text"})}).then(function(o){if(!o.ok)throw new Error("Send failed: "+o.status);return o.json()}).then(function(o){o.conversation_id&&(e.conversationId=o.conversation_id,localStorage.setItem(Ht,o.conversation_id),e._subscribeSSE())}).catch(function(o){throw n&&n.parentNode&&n.parentNode.removeChild(n),e._emit("error",o),o}).finally(function(){e._sending=!1})};C.prototype._addActivity=function(t){this._emptyEl&&this._emptyEl.parentNode&&(this._emptyEl.parentNode.removeChild(this._emptyEl),this._emptyEl=null);var e=document.createElement("div");e.className="uw-activity";var n=document.createElement("div");return n.className="markdown-body",n.innerHTML=to(t),e.appendChild(n),this._messagesEl.appendChild(e),this._messagesEl.scrollTop=this._messagesEl.scrollHeight,e};C.prototype._addMessage=function(t,e){this._emptyEl&&this._emptyEl.parentNode&&(this._emptyEl.parentNode.removeChild(this._emptyEl),this._emptyEl=null);var n=document.createElement("div");n.className="uw-msg "+e;var o=document.createElement("div");return o.className="markdown-body",o.innerHTML=to(t),n.appendChild(o),this._messagesEl.appendChild(n),this._messagesEl.scrollTop=this._messagesEl.scrollHeight,n};C.prototype._loadHistory=function(){var t=this;if(!this.conversationId)return Promise.resolve();this._historyLoaded=!1;var e=this._baseUrl+"/widget/conversations/"+this.conversationId+"/messages?embed_key="+encodeURIComponent(this.embedKey);return fetch(e).then(function(n){if(!n.ok)throw new Error("History fetch failed: "+n.status);return n.json()}).then(function(n){var o=n.messages||[];o.forEach(function(i){if(i.message_type==="activity"||i.sender_type==="system")t._addActivity(i.content);else{var a=i.sender_type==="contact"?"contact":"agent";t._addMessage(i.content,a)}}),t._historyLoaded=!0}).catch(function(n){t._emit("error",n)})};C.prototype._subscribeSSE=function(){if(this.conversationId&&!this._eventSource){var t=this,e=this._baseUrl+"/widget/conversations/"+this.conversationId+"/sse?embed_key="+encodeURIComponent(this.embedKey);this._eventSource=new EventSource(e),this._eventSource.addEventListener("message",function(n){try{var o=JSON.parse(n.data);o.message_type==="activity"||o.sender_type==="system"?(t._addActivity(o.content),t._emit("message",o)):o.sender_type!=="contact"&&(t._addMessage(o.content,"agent"),t._emit("message",o))}catch(i){}}),this._eventSource.addEventListener("error",function(){})}};C.prototype._unsubscribeSSE=function(){this._eventSource&&(this._eventSource.close(),this._eventSource=null)};C.prototype.identify=function(t,e){var n=this;return!t||!e?Promise.reject(new Error("userId and userHash required")):fetch(this._baseUrl+"/widget/"+this.inbox+"/identify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embed_key:this.embedKey,source_id:this.sourceId,new_user_id:t,user_hash:e})}).then(function(o){if(!o.ok)throw new Error("Identify failed: "+o.status);return o.json()}).then(function(o){return n._unsubscribeSSE(),n.conversationId=o.conversation_id,n.sourceId=o.source_id,localStorage.setItem(Ht,o.conversation_id),localStorage.setItem(Ft,o.source_id),n._clearMessages(),n._loadHistory().then(function(){n._subscribeSSE()}),n._emit("identified",{conversation_id:o.conversation_id,source_id:o.source_id}),o}).catch(function(o){throw n._emit("error",o),o})};C.prototype._clearMessages=function(){this._messagesEl.innerHTML="",this._emptyEl=document.createElement("div"),this._emptyEl.className="uw-empty",this._emptyEl.textContent="No messages yet",this._messagesEl.appendChild(this._emptyEl)};C.prototype.on=function(t,e){this._callbacks[t]||(this._callbacks[t]=[]),this._callbacks[t].push(e)};C.prototype.destroy=function(){if(!this._destroyed){this._destroyed=!0,this._unsubscribeSSE(),this._onVVResize&&window.visualViewport&&(window.visualViewport.removeEventListener("resize",this._onVVResize),window.visualViewport.removeEventListener("scroll",this._onVVResize));var t=document.getElementById("unichat-widget");t&&t.parentNode&&t.parentNode.removeChild(t);var e=$e.indexOf(this);if(e!==-1&&$e.splice(e,1),$e.length===0){var n=document.getElementById("unichat-widget-styles");n&&n.parentNode&&n.parentNode.removeChild(n)}}};C.prototype._emit=function(t,e){var n=this._callbacks[t];if(n)for(var o=0;o<n.length;o++)n[o](e)};function eo(){for(var t=document.getElementsByTagName("script"),e=0;e<t.length;e++){var n=t[e],o=n.getAttribute("data-inbox"),i=n.getAttribute("data-embed-key");if(o&&i){var a=n.getAttribute("data-base-url")||"",d=new C({inbox:o,embedKey:i,baseUrl:a});return $e.push(d),d}}}window.UnichatWidget={init:function(t){var e=new C(t);return $e.push(e),e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",eo):eo();})();
