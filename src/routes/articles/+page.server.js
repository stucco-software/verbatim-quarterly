import { getArticles } from '$lib/content.js'

export const load = async ({params}) => {
  const articles = await getArticles()
  return {
    articles
  }
}