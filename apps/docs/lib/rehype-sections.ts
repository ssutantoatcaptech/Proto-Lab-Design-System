import type { Element, ElementContent, Root, RootContent } from "hast"

// Wraps the intro and each h2 with everything up to the next h2 in a
// <section>, so every section renders as its own card.
export function rehypeSections() {
  return (tree: Root) => {
    const out: RootContent[] = []
    let current: Element | null = null
    const open = () => {
      current = { type: "element", tagName: "section", properties: {}, children: [] }
      out.push(current)
      return current
    }
    for (const node of tree.children) {
      const isH2 = node.type === "element" && node.tagName === "h2"
      const blank = node.type === "text" && !node.value.trim()
      if (isH2 || (!current && !blank)) open()
      if (current) (current as Element).children.push(node as ElementContent)
      else out.push(node)
    }
    tree.children = out
  }
}
