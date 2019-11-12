/*jshint esversion: 6 */
const sprintf = require("sprintf-js").sprintf;
const fs = require("fs");
const csv = require("csvtojson");
var json2html = require("node-json2html");

let json = fs.readFileSync("chatplus-chatbotplusrules-11111907.json");
const data = JSON.parse(json);

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
}
.bot-0 {
	background-color: #EDEDED;
	color: #999;
}
.name { font-size: 1.2rem; margin: 0;}
.remarks { display: none;}
.rule {
	margin : 0;
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
.text_select {
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
.text_select:before {
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
	padding: 20px;
}
.ctext,
.url {
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
</style>
<script src="node_modules/@glidejs/glide/dist/glide.min.js"></script>
</head>
<body>
`;

FOOTER = `
<script>
new Glide('.glide').mount()
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
        if (tags[i] === "cpb") {
          prefix = "<strong>" + prefix;
          postfix += "</strong>";
        } else if (tags[i] === "cpu") {
          prefix = "<u>" + prefix;
          postfix += "</u>";
        } else if ((tel = /cplink=["']tel:([0-9\-]+)["']/.exec(tags[i]))) {
          prefix = '<a href="tel:' + tel[1] + '">' + prefix;
          postfix += "</a>";
        } else if ((link = /cplink_target=["']([^"']+)["']/.exec(tags[i]))) {
          prefix = '<a href="' + link[1] + '" target="link">' + prefix;
          postfix += "</a>";
        } else if ((font = /cpsize=["']([0-9]+)px["']/.exec(tags[i]))) {
          let rem = 20 / font[1];
          prefix = '<span style="font-size:' + rem + 'rem">' + prefix;
          postfix += "</span>";
        } else {
          console.log("tag;", tags[i]);
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
        console.log(obj[2]);
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
        if (type === "ctext") {
          options += sprintf(
            '<a class="ctext" href="#%s">%s</a>',
            label,
            label
          );
        } else if (type === "url") {
          let target = "self";
          if (obj.options[i].same_tab === "false") {
            target = "link";
          }
          options += sprintf(
            '<a class="url" target="%s" href="%s">%s</a>',
            target,
            obj.options[i].value,
            label
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
      } else {
        console.log(obj.type);
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
          { "<>": "h2", class: "name", text: "ID:${id} ${name}" },
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

var chatbotplus_html = json2html.transform(data, transforms.chatbotplus);

fs.writeFileSync("preview.html", HEADER);
fs.appendFileSync("preview.html", chatbotplus_html);

/*
csv()
  .fromFile("chatplus-chatbotrules-11101752.csv")
  .then(bot => {
    const chatbot_html = json2html.transform(bot, transforms.chatbot);
    fs.appendFileSync("preview.html", chatbot_html);
    return chatbot_html;
  });
*/
//console.log(html)
fs.appendFileSync("preview.html", FOOTER);