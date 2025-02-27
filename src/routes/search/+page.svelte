<script>
  import { page } from '$app/state'
  import Search from "$lib/components/Search.svelte"
  import NarrowHeader from "$lib/components/NarrowHeader.svelte"
  let term = page.url.searchParams.get('s')
</script>

<NarrowHeader />

<h1 class="txt-center">Search</h1>

<Search s={term}></Search>

