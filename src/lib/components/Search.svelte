<script>
  import {onMount} from 'svelte'
  let { s } = $props()
  onMount(async () => {
    let search = new PagefindUI({
      element: "#search",
      highlightParam: "highlight",
      showSubResults: true
    });
    if (s) {
      search.triggerSearch(s)
    }
    $effect(() => {
      console.log('search for…', s)
      search.triggerSearch(s)
    })
  })


</script>

<div id="search"></div>