<script>
  let { issue } = $props()
</script>

<header class="container">
  <h1>{issue.title}</h1>
</header>

<style>
  header {
    text-align: center;
    margin-block: var(--lead-xl);
  }
  h1 {
    font-size: var(--txt-6);
    font-weight: 700;
  }
</style>