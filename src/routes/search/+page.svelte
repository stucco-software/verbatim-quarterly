<script>
  import { page } from '$app/state'
  import { onMount } from "svelte"
  import Search from "$lib/components/Search.svelte"
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let term = $state('')
  onMount(() => {
    term = page.url.searchParams.get('s')
    console.log(term)
  })
</script>

<NarrowHeader />

<div class="container">
  <h1 class="txt-center">Search the Archive</h1>

  <Search bind:s={term}></Search>
</div>

<style type="text/css">
  h1 {
    font-family: "Openface";
    font-size: var(--txt-8);
  }
</style>