<script>
  let { data } = $props()
  let { issue } = data
  let articles = issue.hasPart
    .filter(node => node.type === 'Article')
  console.log(issue)
</script>



<p>
  <a href="/">Verbatim</a>
  <br>
  The Language Quarterly
  <br>
  1974 – 2008
</p>

<header>
  <h1>{issue.title}</h1>
  <h2>{issue.season}, {issue.year}</h2>
</header>

<nav>
  <h2>Table of Contents</h2>
  <ul>
    {#each articles as article}
    <li>
      <a href="#{article.uri.split('_')[2]}">{article.title}</a>
      <span class="author">{article.author}</span>
    </li>
    {/each}
  </ul>
</nav>

<main>
  {#each issue.hasPart as section , i}
    <section
      id="{i + 1}"
      class="{section.type}">
      {@html section.html}
    </section>
  {/each}

</main>

<style type="text/css">
  header {
    text-align: center;
  }
  nav {
    border: 1px solid black;
    padding: 1rem;
  }
  nav h2 {
    text-align: center;
  }
  nav li {
    display: flex;
    justify-content: space-between;
    margin-block-end: 0.5rem;
  }
  nav .author {
    text-align: right;
    padding-inline-start: 2rem;
  }
</style>