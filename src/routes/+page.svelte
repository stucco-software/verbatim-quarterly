<script>
  import IssueGrid from "$lib/components/IssueGrid.svelte"
  import ArticlePreview from "$lib/components/ArticlePreview.svelte"
  import TermCallout from "$lib/components/TermCallout.svelte"
  import Header from "$lib/components/Header.svelte"
  import MainNav from "$lib/components/MainNav.svelte"
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

<MainNav />

<ArticlePreview {article}></ArticlePreview>

<IssueGrid {volumes}></IssueGrid>

<TermCallout />
