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

// Index
const roman2arabic = s => {
  const map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000};
  return [...s].reduce((r,c,i,s) => map[s[i+1]] > map[c] ? r-map[c] : r+map[c], 0);
}

const isRomanLocation = (segment) => {
  return segment.startsWith('X.') || segment.startsWith('XX') || segment.startsWith('XV') || segment.startsWith('XI') || segment.startsWith('V.') || segment.startsWith('VI') || segment.startsWith('I.')
}

const convertLocation = (indexMap) => (segment, ll) => {
  if (isRomanLocation(segment)) {
    let locationSections = segment.split('.')
    let volume = roman2arabic(locationSections[0])
    let issue = locationSections[1]
    let location = `v${volume}_${issue}.md`
    let term = ll
      .replaceAll('*', '')
      .replaceAll(',"', '",')
      .split(', ')
      .filter(segment => !isRomanLocation(segment))
      .join(', ')
    let extantTermsAtLocation = indexMap.get(location) || []
    indexMap.set(location, [...extantTermsAtLocation, term])
  }
}

const processLine = (ll, convertFn) => {
  ll
    .replaceAll('*', '')
    .replaceAll(',"', '",')
    .split(', ')
    .map(segment => convertFn(segment, ll))
  return ll
}

const breakToLocations = (data) => {
  let indexMap = new Map()
  let convertFn = convertLocation(indexMap)
  let lls = data
    .split('\n')
    .filter(ll => ll.length > 0)
    .map(ll => processLine(ll, convertFn))
  console.log(`index of ${[...indexMap.keys()].length} locations`)
  return indexMap
}

const getIndex = async () => {
  console.log(`Parse index into data structure:`)
  const data = await fs.readFile('vb_index.md', "binary")
  let index = breakToLocations(data)
  return index
}
// EndIndex

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
    case title.textContent.includes('Crossword Puzzle Answers'):
      linkNode.href = 'PuzzleSolution'
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
  if (typeof authorLine !== "string") {
    authorLine = authorLine.firstChild
  }
  let segments = authorLine.textContent.split(', ')
  let author = segments.shift()
  let location = segments.join(', ')
  authorLine.innerHTML = `<span data-rel="author">${author}</span> <span data-rel="location">${location}</span>`
  return doc
}

const associateIndexTerms = (doc, index) => {
  console.log(`search for index terms in article…`)
//   var idx = lunr(function () {
//     this.ref('name')
//     this.field('text')
//
//     this.add({
//       name: `article`,
//       text: doc.body.innerHTML
//     })
//   })
  let found = []
  let not = 0
  index.forEach(term => {
    term = term.replaceAll(':', ' ')
    let exactMatch = doc.body.innerHTML.includes(` ${term} `) || doc.body.innerHTML.includes(`>${term}<`)
    if (exactMatch) {
      found.push(term)
      if (term === 'd-CON') {
        var count = (doc.body.innerHTML.match(/mythical/g) || []).length;
        console.log(term, count)
      }
    } else {
      not++
    }
    // let result
    // try {
    //   result = idx.search(term)
    // } catch (e) {}
    // if (result && result.length > 0 && result[0].score > 0.8) {
    //   console.log(term)
    //   console.log(result[0].score)
    // }
  })
  console.log(`naive match found ${found.length}, leaving ${not}`)
  console.log(found)
  return doc
}

const enrichArticle = (content, index) => {
  let doc = parser
    .parseFromString(content, "text/html")
  doc = enrichTitle(doc)
  doc = enrichType(doc)
  doc = enrichAuthor(doc)
  console.log(`-------------`)
  return doc
}

const addMeta = (issue, count, index) => async (content, i) => {
  console.log(`Add metadata to: ${issue}.${i}`)
  if (i > 0) {
    content = enrichArticle(content, index)
  }
  if (i === 20) {
    associateIndexTerms(content, index)
  }
  return content
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
  let newFileName = `${issueSeg[0]}_${i}.html`
  let result
  if (content.body) {
    result = await fs.writeFile(newFileName, content.body.innerHTML)
  }
  return result
}

const run = async (issue) => {
  let start = new Date()
  const total_index = await getIndex()
  const index = total_index.get(issue)
  const articles = await parseIssueToArticles(issue)
  // Any work with the raw MD happens here
  // …
  const htmls = await asyncMap(articles, markdown2html)
  // any work with the HTML happens here
  const withMetaData = await asyncMap(htmls, addMeta(issue, articles.length, index))

  const errors = await asyncMap(withMetaData, writeFile(issue))
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