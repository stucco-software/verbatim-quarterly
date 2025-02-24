import { rdfa2json } from '$lib/rdfa2json.js'
import { render } from 'svelte/server';
import * as jsonld from 'jsonld'

export const context = {}

export const getRDFa = (html) => {
  let json = rdfa2json(html)
  return json
}

export const frame = (graph) => async (query) => {
  let f = {
    "@context": context,
    ...query
  }
  if (jsonld.default) {
    return await jsonld.default.frame(graph, f)
  } else {
    return await jsonld.frame(graph, f)
  }
}

const resolveFiles = async (iterable) => await Promise.all(
  iterable.map(async ([path, resolver]) => {
    const data = await resolver()
    // const meta = data.metadata || {}
    // const html = render(data.default).html
    // const rdfa = getRDFa(html)
    // const rels = Object.assign(meta, rdfa)
    let segments = path.split('/')
    let filename = segments[segments.length - 1]
    // filename.split('.')[0]
    return {
      uri: filename.split('.')[0],
    }
  })
)

export const getGraph = async () => {
  const allMdFiles = import.meta.glob('../md/*.html')
  console.log(allMdFiles)
  const iterable = Object.entries(allMdFiles)
  const markdowns = await resolveFiles(iterable)
  console.log(markdowns)
  return markdowns
}

export const getResource = async () => {
  const graph = await getGraph()
  console.log(graph)
  // const resource = await frame(graph)({
  //   "@embed": "@always",
  //   uri: `/${slug}`,
  //   by: {},
  //   prev: {},
  //   contributedTo: {},
  // })
  // return resource
  return graph
}
