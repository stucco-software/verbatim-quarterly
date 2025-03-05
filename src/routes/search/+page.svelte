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

<h1 class="txt-center">Search</h1>

<Search bind:s={term}></Search>

