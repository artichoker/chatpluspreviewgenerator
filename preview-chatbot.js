/*jshint esversion: 6 */
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const sprintf = require("sprintf-js").sprintf;
const fs = require("fs");
const csv = require("csv-parser");
var json2html = require("node-json2html");

const optionDefinitions = [
  {
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

const sections = [
  {
    header: 'ChatPlus Preview Maker',
    content: 'convert chatbotplus json file to html to preview the all bots.'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
];

const options = commandLineArgs(optionDefinitions);

if(options.help) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

if(!options.file) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

if(!options.log) {
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
label, input, button, textarea {
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
a span.click_count { border-radius: 12px; width:12px; height:18px; display: inline-block; text-align:center;}
.pv_count {  background-color: #33F; }
.withdrawal_rate { background-color: #3CC; }
</style>
<script src="node_modules/@glidejs/glide/dist/glide.min.js"></script>
</head>
<body>
`;

FOOTER = `
<script>
new Glide('.glide').mount()
</script>
<script>
document.addEventListener("click", function(e) {
  const target = e.target;
  // clickした要素がclass属性、ctextを含まない場合は処理を中断
  if (!target.classList.contains("ctext")) return;
  e.preventDefault();
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
    /\[\[(?:(cpb|cpu|cplink="[^"]+"|cplink_target="[^"]+"|cpsize="[^"]+")[;:]){1,}([^\[]+)\]\]/g,
    function(match, cp, s) {
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
  s = s.replace(/\\r\\n/g,"<br>");
  return s.replace(/(\r\n)/g, "<br>");
}
const transforms = {
  rulea: {
    "<>": "ul",
    class: "rulea",
    html: function(obj, index) {
      if (rulea[obj[2]]) {
      } else {
        console.log("rulea:", obj[2]);
      }
      return sprintf(
        '<li id="%s">[%s] %s %s 「%s」</li>',
        obj[4],
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
        let label = obj.options[i].label;
        let click_count = obj.options[i].click_count || "-";
        if (type === "ctext") {
          options += sprintf(
            '<a class="ctext" href="#%s">%s <span class="click_count">%s</span></a>',
            label,
            label,
            click_count
          );
        } else if (type === "url") {
          let target = "self";
          if (obj.options[i].same_tab === "false") {
            target = "link";
          }
          options += sprintf(
            '<a class="url" target="%s" href="%s">%s <span class="click_count">%s</span></a>',
            target,
            obj.options[i].value,
            label,
            click_count
          );
        } else if (type === "status") {
          options += sprintf(
            '<a class="status" href="#%s">%s <span class="click_count">%s</span></a>',
            label,
            label,
            click_count
          );
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
      } else {
        console.log("type:", obj.type);
      }
    }
  },
  chatbotplus: {
    "<>": "div",
    class: "bot",
    html: [
      {
        "<>": "div",
        class: "bot-${use_flg}",
        html: [
          { "<>": "h2", class: "name", id: "id${id}",  text: "ID:${id} ${name}" },
          { "<>": "div", class: "pv_count", text: "起動回数: ${pv_count}"},
          { "<>": "div", class: "click_count", text: "クリック数: ${click_count}"},
          { "<>": "div", class: "withdrawal_rate", text: "離脱率: ${withdrawal_rate}%"},
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
              if( obj.click_log.length > 0){
                var n = (Object.keys(obj.click_log[0]).length - 7) / 2
                if (n > 0){
                  obj.action.forEach(element => {
                    if(element.type === "text_select"){
                      element.value.options.forEach(opt =>{
                        for( var i = 1; i <= n; i++){
                          let aname = "a" + i + "_name"
                          let acount = "a" + i + "_click"
                          if( obj.click_log[0][aname] === opt.label ){
                            opt.click_count = obj.click_log[0][acount]
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
      }
    ]
  },
  chatbot: {
    "<>": "div",
    class: "bot",
    html: [
      {
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
      }
    ]
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

      for (var i = 1; ; i++) {
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
	  for (var i=0;i<rules.length;i++) {
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
        ael.click_count     = log.filter(log => (log.id == ael.id && log.type === '2')).map(log => log.click_count),
        ael.pv_count        = log.filter(log => (log.id == ael.id && log.type === '2')).map(log => log.pv_count),
        ael.withdrawal_rate = log.filter(log => (log.id == ael.id && log.type === '2')).map(log => Math.round(log.withdrawal_rate * 1000) / 10),
        ael.click_log       = log.filter(log => (log.id == ael.id && log.type === '2')).map(log => log),
        ael));
    //console.log(result)

    var chatbotplus_html = json2html.transform(data, transforms.chatbotplus);
    fs.writeFileSync("preview.html", HEADER);
    fs.appendFileSync("preview.html", chatbotplus_html);
    fs.appendFileSync("preview.html", FOOTER);
  });
  
