<script type="text/javascript">
  let { volumes } = $props()
  console.log(volumes)
</script>

<h2>
  Issues
</h2>

<p>
  To order paper back issues, email us <a href="mailto:editor@verbatimquarterly.com">here</a>.
</p>

{#each volumes as volume}
  <ul>
    {#each volume.issues as issue}
      <li>
        <a href="{issue.id}">{issue.title}</a>
      </li>
    {/each}
  </ul>
{/each}
<style type="text/css">
  ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
</style>
