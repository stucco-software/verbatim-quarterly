import index from '$lib/index.json'
export const csr = false
export const load = async ({params}) => {
  return {
    index
  }
}