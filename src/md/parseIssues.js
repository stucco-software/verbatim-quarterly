import { promises as fs } from "fs"
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkAttr from 'remark-attr'
import bracketedSpans from 'remark-bracketed-spans'
import {unified} from 'unified'

const asyncMap = async (arr, fn) => await Promise.all(arr.map(fn))

// thx stackoverflow
// https://stackoverflow.com/questions/48946083/convert-roman-number-to-arabic-using-javascript
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
  // console.log(`----`)
  // console.log(cleanLine)
  return ll
}

const breakToLocations = (data) => {
  let indexMap = new Map()
  console.log(indexMap)
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



const associateIndexTerms = (index) => (src, txt) => {
  console.log('Find terms in src:', src)
  let terms = index.get(src)
  let found = []
  let remaining = []
  console.log(`${terms.length} terms…`)
  terms.forEach(term => {
    if (txt.includes(` ${term} `)) {
      found.push(term)
      // let uuid = crypto.randomUUID()
      // console.log(`[${term}]{data-rel="indexical" id=${uuid}}`)
      // txt = txt.replace(` ${term} `, ` [${term}]{data-rel="indexical" id=${uuid}} `)
    } else {
      remaining.push(term)
    }
    // let term_lower = term.toLowerCase()
    // if(!txt_lower.includes(term_lower)) {
    //   console.log('cant find term', term)
    // }
    // txt.replace(term, `${term}{data-rel="indexicalTerm"}`)
  })
  console.log(`naive match on`, found.length)
  console.log(`leaving`, remaining.length)
  // let lls = index.split('\n')
  return txt
}



const parseIssueToArticles = async (index, src) => {
  const data = await fs.readFile(src, "binary")
  console.log(src)

  console.log(`-------`)
  console.log(`Add index data and anchors now plz`)
  const indexed = associateIndexTerms(index)(src, data)
  console.log(`-------`)

  let articles = indexed.split('##')
  console.log(`${articles.length} Articles`)
  return articles
}

const isSicSicSic = title => title.includes('SIC!')
const isBibliographia = title => title.includes('BIBLIOGRAPHIA')
const isObiterDicta = title => title.includes('OBITER DICTA')

const enrichTitle = content => {
  content = content.replaceAll('<', '&lt;')
  content = content.replaceAll('>', '&gt;')
  let lls = content.split('\n')
  let title = lls[0]

  if (!isBibliographia(title)) {
    lls[0] = `##${title}{data-rel="title"}`
  }

  if (isBibliographia(title)) {
    let seg = title.split('BIBLIOGRAPHIA: ')
    let sub = seg[1]
    lls[0] = `### BIBLIOGRAPHIA: {data-rel="title"}`
    lls.splice(1, 0, `${sub}{data-rel="references"}`)
  }


  if (!isBibliographia(title) && !isSicSicSic(title)) {
    let authorLine = lls[1]
    let seg = authorLine.split(', ')
    let author = seg[0]
    let location = seg[1]
    if (author) {
      author = author.replaceAll('*', '')
      lls[1] = `*${author}{data-rel="author"}`
    }
    if (location) {
      location = location.replaceAll('*', '')
      lls.splice(2, 0, `*[${location}]{data-rel="location"}*`)
    }
  }
  let type
  if (isBibliographia(title)) {
    type = 'Bibliographia'
  } else if (isSicSicSic(title)) {
    type = 'SicSicSic'
  } else if (isObiterDicta(title)) {
    type = 'ObiterDicta'
  } else {
    type = 'Article'
  }
  let parsedContent = lls.join('\n')
  return `---
type: ${type}
---
${parsedContent}`
}

const addMeta = (issue, count) => async (content, i) => {
  if (i > 0) {
    content = enrichTitle(content)
  } else {
    let keyVal = content.replaceAll(`---`, '')
    let articles = [...new Array(count)]
    let articleSlugs = articles
      .map((str, i) => `  - ${issue.split('.')[0]}_${i}`)
      .join('\n')
    content = `---
${keyVal}type: Issue
contains:${articleSlugs}
---`
  }
  return content
}

const markdown2html = async (md) => {
  const html = await unified()
    .use(remarkParse)
    .use(bracketedSpans)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md)
  return html
}

const writeFile = (issue) => async (content, i) => {
  let issueSeg = issue.split('.')
  // let newFileName = `${issueSeg[0]}_${i}.${issueSeg[1]}`
  // let result = await fs.writeFile(newFileName, content)
  let result = await markdown2html(content)
  console.log(result)
  return result
}

const run = async (issue) => {
  let start = new Date()
  // const data = await fs.readFile(issue, "binary")
  // let words = data
  //   .normalize()
  //   .replaceAll('*', '')
  //   .replaceAll(',', '')
  //   .replaceAll('"', '')
  //   .replaceAll('.', '')
  //   .replaceAll(';', '')
  //   .replaceAll('&rdquo', '')
  //   .replaceAll('&ldquo', '')
  //   .split('\n')
  //   .map(lls => lls.split(' '))
  //   .flat()
  // let uniq_words = [...new Set(words)]
  // console.log(uniq_words)
  const index = await getIndex()
  const articles = await parseIssueToArticles(index, issue)
  const withMetaData = await asyncMap(articles, addMeta(issue, articles.length))
  const errors = await asyncMap(withMetaData, writeFile(issue))
  let uniq = [...new Set(errors)]
  if (uniq[0]) {
    console.log(`ERRORS:`)
  //   uniqe
  } else {
    let now = new Date()
    console.log(`Completed in ${now - start}ms`)
  }
}

run(process.argv[2])