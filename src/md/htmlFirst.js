import { promises as fs } from "fs"
import lunr from 'lunr'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkAttr from 'remark-attr'
import bracketedSpans from 'remark-bracketed-spans'
import {unified} from 'unified'
import { JSDOM } from 'jsdom'

const window = new JSDOM().window
const DOMParser = window.DOMParser
const parser = new DOMParser()

const asyncMap = async (arr, fn) => await Promise.all(arr.map(fn))
const arrayify = target => Array.isArray(target) ? target : [target]

const parseIssueToArticles = async (src) => {
  const data = await fs.readFile(src, "binary")
  console.log(src)
  console.log(`-------`)
  let articles = data
    .split('##')
    .map(article => `#${article}`)
  console.log(`${articles.length} Articles`)
  return articles
}

const enrichTitle = doc => {
  let title = doc.querySelector('h1') || doc.querySelector('h2')
  title.dataset.rel = "title"
  return doc
}

const enrichType = doc => {
  let title = doc.querySelector('h1') || doc.querySelector('h2')

  const linkNode = doc.createElement("link")
  linkNode.rel = 'type'

  const firstNode = doc.body.firstChild
  switch (true) {
    case title.textContent.includes('SIC!'):
      linkNode.href = 'SicSicSic'
      break;
    case title.textContent.includes('OBITER DICTA'):
      linkNode.href = 'ObiterDicta'
      break;
    case title.textContent.includes('BIBLIOGRAPHIA'):
      linkNode.href = 'Bibliographia'
      break;
    case title.textContent.includes('Paring Pairs'):
      linkNode.href = 'Puzzle'
      break;
    case title.textContent.includes('Crossword'):
      linkNode.href = 'Crossword'
      break;
    case title.textContent.includes('EPISTOLA'):
      linkNode.href = 'Epistola'
      break;
    case title.textContent.includes('Crossword Puzzle Answers'):
      linkNode.href = 'CrosswordSolution'
      break;
    default:
      linkNode.href = 'Article'
  }
  doc.body.insertBefore(linkNode, firstNode)
  return doc
}

const enrichAuthor = doc => {
  let articleType = doc.querySelector("link[href=Article]")
  if (!articleType) {
    return doc
  }
  let title = doc.querySelector('h1')
  let authorLine = title.nextElementSibling
  if (!authorLine) {
    return doc
  }
  if (typeof authorLine !== "string") {
    authorLine = authorLine.firstChild
  }
  let segments = authorLine.textContent.split(', ')
  let author = segments.shift()
  let location = segments.join(', ')
  authorLine.innerHTML = `<span data-rel="author">${author}</span> <span data-rel="location">${location}</span>`
  return doc
}

const enrichEpistola = doc => {
  let articleType = doc.querySelector("link[href=Epistola]")
  if (!articleType) {
    return doc
  }
  let title = doc.querySelector('h1')

  title.innerHTML = title.innerHTML
    .replaceAll('{', '<span data-rel="contributor">')
    .replaceAll('}', '</span>')
  return doc
}

const enrichArticle = (content) => {
  let doc = parser
    .parseFromString(content, "text/html")
  doc = enrichTitle(doc)
  doc = enrichType(doc)
  doc = enrichAuthor(doc)
  doc = enrichEpistola(doc)
  console.log(`-------------`)
  return doc
}

const addMeta = (issue, count) => async (content, i) => {
  console.log(`Add metadata to: ${issue}.${i + 1}`)
  content = enrichArticle(content)
  return content
}

export const rdfa2json = (html) => {
  const propertyNodes = [
    ...html.querySelectorAll('[property]'),
    ...html.querySelectorAll('[rel]'),
    ...html.querySelectorAll('[data-rel]')
  ]

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
  let preview = [...html.querySelector('body').children]
    .slice(0, 6)
    .map(node => node.outerHTML)
    .join(' ')

  rels.html = html.body.innerHTML
  rels.preview = preview

  return rels
}

const markdown2html = async (md) => {
  const result = await unified()
    .use(remarkParse)
    .use(bracketedSpans)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md)
  return result.value
}

const writeFile = (issue) => async (content, i) => {
  let issueSeg = issue.split('.')
  let newFileName = `${issueSeg[0]}_${i + 1}.html`
  let txt
  if (content.body) {
   txt = content.body.innerHTML
     .replaceAll('â', ' ')
  }

  let result
  if (content.body) {
    result = await fs.writeFile(newFileName, txt)
  }
  return result
}

const convertIssueHeader = (iss, src, numArticles) => {
  let srcSegments = src.split('_')
  let vol = srcSegments[0].split('v')[1]
  let num = srcSegments[1].split('.')[0]
  let articles = [... new Array(numArticles)]
    .map((a, i) => src.replace(`.md`, `_${i+1}`))
  let json = {
    type: "Issue",
    volume: vol,
    number: num,
    hasPart: articles
  }

  let raw = iss
    .replaceAll(`#---`, '')
    .replaceAll(`---`, '')

  let lls = raw
    .split('\n')
    .filter(ll => ll.length > 1)
  let kvs = lls
    .map(ll => ll.split(': '))
  kvs.forEach(ll => {
    let key = ll[0]
    let val = ll[1]
    json[key] = val
  })
  return json
}

const html2json = (article) => {
  let json = rdfa2json(article)
  console.log(json)
  return json
}

const writeJson = (issue) => async (article, i) => {
  let issueSeg = issue.split('.')
  let newFileName = `${issueSeg[0]}_${i + 1}.json`
  const articleErr = await fs.writeFile(newFileName, JSON.stringify(article, null, 2))
  return articleErr
}

const run = async (issue) => {
  let start = new Date()

  const articles = await parseIssueToArticles(issue)
  const iss = articles.shift()

  // Any work with the raw MD happens here
  // …
  const htmls = await asyncMap(articles, markdown2html)
  // any work with the HTML happens here
  const withMetaData = await asyncMap(htmls, addMeta(issue, articles.length))

  const issJSON = convertIssueHeader(iss, issue, articles.length)
  const errors = await asyncMap(withMetaData, writeFile(issue))
  const articleJSONs = await asyncMap(withMetaData, html2json)
  const jsonErrs = await asyncMap(articleJSONs, writeJson(issue))

  const issueError = await fs.writeFile(issue.replace(".md", ".json"), JSON.stringify(issJSON, null, 2))

  let uniq = [...new Set(errors)]
  if (uniq[0]) {
    console.log(`ERRORS:`)
  // //   uniqe
  } else {
    let now = new Date()
    console.log(`Completed in ${now - start}ms`)
  }
}

run(process.argv[2])