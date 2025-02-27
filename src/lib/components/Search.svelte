<script type="text/javascript">
  import {onMount} from 'svelte'
  let { s } = $props()
  onMount(async () => {
    let search = new PagefindUI({ element: "#search", showSubResults: true });
    if (s) {
      console.log('search for…', s)
      search.triggerSearch(s)
    }
  })
</script>

<div id="search"></div>