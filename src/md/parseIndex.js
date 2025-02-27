import { promises as fs } from "fs"
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeAttr from 'rehype-attr'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkAttr from 'remark-attr'
import bracketedSpans from 'remark-bracketed-spans'
import {unified} from 'unified'

const asyncMap = async (arr, fn) => await Promise.all(arr.map(fn))


const markdown2html = async (md) => {
  const result = await unified()
    .use(remarkParse)
    .use(bracketedSpans)
    .use(remarkRehype)
    .use(rehypeAttr)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md)
  return result.value
}

// Index
const roman2arabic = s => {
  const map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000};
  return [...s].reduce((r,c,i,s) => map[s[i+1]] > map[c] ? r-map[c] : r+map[c], 0);
}

const isRomanLocation = (segment) => {
  return segment.startsWith('X.') || segment.startsWith('XX') || segment.startsWith('XV') || segment.startsWith('XI') || segment.startsWith('V.') || segment.startsWith('VI') || segment.startsWith('I.')
}

const convertFn = (ll) => {
  const llwlink = ll
    .split(', ')
    .map(segment => {
      if (isRomanLocation(segment)) {
        let locationSections = segment.split('.')
        let volume = roman2arabic(locationSections[0])
        let issue = locationSections[1]
        let location = `v${volume}_${issue}`
        segment = `[${locationSections[0]}.${locationSections[1]}](/${location})`
      }
      return segment
    })
    .join(', ')
  // if (isRomanLocation(segment)) {
  //   let locationSections = segment.split('.')
  //   let volume = roman2arabic(locationSections[0])
  //   let issue = locationSections[1]
  //   let location = `v${volume}_${issue}`
  //   let term = ll
  //     .replaceAll('*', '')
  //     .replaceAll(',"', '",')
  //     .split(', ')
  //     .filter(segment => !isRomanLocation(segment))
  //     .join(', ')
  // }
  // return {
  //   term,
  //   location
  // }
  return llwlink
}


const processLine = (ll) => {
  ll
    .replaceAll(',"', '",')
  return convertFn(ll)
}

const processIndex = async (data) => {
  let lls = data
    .split('\n')
    .filter(ll => ll.length > 0)
    .map(processLine)
  let llsHTML = await asyncMap(lls, markdown2html)
  return llsHTML
}

const getIndex = async () => {
  console.log(`Parse index into data structure:`)
  const raw = await fs.readFile('vb_index.md', "binary")
  const data = await processIndex(raw)
  console.log(data)
  const index = data.map((html, i) => {
    return {
      type: "Term",
      uri: `i${i}`,
      html: html
    }
  })
  return index
}

const writeJson = async (data) => {
  let newFileName = `index.json`
  const jsonErr = await fs.writeFile(newFileName, JSON.stringify(data, null, 2))
  return jsonErr
}

const run = async () => {
  let start = new Date()
  const terms = await getIndex()
  const index = {
    type: "Index",
    uri: "term-index",
    collects: terms,
  }
  console.log(index)
  const errors = await writeJson(index)
  let uniq = [...new Set(errors)]
  if (uniq[0]) {
    console.log(`ERRORS:`)
  //   uniqe
  } else {
    let now = new Date()
    console.log(`Completed in ${now - start}ms`)
  }
}

run()