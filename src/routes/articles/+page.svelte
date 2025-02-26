<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let { articles } = data
</script>

<NarrowHeader />

<h1>Articles</h1>

<!-- tk filter -->
<!-- tk alphabetical order -->
  <!-- tk by title -->
  <!-- tk bu aythor -->

{#each articles as article}
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