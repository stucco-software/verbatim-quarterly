<script>
  import IssueGrid from "$lib/components/IssueGrid.svelte"
  import ArticlePreview from "$lib/components/ArticlePreview.svelte"
  import TermCallout from "$lib/components/TermCallout.svelte"

  let { data } = $props()
  let { volumes, randomArticle } = data


  // TK: Get random author or index term
  let placeholderQuery = "Icthyophobia"
</script>

<header>
  <h1>Verbatim</h1>
  <h2>The Language Quarterly</h2>
  <h3>1974 – 2008</h3>
</header>

<nav>
  <a href="/articles">Articles</a>
  <a href="/terms-index">Index</a>
</nav>

<form action="/search">
  <label>Search</label>
  <!-- Placeholder -->
  <input
    placeholder="{placeholderQuery}…"
    type="text"
    name="q">
</form>

<h2 class='txt-center'>Random Article:</h2>
<ArticlePreview article={randomArticle}></ArticlePreview>

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