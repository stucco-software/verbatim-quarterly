<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  import IssueHeader from "$lib/components/IssueHeader.svelte"
  import IssueToC from "$lib/components/IssueToC.svelte"
  import SpiralRule from '$lib/components/SpiralRule.svelte'

  let { data } = $props()
  let { issue } = data
  let parts = issue.hasPart ? issue.hasPart : []
  let articles = parts
    .filter(node => node.type === 'Article')
</script>


<div id="top"></div>
<NarrowHeader />

<IssueHeader issue={issue} />

<IssueToC articles={issue.hasPart} />

<main>

  <nav>
    <div class="container">
      <a href="#top">{issue.title}</a>
    </div>
  </nav>

  <div class="text-body">
    {#each issue.hasPart as section , i}
      <section
        id="{i + 1}"
        class="{section.type}">
        {@html section.html}
      </section>
      {#if section.type === 'Article'}
        <SpiralRule />
      {/if}
    {/each}
  </div>
</main>

<style>
  main {
    border-top: 2px solid var(--black);
  }

  section {
    scroll-margin-top: var(--lead-3xl);
  }
  nav {
    padding-block: var(--lead-xs);
    background-color: var(--paper);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 2px ridge var(--ink);
  }
</style>