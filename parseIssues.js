import { promises as fs } from "fs"
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkAttr from 'remark-attr'
import remarkGFM from 'remark-gfm'
import bracketedSpans from 'remark-bracketed-spans'
import {unified} from 'unified'
import { JSDOM } from 'jsdom'

const window = new JSDOM().window
const DOMParser = window.DOMParser
const parser = new DOMParser()

const asyncMap = async (arr, fn) => await Promise.all(arr.map(fn))
const arrayify = target => Array.isArray(target) ? target : [target]

const parseIssueToArticles = async (src) => {
  const data = await fs.readFile(`./src/md/canonical/${src}`, "utf8")
  let articles = data
    .split('## ')
    .map(article => `# ${article}`)
  return articles
}

const enrichTitle = (doc, content) => {
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

const enrichAuthor = (doc, content) => {
  let articleType = doc.querySelector("link[href=Article]")
  if (!articleType) {
    return doc
  }
  let title = doc.querySelector('h1') || doc.querySelector('h2')
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
  if (!content) {
    return
  }
  let doc = parser
    .parseFromString(content, "text/html")
  doc = enrichTitle(doc, content)
  doc = enrichType(doc)
  doc = enrichAuthor(doc, content)
  doc = enrichEpistola(doc)
  return doc
}

const addMeta = (issue, count) => async (content, i) => {
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
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGFM)
      .use(bracketedSpans)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(md)
    return result.value
  } catch (e) {
    console.log(`err rendering markdown:`)
    let preview = md.split('\n')[0]
    console.log(preview)
  }

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
  json.title = json.title
    .replaceAll('"', '')
    .replace(' []', '')
  delete json.draft
  delete json.sidebar
  delete json.widgets
  delete json['sidebar-toc']

  switch (true) {
    case json.number === '1':
      json.season = 'Summer'
      break;
    case json.number === '2':
      json.season = 'Autumn'
      break;
    case json.number === '3':
      json.season = 'Winter'
      break;
    case json.number === '4':
      json.season = 'Spring'
      break;
  }

  json.year = parseInt(json.volume) + 1973
  if (json.number === '4') {
    json.year++
  }

  return json
}

const html2json = (article) => {
  if (article) {
    let json = rdfa2json(article)
    return json
  }
}

const writeJson = (issue) => async (article, i) => {
  if (article) {
    let issueSeg = issue.split('.')
    let newFileName = `${issueSeg[0]}_${i + 1}.json`
    const articleErr = await fs.writeFile(`./src/md/${newFileName}`, JSON.stringify(article, null, 2))
    if (articleErr) {
      console.log(`error writing article json:`)
      console.log(articleErr)
    }
  }
}

const listDir = async () => {
  try {
    return await fs.readdir('src/md/canonical')
  } catch (err) {
    console.error('Error occurred while reading directory:', err)
  }
}

const getVol = (filename) => {
  let string = filename
    .replace('v', '')
    .replace('.md', '')
    .split('_')[0]
  return parseInt(string)
}

const getNo = (filename) => {
  let string = filename
    .replace('v', '')
    .replace('.md', '')
    .split('_')[1]
  return parseInt(string)
}

const getIssues = async () => {
  let files = await listDir()
  let filenames = files
    .filter(filename => filename.endsWith('.md'))
    .filter(filename => !filename.startsWith('vb'))
    .sort((a,b) => getVol(a) - getVol(b))
  return filenames
}

const writeVol = async (volume) => {
  const volErr = await fs.writeFile(`./src/md/${volume.uri}.json`, JSON.stringify(volume, null, 2))
  if (volErr) {
    console.log(volErr)
  }
  return volErr
}


const parse = async (issue) => {
  const articles = await parseIssueToArticles(issue)
  const iss = articles.shift()
  const issJSON = convertIssueHeader(iss, issue, articles.length)
  const issueError = await fs.writeFile(`./src/md/${issue.replace(".md", ".json")}`, JSON.stringify(issJSON, null, 2))
  if (issueError) {
    console.log(issueError)
  }

  const htmls = await asyncMap(articles, markdown2html)
  const withMetaData = await asyncMap(htmls, addMeta(issue, articles.length))
  const articleJSONs = await asyncMap(withMetaData, html2json)
  await asyncMap(articleJSONs, writeJson(issue))

}

const run = async (issue) => {
  let start = new Date()

  const volumes = [...new Array(32)]
    .map((v, i) => {
      return {
        type: "Volume",
        uri: `${i}`
      }
    })
  await asyncMap(volumes, writeVol)

  const issues = await getIssues()
  await asyncMap(issues, parse)

  let now = new Date()
  console.log(`Completed in ${now - start}ms`)
}

run()