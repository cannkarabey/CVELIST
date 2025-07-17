<template>
  <div class="my-3">
    <div class="row">
      <div class="col-md-3">
        <select v-model="state" class="form-select">
          <option value="">All States</option>
          <option value="published">Published</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      <div class="col-md-3">
        <input
          type="date"
          v-model="dateFrom"
          class="form-control"
          placeholder="From"
        />
      </div>

      <div class="col-md-3">
        <input
          type="date"
          v-model="dateTo"
          class="form-control"
          placeholder="To"
        />
      </div>

      <div class="col-md-3">
        <button class="btn btn-primary w-100" @click="applyFilters">
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Filters",
  emits: ["filters-applied"],
  data() {
    return {
      state: "",
      dateFrom: "",
      dateTo: "",
    };
  },
  methods: {
    applyFilters() {
      this.$emit("filters-applied", {
        state: this.state,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
      });
    },
  },
};
</script>
