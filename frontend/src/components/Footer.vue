<template>
  <footer class="bg-light text-center text-muted py-3 mt-auto">
    <div class="container">
      <small>
        &copy; {{ currentYear }} CVE Search App. All rights reserved.
      </small>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>
