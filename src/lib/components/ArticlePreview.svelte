<script>
  import SpiralRule from '$lib/components/SpiralRule.svelte'
  let { article } = $props()
</script>

<div class="container">
  <h2 class='txt-center'>From the Archive</h2>
  <article class="multi-col">
    {@html article.preview}
    <footer>
      <a href="/{article.partOf.uri}#{article.uri.split('_')[2]}">Read More ☞</a>
    </footer>
  </article>
  <SpiralRule />
</div>

<style type="text/css">
  /*h1,
  h1 + p
  h3,
  h3 + p {
     column-span: all;
  }
  p {
    margin-block-start: 0;
  }*/

  h2 {
    font-family: "Openface";
    font-size: var(--txt-4);
  }
  footer {
    margin-block-start: var(--lead-m);
  }
</style>