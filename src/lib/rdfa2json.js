import arrayify from '$lib/arrayify.js'
import { JSDOM } from 'jsdom'
const DOMParser = new JSDOM().window.DOMParser

export const rdfa2json = (htmlString) => {
  const parser = new DOMParser()

  let html = parser
    .parseFromString(htmlString, "text/html")
  // console.log(html)
  // console.log(html.innerHTML)
  const propertyNodes = [
    ...html.querySelectorAll('[property]'),
    ...html.querySelectorAll('[rel]'),
    ...html.querySelectorAll('[data-rel]')
  ]
  // console.log(propertyNodes)

  let predicates = propertyNodes
    .map(node => {
      let rel = {}
      let p = node.getAttribute("property") || node.getAttribute('rel') || node.getAttribute('data-rel')
      let o = (node.getAttribute('href') || node.textContent.trim())
      rel[p] = o
      return rel
    })

  const predicateMap = new Map(predicates.map(rel => Object.keys(rel)))

  predicates.forEach(rel => {
    let p = Object.keys(rel)[0]
    let cur = Object.values(rel)[0]
    let acc = predicateMap.get(p)
    let pushO = acc
      ? [...arrayify(acc), cur]
      : cur
    predicateMap.set(p, pushO)
  })

  const rels = Object.fromEntries(predicateMap)

  return rels
}