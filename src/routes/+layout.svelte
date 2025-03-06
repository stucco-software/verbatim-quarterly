<script>
  import Footer from "$lib/components/Footer.svelte"

  let { data, children } = $props()
</script>

{@render children()}

<Footer />