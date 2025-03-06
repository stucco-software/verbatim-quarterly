<script>
  import IssueGrid from "$lib/components/IssueGrid.svelte"
  import ArticlePreview from "$lib/components/ArticlePreview.svelte"
  import TermCallout from "$lib/components/TermCallout.svelte"
  import Header from "$lib/components/Header.svelte"
  import Search from "$lib/components/Search.svelte"
  import { onMount } from 'svelte'
  let { data } = $props()
  let { volumes, article } = data
  // to get random article, get all the article URIs (not too big, 120?)
  // then pick a rando URI
  // then FETCH the html of that URI and render it into this DOM.


  // TK: Get random author or index term
  // Not totally sure how to do this… similar plan I think.
  let placeholderQuery = "Icthyophobia"
</script>

<Header />

<nav>
  <a href="/articles">Articles</a>
  <a href="/terms-index">Index</a>
</nav>

<!-- <Search></Search> -->
<form action="/search">
  <label for="search">Search</label>
  <input
    type="text"
    name="s"
    placeholder="{placeholderQuery}…"
    id="search">
</form>

<h2 class='txt-center'>Random Article:</h2>
<ArticlePreview {article}></ArticlePreview>

<TermCallout />

<IssueGrid {volumes}></IssueGrid>

<footer>
  <p>
    VERBATIM was founded in 1974 by Laurence Urdang, the noted lexicographer. In 1997 it was purchased by Word, Inc., a non-profit corporation based in Wisconsin, through the generosity of our late benefactor, Warren Gilson.
  </p>
  <p>
    © 2024 Word Inc.
  </p>
</footer>