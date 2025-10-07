<script setup>
import { onMounted } from 'vue';
import { useUpdatesStore } from './stores/updates.js';
import UpdateCard from './components/UpdateCard.vue';
import Filters from './components/Filters.vue';

const store = useUpdatesStore();

onMounted(() => {
  store.fetchUpdates();
  store.fetchCategories();
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>

<template>
  <div>
    <header class="header">
      <h1>Azure Updates Portal</h1>
      <p>Stay up to date with the latest Azure announcements, updates, and blog posts</p>
    </header>

    <Filters />

    <div v-if="store.loading" class="loading">
      Loading updates...
    </div>

    <div v-else-if="store.error" class="error">
      Error: {{ store.error }}
    </div>

    <div v-else class="updates-grid">
      <UpdateCard
        v-for="update in store.filteredUpdates"
        :key="update.id"
        :update="update"
        :formatDate="formatDate"
      />
    </div>

    <div v-if="!store.loading && !store.error && store.filteredUpdates.length === 0" class="loading">
      No updates found matching your criteria.
    </div>
  </div>
</template>
