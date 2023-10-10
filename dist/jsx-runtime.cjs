"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/jsx-runtime.ts
var jsx_runtime_exports = {};
__export(jsx_runtime_exports, {
  h: () => h,
  jsx: () => h,
  jsxDEV: () => h,
  jsxs: () => h
});
module.exports = __toCommonJS(jsx_runtime_exports);

// src/h.ts
function hArgumentParser(tag, attrs, ...children) {
  if (typeof tag === "object") {
    tag = "fragment";
    children = tag.children;
    attrs = tag.attrs;
  }
  if (Array.isArray(attrs)) {
    children = [attrs];
    attrs = {};
  } else if (attrs) {
    if (attrs.attrs) {
      attrs = { ...attrs.attrs, ...attrs };
      delete attrs.attrs;
    }
  } else {
    attrs = {};
  }
  return {
    tag,
    attrs,
    children: typeof children[0] === "string" ? children : children.flat(Number.POSITIVE_INFINITY)
  };
}

// src/utils.ts
var object = {};
var hasOwnProperty = object.hasOwnProperty;
function hasOwn(object2, propertyName) {
  return hasOwnProperty.call(object2, propertyName);
}

// src/encoding.ts
function escapeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

// src/html.ts
var SELF_CLOSING_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "command"
];
function markup(xmlMode, tag, attrs = {}, children) {
  const hasChildren = !(typeof children === "string" && children === "" || Array.isArray(children) && (children.length === 0 || children.length === 1 && children[0] === "") || children == null);
  const parts = [];
  tag = tag.replace(/__/g, ":");
  if (tag !== "noop" && tag !== "") {
    if (tag !== "cdata")
      parts.push(`<${tag}`);
    else
      parts.push("<![CDATA[");
    for (let name in attrs) {
      if (name && hasOwn(attrs, name)) {
        const v = attrs[name];
        if (name === "html")
          continue;
        if (name.toLowerCase() === "classname")
          name = "class";
        name = name.replace(/__/g, ":");
        if (v === true) {
          parts.push(` ${name}`);
        } else if (name === "style" && typeof v === "object") {
          parts.push(
            ` ${name}="${Object.keys(v).filter((k) => v[k] != null).map((k) => {
              let vv = v[k];
              vv = typeof vv === "number" ? `${vv}px` : vv;
              return `${k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${vv}`;
            }).join(";")}"`
          );
        } else if (v !== false && v != null) {
          parts.push(` ${name}="${escapeHTML(v.toString())}"`);
        }
      }
    }
    if (tag !== "cdata") {
      if (xmlMode && !hasChildren) {
        parts.push(" />");
        return parts.join("");
      } else {
        parts.push(">");
      }
    }
    if (!xmlMode && SELF_CLOSING_TAGS.includes(tag))
      return parts.join("");
  }
  if (hasChildren) {
    if (typeof children === "string") {
      parts.push(children);
    } else if (children && children.length > 0) {
      for (let child of children) {
        if (child != null && child !== false) {
          if (!Array.isArray(child))
            child = [child];
          for (const c of child) {
            if (c.startsWith("<") && c.endsWith(">") || tag === "script" || tag === "style")
              parts.push(c);
            else
              parts.push(escapeHTML(c.toString()));
          }
        }
      }
    }
  }
  if (attrs.html)
    parts.push(attrs.html);
  if (tag !== "noop" && tag !== "") {
    if (tag !== "cdata")
      parts.push(`</${tag}>`);
    else
      parts.push("]]>");
  }
  return parts.join("");
}
function html(itag, iattrs, ...ichildren) {
  const { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
  return markup(false, tag, attrs, children);
}
var htmlVDOM = markup.bind(null, false);
html.firstLine = "<!DOCTYPE html>";
html.html = true;
var h = html;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  h,
  jsx,
  jsxDEV,
  jsxs
});
//# sourceMappingURL=jsx-runtime.cjs.map