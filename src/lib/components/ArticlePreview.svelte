<script>
  let { article } = $props()
</script>

<article>
  {@html article.preview}
  <footer>
    <a href="/{article.partOf.uri}#{article.uri.split('_')[2]}">Read More ☞</a>
  </footer>
</article>

<style type="text/css">
  article {
    column-count: 2;
  }
  h3,
  h3 + p {
     column-span: all;
  }
  p {
    margin-block-start: 0;
  }
  footer {
    column-span: all;
    text-align: right;
  }
</style>