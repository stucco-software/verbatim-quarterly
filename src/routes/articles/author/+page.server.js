import { getArticles } from '$lib/content.js'

export const csr = false
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','N/A']
const articlesMap = new Map([
   ['A', []],
   ['B', []],
   ['C', []],
   ['D', []],
   ['E', []],
   ['F', []],
   ['G', []],
   ['H', []],
   ['I', []],
   ['J', []],
   ['K', []],
   ['L', []],
   ['M', []],
   ['N', []],
   ['O', []],
   ['P', []],
   ['Q', []],
   ['R', []],
   ['S', []],
   ['T', []],
   ['U', []],
   ['V', []],
   ['W', []],
   ['X', []],
   ['Y', []],
   ['Z', []],
   ['N/A', []],
])

const byAuthorAsc = (a, b) => {
  if (a.author < b.author) {
    return -1;
  }
  if (a.author > b.author) {
    return 1;
  }
  return 0;
}

const sortTerm = 'author'

const findLetter = (term, i = 0) => {
  let hunt = true
  if (!term) {
    return 'N/A'
  }
  let test = term
        .charAt(i)
        .toUpperCase()
  let found = articlesMap.has(test)
  if (found) {
    return test
  } else {
    return findLetter(term, i + 1)
  }
}

export const load = async ({params}) => {
  const articles = await getArticles()
  articles.forEach(article => {
    let term = article[sortTerm]
    let pos = findLetter(term)
    let arr = articlesMap.get(pos)
    articlesMap.set(pos, [...arr, {
      title: article.title,
      uri: article.uri,
      author: article.author,
      partOf: article.partOf
    }])
  })

  articlesMap.forEach((val, key, map) => {
    const sorted = val.toSorted(byAuthorAsc)
    map.set(key, sorted)
  })

  const arr = [...articlesMap]
  return {
    articles: arr,
    letters
  }
}