import { getArticles } from '$lib/content.js'

export const csr = false

const byTitleAsc = (a, b) => {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
}

const byTitleDsc = (a, b) => a.title + b.title
const byAuthorAsc = (a, b) => a.author - b.author
const byAuthorDsc = (a, b) => a.author + b.author

export const load = async ({params}) => {
  const articles = await getArticles()
  console.log(articles[0].title, articles[1].title)
  const sorted = articles.toSorted(byTitleAsc)
  console.log(sorted[0].title, sorted[1].title)
  return {
    articles: sorted
  }
}