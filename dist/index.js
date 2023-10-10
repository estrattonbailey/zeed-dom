import {
  CDATA,
  SELF_CLOSING_TAGS,
  VDocType,
  VDocument,
  VDocumentFragment,
  VElement,
  VHTMLDocument,
  VNode,
  VNodeQuery,
  VTextNode,
  createDocument,
  createHTMLDocument,
  document,
  escapeHTML,
  h2 as h,
  hArgumentParser,
  hFactory,
  hasOwn,
  html,
  markup,
  removeBodyContainer,
  unescapeHTML
} from "./chunk-63NT5R63.js";

// src/htmlparser.ts
var attrRe = /([^=\s]+)(\s*=\s*(("([^"]*)")|('([^']*)')|[^>\s]+))?/gm;
var endTagRe = /^<\/([^>\s]+)[^>]*>/m;
var startTagRe = /^<([^>\s\/]+)((\s+[^=>\s]+(\s*=\s*(("[^"]*")|('[^']*')|[^>\s]+))?)*)\s*\/?\s*>/m;
var selfCloseTagRe = /\s*\/\s*>\s*$/m;
var HtmlParser = class {
  constructor(options = {}) {
    this.attrRe = attrRe;
    this.endTagRe = endTagRe;
    this.startTagRe = startTagRe;
    this.defaults = { ignoreWhitespaceText: false };
    if (options.scanner)
      this.scanner = options.scanner;
    this.options = Object.assign({}, this.defaults, options);
  }
  parse(html2) {
    let treatAsChars = false;
    let index, match, characters;
    while (html2.length) {
      if (html2.substring(0, 4) === "<!--") {
        index = html2.indexOf("-->");
        if (index !== -1) {
          this.scanner.comment(html2.substring(4, index));
          html2 = html2.substring(index + 3);
          treatAsChars = false;
        } else {
          treatAsChars = true;
        }
      } else if (html2.substring(0, 2) === "</") {
        match = this.endTagRe.exec(html2);
        if (match) {
          html2 = RegExp.rightContext;
          treatAsChars = false;
          this.parseEndTag(RegExp.lastMatch, match[1]);
        } else {
          treatAsChars = true;
        }
      } else if (html2.charAt(0) === "<") {
        match = this.startTagRe.exec(html2);
        if (match) {
          html2 = RegExp.rightContext;
          treatAsChars = false;
          this.parseStartTag(RegExp.lastMatch, match[1], match);
        } else {
          treatAsChars = true;
        }
      }
      if (treatAsChars) {
        index = html2.indexOf("<");
        let offset = index;
        if (index === 0) {
          index = html2.substring(1).indexOf("<");
          offset = offset + 1;
        }
        if (index === -1) {
          characters = html2;
          html2 = "";
        } else {
          characters = html2.substring(0, offset);
          html2 = html2.substring(offset);
        }
        if (!this.options.ignoreWhitespaceText || !/^\s*$/.test(characters))
          this.scanner.characters(characters);
      }
      treatAsChars = true;
      match = null;
    }
  }
  parseStartTag(input, tagName, match) {
    const isSelfColse = selfCloseTagRe.test(input);
    let attrInput = match[2];
    if (isSelfColse)
      attrInput = attrInput.replace(/\s*\/\s*$/, "");
    const attrs = this.parseAttributes(tagName, attrInput);
    this.scanner.startElement(tagName, attrs, isSelfColse, match[0]);
  }
  parseEndTag(input, tagName) {
    this.scanner.endElement(tagName);
  }
  parseAttributes(tagName, input) {
    const attrs = {};
    input.replace(this.attrRe, (...m) => {
      var _a, _b;
      const [_attr, name, _c2, value, _c4, valueInQuote, _c6, valueInSingleQuote] = m;
      attrs[name] = (_b = (_a = valueInSingleQuote != null ? valueInSingleQuote : valueInQuote) != null ? _a : value) != null ? _b : true;
      return void 0;
    });
    return attrs;
  }
};

// src/vdomparser.ts
function vdom(obj = null) {
  if (obj instanceof VNode)
    return obj;
  if (obj instanceof Buffer)
    obj = obj.toString("utf-8");
  if (typeof obj === "string")
    return parseHTML(obj);
  return new VDocumentFragment();
}
function parseHTML(html2) {
  if (typeof html2 !== "string") {
    console.error("parseHTML requires string, found", html2);
    throw new Error("parseHTML requires string");
  }
  const frag = html2.indexOf("<!") === 0 ? new VHTMLDocument(true) : new VDocumentFragment();
  const stack = [frag];
  const parser = new HtmlParser({
    // the for methods must be implemented yourself
    scanner: {
      startElement(tagName, attrs, isSelfClosing) {
        const lowerTagName = tagName.toLowerCase();
        if (lowerTagName === "!doctype") {
          frag.docType = new VDocType();
          return;
        }
        for (const name in attrs) {
          if (hasOwn(attrs, name)) {
            const value = attrs[name];
            if (typeof value === "string")
              attrs[name] = unescapeHTML(value);
          }
        }
        const parentNode = stack[stack.length - 1];
        if (parentNode) {
          const element = document.createElement(tagName, attrs);
          parentNode.appendChild(element);
          if (!(SELF_CLOSING_TAGS.includes(tagName.toLowerCase()) || isSelfClosing))
            stack.push(element);
        }
      },
      endElement(_tagName) {
        stack.pop();
      },
      characters(text) {
        var _a;
        text = unescapeHTML(text);
        const parentNode = stack[stack.length - 1];
        if (((_a = parentNode == null ? void 0 : parentNode.lastChild) == null ? void 0 : _a.nodeType) === VNode.TEXT_NODE) {
          parentNode.lastChild._text += text;
        } else {
          if (parentNode)
            parentNode.appendChild(new VTextNode(text));
        }
      },
      comment(_text) {
      }
    }
  });
  parser.parse(html2);
  return frag;
}
VElement.prototype.setInnerHTML = function(html2) {
  const frag = parseHTML(html2);
  this._childNodes = frag._childNodes;
  this._fixChildNodesParent();
};

// src/tidy.ts
var SELECTOR_BLOCK_ELEMENTS = "meta,link,script,p,h1,h2,h3,h4,h5,h6,blockquote,div,ul,ol,li,article,section,footer,head,body,title,nav,section,article,hr,form";
var TAGS_KEEP_CONTENT = ["PRE", "CODE", "SCRIPT", "STYLE", "TT"];
function level(element) {
  let indent = "";
  while (element.parentNode) {
    indent += "  ";
    element = element.parentNode;
  }
  return indent.substr(2);
}
function tidyDOM(document2) {
  document2.handle(SELECTOR_BLOCK_ELEMENTS, (e) => {
    var _a, _b, _c, _d, _e, _f;
    let ee = e;
    while (ee) {
      if (TAGS_KEEP_CONTENT.includes(ee.tagName))
        return;
      ee = ee.parentNode;
    }
    const prev = e.previousSibling;
    if (!prev || prev.nodeType !== VNode.TEXT_NODE || !((_a = prev.nodeValue) == null ? void 0 : _a.endsWith("\n")))
      (_b = e.parentNode) == null ? void 0 : _b.insertBefore(new VTextNode("\n"), e);
    (_c = e.parentNode) == null ? void 0 : _c.insertBefore(new VTextNode(level(e)), e);
    const next = e.nextSibling;
    if (!next || next.nodeType !== VNode.TEXT_NODE || !((_d = next.nodeValue) == null ? void 0 : _d.startsWith("\n"))) {
      if (next)
        (_e = e.parentNode) == null ? void 0 : _e.insertBefore(new VTextNode("\n"), next);
      else
        (_f = e.parentNode) == null ? void 0 : _f.appendChild(new VTextNode("\n"));
    }
    if (e.childNodes.length) {
      const first = e.firstChild;
      if (first.nodeType === VNode.TEXT_NODE)
        e.insertBefore(new VTextNode(`
${level(e)}  `));
      e.appendChild(new VTextNode(`
${level(e)}`));
    }
  });
}

// src/xml.ts
function xml(itag, iattrs, ...ichildren) {
  const { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
  return markup(true, tag, attrs, children);
}
xml.firstLine = '<?xml version="1.0" encoding="utf-8"?>';
xml.xml = true;

// src/manipulate.ts
function handleHTML(html2, handler) {
  const document2 = parseHTML(html2);
  handler(document2);
  return document2.render();
}
export {
  CDATA,
  VDocType,
  VDocument,
  VDocumentFragment,
  VElement,
  VHTMLDocument,
  VNode,
  VNodeQuery,
  VTextNode,
  createDocument,
  createHTMLDocument,
  document,
  escapeHTML,
  h,
  hArgumentParser,
  hFactory,
  handleHTML,
  hasOwn,
  html,
  parseHTML,
  removeBodyContainer,
  tidyDOM,
  unescapeHTML,
  vdom,
  xml
};
//# sourceMappingURL=index.js.map