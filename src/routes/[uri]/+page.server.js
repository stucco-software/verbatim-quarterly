import { getIssue } from '$lib/content.js'

export const csr = false

export const load = async ({params}) => {
  const issue = await getIssue(params.uri)
  return {
    issue
  }
}