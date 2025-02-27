<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let articles = $state(data.articles)
  let find = $state('')

  const byTitleAsc = (a, b) => a.title > b.title
  const byTitleDsc = (a, b) => a.title < b.title
  const byAuthorAsc = (a, b) => a.author > b.author
  const byAuthorDsc = (a, b) => a.author < b.author

  let sorted = $state(articles.toSorted(byTitleAsc))

  let sortOptions = [{
    slug: 'title_asc',
    label: 'Title, Ascending',
    fn: byTitleAsc,
  },{
    slug: 'title_dsc',
    label: 'Title, Descending',
    fn: byTitleDsc,
  },{
    slug: 'author_asc',
    label: 'Author, Ascending',
    fn: byAuthorAsc,
  },{
    slug: 'author_dsc',
    label: 'Author, Descending',
    fn: byAuthorDsc,
  }]
  let sortBy = $state('author_asc')

  $effect(() => {
    let sortfn = sortOptions
      .find(n => n.slug === sortBy)["fn"]
    sorted = articles.toSorted(sortfn)
  })

  $effect(() => {
    if (find.length > 0) {
      let term = find.toLowerCase()
      articles = data.articles.filter(n => {
        let matchAuthor = n.author
          ? n.author.toLowerCase().includes(term)
          : false
        let matchTitle = n.title.toLowerCase().includes(term)
        return matchAuthor || matchTitle
      })
    } else {
      articles = data.articles
    }
  })
</script>

<NarrowHeader />

<h1>Articles</h1>

<form>
  <label>Sort By:</label>
  {#each sortOptions as option}
    <label>
      <input
        type="radio"
        name="scoops"
        value={option.slug}
        bind:group={sortBy}
      />
      {option.label}
    </label>
  {/each}
  <br>
  <label>
    Find:
    <input type="type" name="find" bind:value={find}>
  </label>

</form>

<!-- tk filter -->
<!-- tk alphabetical order -->
  <!-- tk by title -->
  <!-- tk bu aythor -->

{#each sorted as article}
  <section>
    <h2>
      <a
        href="/{article.partOf.uri}#{article.uri.split('_')[2]}">
        {article.title}
      </a>
    </h2>
    <p>
      {article.author}
    </p>
  </section>
{/each}