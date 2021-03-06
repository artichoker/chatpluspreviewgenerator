/*jshint esversion: 6 */
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const sprintf = require("sprintf-js").sprintf;
const fs = require("fs");
const csv = require("csv-parser");
var json2html = require("node-json2html");

const optionDefinitions = [{
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'show help',
    },
    {
        name: 'file',
        alias: 'f',
        type: String,
        description: 'chatplus json file.',
    },
    {
        name: 'log',
        alias: 'l',
        type: String,
        description: 'chatplus csv log file.',
    }
];

const sections = [{
        header: 'ChatPlus Preview Maker',
        content: 'convert chatbotplus json file to html to preview the all bots.'
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

if (!options.file) {
    const usage = commandLineUsage(sections);
    console.log(usage);
    process.exit(0);
}

if (!options.log) {
    //const usage = commandLineUsage(sections);
    //console.log(usage);
    //process.exit(0);
    options.log = "empty-chatlog.csv"
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
<link rel="stylesheet" href="node_modules/@glidejs/glide/dist/css/glide.core.min.css">
<link rel="stylesheet" href="node_modules/@glidejs/glide/dist/css/glide.theme.min.css">
<style>
.bot-0,.bot-1 {
	border: 1px solid #ccc;
	padding: 20px;
	margin-bottom: 10px;
    display:flex;
    flex-wrap: wrap
}
.bot-0 {
	/*display: none;*/
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
.chatwindow {
	background-color: #F3F3F3;
    width: 50%;
    order: 2;
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
label, input, button, textarea, select, .textform-text {
	font-size: 1rem;
	margin: 6px 0 6px 15px;
	width: 20rem;
}
.glide__arrow {
	color: #FFF;
	background-color: #999;
	width: 2rem;
	margin: 0;
	border-radius: 0;
	font-size: 2rem;
	padding: 20px 0;
}
.glide__slide {
	border: 1px solid #999;
	border-radius: 14px;
	background-color: #fff;
}
.glide__slide p {
	margin: 0 4rem;
	margin-bottom: 1rem;
}
.glide__slide a {
	margin: 0 4rem;
	margin-bottom: 1rem;
	width: 75%;
	text-align: center;
}
.glide__slide img {
	margin: 0 9px;
	padding: 0;
}
.glide__arrow--left { left: 0; text-align: center; border-left: none; margin-left: 1px; }
.glide__arrow--right { right: 0; text-align: center; border-right: none; margin-right: 1px;}
.glide__bullets { bottom: 0;}
.glide__bullet--active,
.glide__bullet { background-color: #ccc; }
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
a span.click_count { border-radius: 12px; width:24px; height:18px; display: inline-block; text-align:center;}
.pv_count {  background-color: #33F; }
.withdrawal_rate { background-color: #3CC; }.ranking li {
  display: block;
  width: 90%;
  height: 1rem;
  overflow: hidden;
  padding-top: 4px;
}
.ranking ol {
  counter-reset:number; /*数字をリセット*/
  list-style-type: none!important; /*数字を一旦消す*/
  padding:0.5em;
  border: dashed 1px gray;
}
.ranking ol li {
  position: relative;
  line-height: 1.5em;
  padding: 0.5em 0.5em 0.5em 30px;
}
.ranking ol li:nth-child(even) {
  background-color: #F3F3F3;
}
.ranking ol li .pv_count {
  display: inline-block;
  width: 25px;
  height: 1rem;
  text-align: center;
  line-height: 1rem;
}
.ranking ol li a {
  text-decoration: none;
  color: #333;
}
.ranking ol li:before{
  /* 以下数字をつける */
  position: absolute;
  counter-increment: number;
  content: counter(number);
  /*数字のデザイン変える*/
  display:inline-block;
  background: #74c2f8;
  color: white;
  font-family: 'Avenir','Arial Black','Arial',sans-serif;
  font-weight:bold;
  font-size: 15px;
  left: 0;
  width: 25px;
  height: 25px;
  line-height: 25px;
  text-align: center;
  /*以下上下中央寄せのため*/
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-29%);
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
<script src="node_modules/@glidejs/glide/dist/glide.min.js"></script>
</head>
<body>
<div>
<button id="btnAll"  onclick="displayAll()">全件表示</button>
<button id="btnRank" onclick="toggleRanking()">起動回数ランキング</button>
<button id="zero_pv" onclick="displayNoLog()">起動回数ゼロ</button>
</div>
`;

const FOOTER = `
<script>
new Glide('.glide').mount()
</script>
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

const GLIDE_ARROWS = `
<div class="glide__arrows" data-glide-el="controls">
<button class="glide__arrow glide__arrow--left" data-glide-dir="<">&laquo;</button>
<button class="glide__arrow glide__arrow--right" data-glide-dir=">">&raquo;</button>
</div>
`;

function parseCPText(s) {
    s = s.replace(
        /\[\[(?:(cpb|cpu|cplink="[^"]+"|cplink_target="[^"]+"|cpsize="[^"]+"|cpbgcolor="[^"]+")[;:]){1,}([^\[]+)\]\]/g,
        function(match, cp, s) {
            let prefix = "";
            let postfix = "";
            tags = cp.split(";");
            for (var i = 0; i < tags.length; i++) {
                if ((tel = /cplink=["']tel:([0-9\-]+)["']/.exec(tags[i]))) {
                    prefix = '<a href="tel:' + tel[1] + '">' + prefix;
                    postfix += "</a>";
                } else if ((bgcolor = /cpbgcolor=["']([^"']+)["']/.exec(tags[i]))) {
                    prefix = '<span style="background-color=' + bgcolor[1] + '">' + prefix;
                    postfix += "</span>";
                } else if ((link = /cplink=["']([^"']+)["']/.exec(tags[i]))) {
                    let strLink = link[1].replace(/[ 📥✏🏪↩📄]+/g,"");
                    prefix = '<a href="' + strLink + '">' + prefix;
                    postfix += "</a>";
                } else if ((link = /cplink_target=["']([^"']+)["']/.exec(tags[i]))) {
                    let strLink = link[1].replace(/[ 📥✏🏪↩📄]+/g,"");
                    prefix = '<a href="' + strLink + '" target="link">' + prefix;
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
    return s.replace(/(\r\n)/g, "<br>");
}
const transforms = {
    rulea: {
        "<>": "ul",
        class: "rulea",
        html: function(obj, index) {
            if (rulea[obj[2]]) {} else {
                console.log("rulea:", obj[2]);
            }
            let strId = obj[4].replace(/[ 📥✏🏪↩📄]+/g,"");
            return sprintf(
                '<li id="%s">[%s] %s %s 「%s」</li>',
                strId,
                obj[1],
                rulea[obj[2]],
                obj[3],
                obj[4]
            );
        }
    },
    textform: {
        "<>": "div",
        class: "textform",
        html: function(obj, index) {
            let elements = "";
            for (var i = 0; i < obj.elements.length; i++) {
                let name = obj.elements[i].name;
                let type = obj.elements[i].type;
                let label = obj.elements[i].label;
                let options = obj.elements[i].options;
                let required = obj.elements[i].required == 1 ? " required" : "";
                if (type == "textform") {
                    elements +=
                        '<div><label for="' + name + '">' + label + "</label></div>";
                    elements +=
                        '<input type="text" id="' +
                        name +
                        '"' +
                        required +
                        ' placeholder="' +
                        options[0] +
                        '">';
                } else if (type == "text") {
                    elements +=
                        '<div><strong class="textform-text">' + label + "</strong></div>";
                } else if (type == "select") {
                    elements +=
                        '<div><label for="' + name + '">' + label + "</label></div>";
                    elements += "<select>"
                    for (var n = 0; n < options.length; n++) {
                        elements +=
                            '<option>' + options[n] + "</option>";
                    }
                    elements += "</select>"
                } else if (type == "textform_email") {
                    elements +=
                        '<div><label for="' + name + '">' + label + "</label></div>";
                    elements +=
                        '<input type="email" id="' +
                        name +
                        '"' +
                        required +
                        ' placeholder="' +
                        options[0] +
                        '">';
                } else if (type == "textform_date") {
                    elements +=
                        '<div><label for="' + name + '">' + label + "</label></div>";
                    elements +=
                        '<input type="date" id="' +
                        name +
                        '"' +
                        required +
                        ' placeholder="' +
                        options[0] +
                        '">';
                } else if (type == "textarea") {
                    elements +=
                        '<div><label for="' + name + '">' + label + "</label></div>";
                    elements +=
                        '<textarea id="' +
                        name +
                        '"' +
                        required +
                        ' placeholder="' +
                        options[0] +
                        '"></textarea>';
                } else {
                    console.log("textform:type", type);
                }
            }
            return elements + "<div><button>送信</button></div>";
        }
    },
    text_select: {
        "<>": "div",
        class: "text_select",
        html: function(obj, index) {
            let options = "";
            for (var i = 0; i < obj.options.length; i++) {
                let type = obj.options[i].type;
                let label = obj.options[i].label.replace(/[ 📥✏🏪↩📄]+/g,"");
                let click_count = obj.options[i].click_count || "-";
                let click_count_rate = Math.round((click_count / obj.sum_of_click_count) * 1000) / 10;
                if (type === "ctext") {
                    if(click_count === "-") {
                        options += sprintf(
                            '<a class="ctext" href="#%s">%s</a>',
                            label,
                            label
                        );
                    }else{
                        options += sprintf(
                            '<a class="ctext" href="#%s">%s <span class="click_count">%s</span>(%s%%)</a>',
                            label,
                            label,

                            click_count,
                            click_count_rate
                        );
                    }
                } else if (type === "url") {
                    let target = "self";
                    if (obj.options[i].same_tab === "false") {
                        target = "link";
                    }
                    if(click_count === "-") {
                        options += sprintf(
                            '<a class="url" target="%s" href="%s">%s</a>',
                            target,
                            obj.options[i].value,
                            label
                        );
                    }else{
                        options += sprintf(
                            '<a class="url" target="%s" href="%s">%s <span class="click_count">%s</span>(%s%%)</a>',
                            target,
                            obj.options[i].value,
                            label,
                            click_count,
                            click_count_rate
                        );
                    }
                } else if (type === "status") {
                    if(click_count === "-") {
                        options += sprintf(
                            '<a class="status" href="#%s">%s</a>',
                            label,
                            label,
                        );
                    }else{
                        options += sprintf(
                            '<a class="status" href="#%s">%s <span class="click_count">%s</span>(%s%%)</a>',
                            label,
                            label,
                            click_count,
                            click_count_rate
                        );
                    }
                } else {
                    console.log("text_select:type", type);
                }
            }
            return '<p class="btMes">' + parseCPText(obj.text) + "</p>" + options;
        }
    },
    imagemap: {
        "<>": "div",
        class: "imagemap",
        html: function(obj, index) {
            const scale = 0.5;
            let options = JSON.parse(obj.value);
            let media_id = obj.image.split("/")[6].split(".")[0];
            let map = sprintf('<map name="#%s">', media_id);
            let area = "";
            for (var i = 0; i < options.actions.length; i++) {
                let x1 = parseInt(options.actions[i].area.x, 10);
                let y1 = parseInt(options.actions[i].area.y, 10);
                let x2 = x1 + parseInt(options.actions[i].area.width, 10);
                let y2 = y1 + parseInt(options.actions[i].area.height, 10);
                let t = options.actions[i].text;
                area += sprintf(
                    '<area shape="rect" coords="%d,%d,%d,%d" href="#%s" alt="%s">',
                    x1 * scale,
                    y1 * scale,
                    x2 * scale,
                    y2 * scale,
                    t,
                    t
                );
            }
            map += area + "</map>";
            return (
                sprintf(
                    '<img src="%s" alt="%s" usemap="#%s" width="%d" height="%d">',
                    obj.image,
                    options.altText,
                    media_id,
                    options.baseSize.width * scale,
                    options.baseSize.height * scale
                ) + map
            );
        }
    },
    glide_bullets: {
        "<>": "div",
        class: "glide__bullets",
        "data-glide-el": "controls[nav]",
        html: function(obj, index) {
            let btn = "";
            for (var i = 0; i < obj.images.length; i++) {
                btn += sprintf(
                    '<button class="glide__bullet" data-glide-dir="=%s"></button>',
                    i
                );
            }
            return btn;
        }
    },
    glide_slides: {
        "<>": "ul",
        class: "glide__slides",
        html: function(obj, index) {
            let li = "";
            for (var i = 0; i < obj.images.length; i++) {
                let url = obj.images[i].url;
                let mess = obj.images[i].message;
                let label = obj.images[i].options[0].label;
                li += sprintf(
                    '<li class="glide__slide"><div><img src="%s" alt="%s"></div><p>%s</p><a href="#%s" class="url">%s</a></li>',
                    url,
                    mess,
                    mess,
                    label,
                    label
                );
            }
            return li;
        }
    },
    glide_track: {
        "<>": "div",
        class: "glide__track",
        "data-glide-el": "track",
        html: function(obj, index) {
            return (
                json2html.transform(obj, transforms.glide_slides) +
                json2html.transform(obj, transforms.glide_bullets)
            );
        }
    },
    carousel: {
        "<>": "div",
        class: "glide",
        html: function(obj, index) {
            return json2html.transform(obj, transforms.glide_track) + GLIDE_ARROWS;
        }
    },
    text: {
        "<>": "div",
        class: "text",
        html: function(obj, index) {
            return '<p class="btMes">' + parseCPText(obj.value) + "</p>";
        }
    },
    code: {
        "<>": "div",
        class: "text",
        html: function(obj, index) {
            return '<p class="btMes">スクリプト実行:<pre>' + parseCPText(obj.value) + "</pre></p>";
        }
    },
    status: {
        "<>": "div",
        class: "text",
        html: function(obj, index) {
            return '<p class="btMes">[ステータス変更：' + parseCPText(obj.value) + " ]</p>";
        }
    },
    rule: {
        "<>": "div",
        class: "text",
        html: function(obj, index) {
            return '<p class="btMes">特定ルールを実行: <a href="#id' + obj.value + '">ID:' + parseCPText(obj.value) + "</a></p>";
        }
    },
    action: {
        "<>": "div",
        html: function(obj, index) {
            if (obj.type === "text_select") {
                return json2html.transform(obj.value, transforms.text_select);
            } else if (obj.type === "text") {
                return json2html.transform(obj, transforms.text);
            } else if (obj.type === "textform") {
                return json2html.transform(obj.value, transforms.textform);
            } else if (obj.type === "imagemap") {
                return json2html.transform(obj, transforms.imagemap);
            } else if (obj.type === "carousel") {
                return json2html.transform(obj.value, transforms.carousel);
            } else if (obj.type === "rule") {
                return json2html.transform(obj, transforms.rule);
            } else if (obj.type === "code") {
                return json2html.transform(obj, transforms.code);
            } else if (obj.type === "status") {
                return json2html.transform(obj, transforms.status);
            } else {
                console.log("type:", obj.type);
            }
        }
    },
    chatbotplus: {
        "<>": "div",
        class: function() { if (typeof this.click_log !== 'undefined') { return "bot haslog" } else { return "bot nolog" } },
        html: [{
            "<>": "div",
            class: "bot-${use_flg}",
            html: [
                { "<>": "h2", class: "name", id: "id${id}", text: "ID:${id} ${name}" },
                { "<>": "div", class: "pv_count", text: function() { if (typeof this.click_log !== 'undefined') { return "起動回数: " + this.click_log.pv_count } else { return '-' } } },
                { "<>": "div", class: "click_count", text: function() { if (typeof this.click_log !== 'undefined') { return "クリック数: " + this.click_log.click_count } else { return '-' } } },
                { "<>": "div", class: "withdrawal_rate", text: function() { if (typeof this.click_log !== 'undefined') { return "離脱率: " + Math.round(this.click_log.withdrawal_rate * 1000) / 10 + "%" } else { return '-' } } },
                { "<>": "h3", class: "remarks", text: "${remarks}" },
                {
                    "<>": "div",
                    class: "rule",
                    html: function(obj, index) {
                        return json2html.transform(obj.rulea, transforms.rulea);
                    }
                },
                {
                    "<>": "div",
                    class: "chatwindow",
                    html: function(obj, index) {
                        if (obj.click_log) {
                            var n = (Object.keys(obj.click_log).length - 7) / 2
                            obj.click_log.click_count = 0
                            if (n > 0) {
                                obj.action.forEach(element => {
                                    if (element.type === "text_select") {
                                        element.value.sum_of_click_count = 0
                                        element.value.options.forEach(opt => {
                                            for (var i = 1; i <= n; i++) {
                                                let aname = "a" + i + "_name"
                                                let acount = "a" + i + "_click"
                                                if (obj.click_log[aname] === opt.label) {
                                                    opt.click_count = obj.click_log[acount]
                                                    element.value.sum_of_click_count += parseInt(opt.click_count, 10)
                                                }
                                            }
                                        })
                                    }
                                });
                            }
                        }
                        return json2html.transform(obj.action, transforms.action);
                    }
                }
            ]
        }]
    },
    chatbot: {
        "<>": "div",
        class: "bot",
        html: [{
            "<>": "div",
            class: "bot-1",
            html: [
                { "<>": "h2", class: "name", text: "ID:${#id} チャットボット" },
                {
                    "<>": "div",
                    class: "rule",
                    html: function(obj, index) {
                        return json2html.transform(obj, transforms.rule_simple);
                    }
                },
                {
                    "<>": "div",
                    class: "chatwindow",
                    html: function(obj, index) {
                        return json2html.transform(obj, transforms.chatbot_simple);
                    }
                }
            ]
        }]
    },
    ranking: {
        "<>": "li",
        html: "<span class='pv_count'>${pv_count}</span> ID:${id} <a href='#id${id}'>${name}</a>"
    },
    chatbot_simple: {
        "<>": "div",
        html: function(obj, index) {
            return json2html.transform(obj, transforms.text_select_simple);
        }
    },
    text_select_simple: {
        "<>": "div",
        class: "text_select",
        html: function(obj, index) {
            let options = "";

            for (var i = 1;; i++) {
                if ("ボタン" + i in obj) {
                    let label = obj["ボタン" + i];
                    options += sprintf(
                        '<a class="ctext" href="#%s">%s</a>',
                        label,
                        label
                    );
                } else {
                    break;
                }
            }
            return (
                '<p class="btMes">' +
                parseCPText(obj["チャットボット発言"]) +
                "</p>" +
                options
            );
        }
    },
    rule_simple: {
        "<>": "ul",
        class: "rulea",
        html: function(obj, index) {
            var rules = obj["ユーザの発言が一致"].split("\\r\\n");
            var options = "";
            for (var i = 0; i < rules.length; i++) {
                options += sprintf('<li id="%s">[%s] %s %s 「%s」</li>', rules[i], 'OR', rulea.clMes, '=', rules[i]);
            }
            return options;
        }
    }
};

let json = fs.readFileSync(options.file);
const data = JSON.parse(json);
const log = [];

fs.createReadStream(options.log)
    .pipe(csv())
    .on('data', (data) => log.push(data))
    .on('end', () => {

        const result = Array.from(
            data,
            ael => (
                ael.click_log = log.find(el => (el.id == ael.id && el.type === '2')),
                ael));

        // 初回メッセージを先頭に追加する
        data.unshift(JSON.parse(JSON.stringify(data[0]))); // cloneする
        data[0].click_log = log[0]; // jsonの1番目がはじめの選択肢、csvの１番目が type=3の初回メッセージであることを決め打ちしています
        data[0].id = '0';
        data[0].rulea = []; // 初回メッセージはrulea を空にする

        log.sort(function(a, b) {
            a.pv_count = parseInt(a.pv_count)
            b.pv_count = parseInt(b.pv_count)
            if (a.pv_count > b.pv_count) {
                return -1
            } else {
                return 1;
            }
        })

        log[0].id = '0';
        var ranking_html = json2html.transform(log, transforms.ranking);

        var chatbotplus_html = json2html.transform(data, transforms.chatbotplus);
        fs.writeFileSync("preview.html", HEADER);
        fs.appendFileSync("preview.html", "<div>[Rules]" + options.file + "<br>[Log]" + options.log + "</div>");
        fs.appendFileSync("preview.html", "<div id='ranking_wrapper'><div class='ranking'><ol>" + ranking_html + "</ol></div></div>");
        fs.appendFileSync("preview.html", chatbotplus_html);
        fs.appendFileSync("preview.html", FOOTER);
    });