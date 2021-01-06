/*jshint esversion: 6 */
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const sprintf = require("sprintf-js").sprintf;
const fs = require("fs");
const csv = require("csv-parser");
const json2html = require("node-json2html");
const stripBom = require('strip-bom-stream');

const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'show help',
  },
  {
    name: 'log',
    alias: 'l',
    type: String,
    description: 'specify chatlog file.',
  }
];

const sections = [
  {
    header: 'ChatLog Preview Maker',
    content: 'convert chatlog csv file to html.'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

if (!options.log) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

const rulea = {
  clMes: "訪問者発言",
  botMes: "ボット発言"
};

const HEADER = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>chatbot preview</title>
<style>
.like,.dislike {
	border: 1px solid #ccc;
	padding: 20px;
	margin-bottom: 10px;
    display:flex;
    flex-wrap: wrap
}
.bot-0 {
	display: none;
	background-color: #EDEDED;
	color: #999;
}
.name { font-size: 1.2rem; margin: 10px 0; width: 100%; order:1;}
.remarks { display: none;}
.rule {
	margin : 0 0 0 5%;
    width: 45%;
    order: 3;
}
.rulea {
	list-style: none;
	padding : 0 1rem;
	background-color : #CDF;
	margin: 0;
}
.rulea li {
	padding: 4px;
}
.text, .text_select {
	border-radius: 6px;
	position: relative;
	display: inline-block;
	margin: .5rem 5rem .5rem 15px;
	padding: 1rem;
	min-width: 120px;
	max-width: 100%;
	color: #555;
	background: #fff;
	width: 20rem;
}
.text:before, .text_select:before {
	content: "";
	position: absolute;
	top: 50%;
	left: -30px;
	margin-top: -15px;
	border: 15px solid transparent;
	border-right: 15px solid #fff;
}
.btMes, .btMes p {
	margin: 0 0 1rem 0;
	padding: 0;
}
.chat {
  padding:10px;
  background: #7494c0;
  overflow: hidden;
  max-width: 400px;
  margin: 0px auto;
  font-size: 80%;
}
.chat .user .at {
  text-align: right;
}
.chatwindow {
	background-color: #F3F3F3;
    width: 80%;
    order: 2;
  padding: 10px;
  overflow: hidden;
  line-height: 135%;
  border-radius: 6px;
  margin-bottom: 10px;
}
.chat .user .chatwindow {
  margin-left: auto;
  margin-right: 0;
}
.agentName, .categoryName, .goal, .chatTags, .customeField, .memo, .visitorTags {
  display: none;
}
.ctext,
.url,
.status {
	display: block;
	font-size:1rem;
	width: 18rem;
	background-color: #3da5d1;
	border-radius: 4px;
	text-decoration: none;
	padding: 4px 10px;
	margin: 0 0 4px 0;
	color: #FFF;
}
label, input, button, textarea {
	font-size: 1rem;
	margin: 6px 0 6px 15px;
	width: 20rem;
}
.click_count, .pv_count, .withdrawal_rate {
  padding: 3px 6px;
  margin-right: 8px;
  margin-left: 1px;
  font-size: 75%;
  color: white;
  border-radius: 6px;
  box-shadow: 0 0 3px #ddd;
  white-space: nowrap;
}
.click_count { background-color: #ad4040;}
a span.click_count { border-radius: 12px; width:12px; height:18px; display: inline-block; text-align:center;}
.pv_count {  background-color: #33F; }
.withdrawal_rate { background-color: #3CC; }.ranking li {
  display: block;
  width: 90%;
  height: 1rem;
  overflow: hidden;
  padding-top: 4px;
}
.to-top{
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 30px;
  right: 0;
  bottom: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background: #000;
  cursor: pointer;
}
.to-top a{
  color: #fff;
  text-decoration: none;
}
</style>
</head>
<body>
`;

const FOOTER = `
<script>
document.addEventListener("click", function(e) {
  const target = e.target;
  // clickした要素がclass属性、ctextを含まない場合は処理を中断
  if (!target.classList.contains("ctext")) return;
  e.preventDefault();
  history.pushState(null, null, target.hash );
  const targetId = decodeURI(target.hash.substr(1));
  const targetElement = document.getElementById(targetId);
  // 画面上部から要素までの距離
  const rectTop = targetElement.parentNode.parentNode.parentNode.getBoundingClientRect().top;
  // 現在のスクロール距離
  const offsetTop = window.pageYOffset;
  // スクロール位置に持たせるバッファ
  const buffer = 10;
  const top = rectTop + offsetTop - buffer;

  window.scrollTo(0, top);
});
</script>
<script>
document.getElementById("ranking_wrapper").style.display ="none";
function toggleRanking(){
	const p1 = document.getElementById("ranking_wrapper");
	if(p1.style.display=="block"){
		p1.style.display ="none";
	}else{
		p1.style.display ="block";
	}
}
function displayAll () {
  document.getElementById("ranking_wrapper").style.display ="none";
  const haslogs = document.getElementsByClassName('haslog');
  for (var i = 0; i<haslogs.length;i++) {
    haslogs[i].style.display = "block";
  }
}
function displayNoLog () {
  document.getElementById("ranking_wrapper").style.display ="none";
  const haslogs = document.getElementsByClassName('haslog');
  for (var i = 0; i<haslogs.length;i++) {
    haslogs[i].style.display = "none";
  }
}
</script>
<div class="to-top"><a href="#">TOP</a></div>
</body>
</html>
`;

function parseCPText(s) {
  s = s.replace(
    /\[\[(?:(cpb|cpu|cplink="[^"]+"|cplink_target="[^"]+"|cpsize="[^"]+")[;:]){1,}([^\[]+)\]\]/g,
    function (match, cp, s) {
      let prefix = "";
      let postfix = "";
      tags = cp.split(";");
      for (var i = 0; i < tags.length; i++) {
        if ((tel = /cplink=["']tel:([0-9\-]+)["']/.exec(tags[i]))) {
          prefix = '<a href="tel:' + tel[1] + '">' + prefix;
          postfix += "</a>";
        } else if ((link = /cplink=["']([^"']+)["']/.exec(tags[i]))) {
          prefix = '<a href="' + link[1] + '">' + prefix;
          postfix += "</a>";
        } else if ((link = /cplink_target=["']([^"']+)["']/.exec(tags[i]))) {
          prefix = '<a href="' + link[1] + '" target="link">' + prefix;
          postfix += "</a>";
        } else if (tags[i] === "cpb") {
          prefix = "<strong>" + prefix;
          postfix += "</strong>";
        } else if (tags[i] === "cpu") {
          prefix = "<u>" + prefix;
          postfix += "</u>";
        } else if ((font = /cpsize=["']([0-9]+)px["']/.exec(tags[i]))) {
          let rem = 20 / font[1];
          prefix = '<span style="font-size:' + rem + 'rem">' + prefix;
          postfix += "</span>";
        } else {
          console.log("tag:", tags[i]);
        }
      }
      return prefix + s + postfix;
    }
  );
  s = s.replace(/\\r\\n/g, "<br>");
  s = s.replace(/\n/g,"<br>");
  return s.replace(/(\r\n)/g, "<br>");
}


const transforms = {
  text: {
    "<>": "div",
    class: "text",
    html: function (obj, index) {
      return '<p class="btMes">' + parseCPText(obj.value) + "</p>";
    }
  },
  chat: {
    "<>": "div",
    class: "chatwindow",
    html: function (obj, index) {
      return '<p class="btMes">特定ルールを実行: <a href="#id' + obj.value + '">ID:' + parseCPText(obj.value) + "</a></p>";
    }
  },
  chatlog: {
    "<>": "div",
    class: function() { if(this.evaluation === '良くなかった') { return "log-wrapper dislike"} else { return "log-wrapper like"} },
    html: [
      {
        "<>": "div",
        class: "log",
        html: [
          { "<>": "div", class: "chatId", id: 'id${chatId}', text: 'ID:${chatId}' },
          { "<>": "div", class: "siteName", text: 'SITE:${siteName}' },
          { "<>": "div", class: "pageUrl", text: 'URL:${pageUrl}' },
          { "<>": "div", class: "startedDatetime", text: 'START:${startedDatetime}' },
          { "<>": "div", class: "endedDatetime", text: 'END:${endedDatetime}' },
          { "<>": "div", class: "agentName", text: 'AGENT:${agentName}' },
          { "<>": "div", class: "categoryName", text: 'CATEGORY:${categoryName}' },
          { "<>": "div", class: "customeField", text: 'CUSTOM FIELD:${customeField}' },
          { "<>": "div", class: "evaluation", text: 'EVALUATION:${evaluation}' },
          { "<>": "div", class: "goal", text: 'GOAL:${goal}' },
          { "<>": "div", class: "chatTags", text: 'CHAT TAG:${chatTags}' },
          { "<>": "div", class: "memo", text: 'MEMO:${memo}' },
          { "<>": "div", class: "visitorTags", text: 'VISITOR TAG:${visitorTags}' },
          {
            "<>": "div",
            class: "chat",
            html: function (obj, index) {
              const regex = /\[(.+)? (\d\d:\d\d:\d\d)\]/gi;
              const message = obj.body.replace(regex, function(match){
                if ( arguments[1] === undefined ) {
                  whoClass = "user";
                  whoDisplay = "user"
                }else if ( arguments[1] == KenpoName ) {
                  whoClass = "bot"
                  whoDisplay = arguments[1]
                } else{
                  whoClass = "user"
                  whoDisplay = arguments[1]
                }
                return '</div></div><div class="' + whoClass + '"><div class="at">' + whoDisplay + ' at ' + arguments[2] + '</div><div class="chatwindow">'
              });
              return parseCPText(message.replace(/^<\/div><\/div>/,"")) + "</div></div>";
            }
          }
        ]
      }
    ]
  }
};

const log = [];
const OUTPUT = "log.html"
const KenpoName = "日本マクドナルド健康保険組合"

fs.createReadStream(options.log)
  .pipe(stripBom())
  .pipe(csv({

  }))
  .on('data', (data) => log.push(data))
  .on('end', () => {

    const log_html = json2html.transform(log, transforms.chatlog);

    fs.writeFileSync(OUTPUT, HEADER);
    fs.appendFileSync(OUTPUT, "<div>[Log]" + options.log + "</div>");
    fs.appendFileSync(OUTPUT, log_html);
    fs.appendFileSync(OUTPUT, FOOTER);
  });

