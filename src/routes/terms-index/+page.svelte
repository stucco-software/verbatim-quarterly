<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let { index } = data
</script>

<NarrowHeader />

<h1>Index</h1>

{#each index.collects as term}
  {@html term.html}
{/each}