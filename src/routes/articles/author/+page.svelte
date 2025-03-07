<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let {articles, letters} = data
</script>

<NarrowHeader />

<div class="container">
  <h1>Articles</h1>

  <nav>
    <a href="/articles">Alphabetically By Title</a>
    <span>Alphabetically By Author</span>
  </nav>
  <nav>
    {#each letters as letter}
      <a class="nav" href="#{letter}">{letter} </a>
    {/each}
  </nav>

  {#each letters as letter, i}
    <h2 id="{letter}">{letter}</h2>
    {#if articles[i]}
      {#each articles[i][1] as article}
        <section>
          <h3>
            <a
              href="/{article.partOf.uri}#{article.uri.split('_')[2]}">
              {article.title}
            </a>
            {#if article.author}
              {article.author}
            {/if}
          </h3>
          <p>
            <a
              href="/{article.partOf.uri}">{article.partOf.title}</a>
          </p>
        </section>
      {/each}
    {/if}
  {/each}
</div>

<style type="text/css">
  section {
    display: flex;
    justify-content: space-between;
  }
  h1 {
    font-family: "Openface";
    font-size: var(--txt-5);
    margin-block-end: var(--lead-xl);
  }
  h3, p {
    font-size: var(--txt-0);
    margin: 0;
  }
  nav {
    display: flex;
    gap: var(--lead-3xs);
  }
</style>