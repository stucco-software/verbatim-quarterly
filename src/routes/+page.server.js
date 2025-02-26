import { getVolumes, getRandomArticle } from '$lib/content.js'

export const load = async () => {
  const volumes = await getVolumes()
  const article = await getRandomArticle()
  return {
    volumes,
    article
  }
}