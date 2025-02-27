import * as pagefind from "pagefind"
import { promises as fs } from "fs"
import asyncMap from "./src/lib/asyncMap.js"
import terms from "./src/lib/index.json" with { type: "json" }
import { JSDOM } from 'jsdom'

const DOMParser = new JSDOM().window.DOMParser

const parser = new DOMParser()

const readFile = async (filename) => {
  const data = await fs.readFile(`src/md/${filename}`, "binary")
  const json = JSON.parse(data)
  json.uri = filename.replace('.json', '')
  return json
}

const listDir = async () => {
  try {
    return await fs.readdir('src/md')
  } catch (err) {
    console.error('Error occurred while reading directory:', err)
  }
}

const getGraph = async () => {
  let files = await listDir()
  let filenames = files
    .filter(filename => filename.endsWith('.json'))
  let jsons = await asyncMap(filenames, readFile)
  return jsons
}

const indexNode = (index) => async (node) => {
  let seg = node.uri.split('_')
  let url = `/${seg[0]}_${seg[1]}#${seg[2]}`
  let html = parser
    .parseFromString(node.html, "text/html")
  return await index.addCustomRecord({
      url: url,
      content: html.body.textContent,
      language: "en",
      meta: {
        title: node.title,
        category: node.type
      }
  })
}

const indexGraph = async () => {
  const { index } = await pagefind.createIndex()
  const nodes = await getGraph()
  console.log(index)
  console.log(nodes.length, 'articles, issues and volumes')
  console.log(terms.collects.length, 'indexed terms')

  let content = nodes
    .filter(node => node.type !== "Issue" && node.type !== "Volume")

  let result = await asyncMap(content, indexNode(index))
  let errors = result.map(r => r.error)
  console.log(`errors?`)
  console.log(errors)
  let writeResult = await index.writeFiles({
    outputPath: "./static"
  })
  console.log(writeResult)
}

const run = async () => {
  let start = new Date()
  console.log(`Building seach index binaries…`)
  await indexGraph()
  let now = new Date()
  console.log(`Completed in ${now - start}ms`)
}

run()