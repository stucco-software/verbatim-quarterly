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

<h1>Index</h1>

<form>
  <label>
    Find:
    <input type="type" name="find" bind:value={find}>
  </label>

</form>


{#each terms as term}
  {@html term.html}
{/each}