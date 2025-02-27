<script>
    import { onMount } from 'svelte';
    onMount(async () => {
        const pagefind = await import('$lib/pagefind.js');
        pagefind.init()
        new PagefindUI({
          element: '#search',
          showImages: false,
          resetStyles: true,
          autofocus: true,
          processResult: (result) => {
            const url = result.url.replace('.html', '');
            result.url = url;
            return result;
          },
        });
    });
</script>

<h1>Search…</h1>
<div id="search"></div>