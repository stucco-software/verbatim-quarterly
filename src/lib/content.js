import { render } from 'svelte/server';
import * as jsonld from 'jsonld'

export const context = {
  "@base": "https://verbatim.stucco.software/",
  "@vocab": "vocabulary#",
  "uri": "@id",
  "type": "@type",
  "title": "title",
  "author": "author",
  "location": "location",
  "html": "html",
  "volume": {
    "@id": "volume",
    "@type": "@id"
  },
  "hasIssue": { "@reverse": "volume" },
  "number": {
    "@id": "number",
    "@type": "@id"
  },
  "year": "year",
  "season": "season",
  "hasPart": {
    "@id": "hasPart",
    "@type": "@id"
  },
  "partOf": { "@reverse": "hasPart" },
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

const resolveJsons = async (iterable) => await Promise.all(
  iterable.map(async ([path, resolver]) => {
    const data = await resolver()
    let segments = path.split('/')
    let filename = segments[segments.length - 1]
    return {
      uri: filename.split('.')[0],
      ...data.default
    }
  })
)

export const getGraph = async () => {
  const jsonFiles = import.meta.glob('../md/*.json')
  const jiterable = Object.entries(jsonFiles)
  const jsons = await resolveJsons(jiterable)
  return {
    "@context": context,
    "@graph": [...jsons]
  }
}

export const getResource = async () => {
  const graph = await getGraph()
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

export const getVolumes = async () => {
  const graph = await getGraph()
  const issues = await frame(graph)({
    "type": "Volume",
    "hasIssue": {}
  })

  delete issues['@context']
  return issues['@graph'] ? issues['@graph'] : [issues]
}