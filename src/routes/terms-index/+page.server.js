import { getIndex } from '$lib/content.js'

export const load = async ({params}) => {
  console.log('get index…')
  const index = await getIndex()
  return {
    index
  }
}