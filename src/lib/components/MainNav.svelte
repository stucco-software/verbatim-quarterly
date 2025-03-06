<script>
  let placeholderQuery = "Icthyophobia"
</script>
<nav class="container">

  <a href="/articles">Articles</a>
  <a href="/terms-index">Index</a>

  <form action="/search">
    <label for="search">Search:</label>
    <input
      type="text"
      name="s"
      placeholder="{placeholderQuery}…"
      id="search">
  </form>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    border-top: 2px solid black;
    border-bottom: 2px solid black;
/*    align-items: center;*/
    padding-block: var(--lead-xs);
  }

  @media (min-width: 34em) {
    nav {
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
    }
    a {
      font-size: var(--txt-1);
    }
  }

  input {
    width: 100%;
  }
</style>