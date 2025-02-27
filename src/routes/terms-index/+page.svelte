<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let { index } = data
  console.log(index)
</script>


<NarrowHeader />

<h1>Index</h1>

{#each index.terms as term}
  {@html term}
{/each}