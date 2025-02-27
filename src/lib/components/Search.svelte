<script type="text/javascript">
  import {onMount} from 'svelte'
  onMount(async () => {
    new PagefindUI({ element: "#search", showSubResults: true });
  })
</script>

<mark>SRACH BOX</mark>
<div id="search"></div>