<!-- <template>
  <form @submit.prevent="onSearch" class="input-group my-3">
    <input
      v-model="query"
      type="text"
      class="form-control"
      placeholder="Search CVEs…"
    />
    <button class="btn btn-primary" type="submit">Search</button>
  </form>
</template>

<script>
export default {
  name: "SearchBar",
  emits: ["search"],
  data() {
    return {
      query: "",
    };
  },
  methods: {
    onSearch() {
      this.$emit("search", this.query);
    },
  },
};
</script> -->
