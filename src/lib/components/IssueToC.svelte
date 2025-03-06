<script>
  let { articles } = $props()
</script>

<nav class="container">
  <h2>Contents</h2>
  <ul>
    {#each articles as article}
    <li>
      <a href="#{article.uri.split('_')[2]}">{article.title}</a>
      <span class="author">{article.author}</span>
    </li>
    {/each}
  </ul>
</nav>

<style type="text/css">
  nav {
    border: 2px solid var(--black);
    padding: var(--lead-m);
    margin-block-end: var(--lead-xl);
  }
  h2 {
    text-align: center;
    margin: 0;
    margin-block-end: var(--lead-m);
  }
  ul {
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    justify-content: space-between;
    margin-block-end: 0.5rem;
  }
  .author {
    text-align: right;
    padding-inline-start: 2rem;
  }
</style>