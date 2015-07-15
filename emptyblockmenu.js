import {defineOption} from "../edit"
import {elt} from "../edit/dom"
import {resolvePath} from "../edit/selection"
import {Debounced} from "../util/debounce"
import insertCSS from "insert-css"

import {MenuDefinition} from "./define"
import {openMenu} from "./tooltip-menu"

import "./icons_css"

const classPrefix = "ProseMirror-emptyblockmenu"

defineOption("emptyBlockMenu", false, function(pm, value) {
  if (pm.mod.emptyBlockMenu)
    pm.mod.emptyBlockMenu.detach()
  if (value)
    pm.mod.menu = new EmptyBlockMenu(pm, value)
})

import {BlockTypeItem, LiftItem, WrapItem, InsertBlockItem} from "./menuitem"

export const items = new MenuDefinition

items.addItem(new LiftItem("dedent"))

items.addItem(new WrapItem("list-ol", "Wrap in ordered list", "ordered_list"))
items.addItem(new WrapItem("list-ul", "Wrap in bullet list", "bullet_list"))
items.addItem(new WrapItem("quote-left", "Wrap in blockquote", "blockquote"))

items.addSub("heading", {icon: "header", title: "Heading"})
for (let i = 1; i <= 6; i++)
  items.addItem(new BlockTypeItem("" + i, "Heading " + i, "heading", {level: i}),
                {submenu: "heading"})
items.addItem(new BlockTypeItem("paragraph", "Normal paragraph", "paragraph"))
items.addItem(new BlockTypeItem("code", "Code block", "code_block"))

items.addItem(new InsertBlockItem("minus", "Horizontal rule", "horizontal_rule"))

class EmptyBlockMenu {
  constructor(pm, config) {
    this.pm = pm

    this.debounced = new Debounced(pm, 100, () => this.update())
    pm.on("selectionChange", this.updateFunc = () => this.debounced.trigger())
    pm.on("change", this.updateFunc)

    this.menuItems = config && config.items || items.getItems()
    this.node = pm.wrapper.appendChild(elt("div", {class: classPrefix}))
    this.shown = false
  }

  detach() {
    this.debounced.clear()
    this.hide()

    this.pm.off("selectionChange", this.updateFunc)
    this.pm.off("change", this.updateFunc)
  }

  update() {
    let sel = this.pm.selection
    if (!sel.empty || this.pm.doc.path(sel.head.path).content.length)
      this.hide()
    else
      this.show(sel.head.path)
  }

  hide() {
    if (this.shown) {
      this.node.style.display = ""
      this.shown = false
    }
  }

  show(path) {
    let targetRect = resolvePath(this.pm.content, path).getBoundingClientRect()
    let outerRect = this.pm.content.getBoundingClientRect()
    let node = this.node
    node.style.top = (targetRect.top - outerRect.top) + "px"
    node.style.left = (targetRect.left - outerRect.left) + "px"
    openMenu({
      close() {},
      show(_id, dom) { node.textContent = ""; node.appendChild(dom) }
    }, this.menuItems, this.pm)
    node.style.display = "block"
    this.shown = true
  }
}

insertCSS(`
.ProseMirror-emptyblockmenu {
  position: absolute;
  color: #ccc;
  padding-left: 20px;
  display: none;
}
`)
