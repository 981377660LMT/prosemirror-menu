import insertCSS from "insert-css"

insertCSS(`

.ProseMirror-inlinetooltip-linktext a {
  color: white;
  text-decoration: none;
  padding: 0 5px;
}

.ProseMirror-inlinetooltip-linktext a:hover {
  text-decoration: underline;
}

`)
