<script>
  let { volumes } = $props()
</script>

<div class="container">
  <h2>
    Issues
  </h2>

  <p>
    To order paper back issues, email us <a href="mailto:editor@verbatimquarterly.com">here</a>.
  </p>

  {#each volumes as volume, v}
    <ul>
      <li>
        Volume {volume.label}
      </li>
      {#if volume.label === 'XXIV'}
        <li></li>
      {/if}
      {#each volume.hasIssue as issue, no}
        <li>
          <a href="{issue.uri}">No. {issue.number.uri ? issue.number.uri : issue.number} [{issue.season} {issue.year}]</a>
        </li>
      {/each}
    </ul>
  {/each}
</div>

<style type="text/css">
  .container {
    margin-block-start: var(--lead-2xl);
  }
  h2 {
    font-family: "Openface";
    font-size: var(--txt-3);
  }
  ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    padding-inline: var(--lead-3xs);
    padding-block: var(--lead-xs);
    margin: 0;
    list-style-type: none;
    border-top: 1px solid var(--ink);
  }
  ul:last-child {
    border-bottom: 1px solid var(--ink);
  }
  li:first-child {
    font-weight: 700;
  }
  a {
    font-weight: 300;
  }
</style>
