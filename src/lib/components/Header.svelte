
<header class="container">
  <div class="flex">
    <h1>Verbatim</h1>
    <aside>
      <h2>The Language Quarterly</h2>
      <h3>1974 – 2008</h3>
    </aside>
  </div>
</header>

<style>
  header {
    margin-block-start: var(--lead-xl);
    margin-block-end: var(--lead-l);
  }
  aside {
    padding-left: 1.25ch;
  }
  .flex {
    width: max-content;
    margin-inline: auto;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
  @media (min-width: 54em) {
    .flex {
      flex-direction: row;
      align-items: last baseline;
    }
  }

  h1 {
    font-family: "Openface";
    font-size: var(--txt-10);
    font-weight: 400;
    margin: 0;
  }
  h2, h3 {
    font-family: "NewCaledonia";
    font-size: var(--txt-1);
    font-weight: 400;
    margin: 0;
  }
</style>