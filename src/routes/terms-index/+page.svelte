<script>
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let { data } = $props()
  let terms = $state(data.index.collects)
  let find = $state('')
  $effect(() => {
    if (find.length > 0) {
      let term = find.toLowerCase()
      terms = data.index.collects.filter(n => {
        return n.html.toLowerCase().includes(term)
      })
    } else {
      terms = data.index.collects
    }
  })

</script>

<NarrowHeader />

<div class="container">
  <h1>Index</h1>
  {#each terms as term}
    {@html term.html}
  {/each}
</div>

<style type="text/css">
  h1 {
    font-family: "Openface";
    font-size: var(--txt-5);
    margin-block-end: var(--lead-xl);
  }
</style>