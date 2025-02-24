import { getGraph } from '$lib/content.js'

export const load = async () => {
  const graph = await getGraph()
  return {
    "volumes": [
      {title: "Volume I", issues: [{id: "uri", title: "Vol I No. 1"},{id: "uri", title: "Vol I No. 2"},{id: "uri", title: "Vol I No. 3"},{id: "uri", title: "Vol I No. 4"},]}
    ]
  }
}