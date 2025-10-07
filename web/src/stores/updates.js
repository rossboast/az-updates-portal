import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUpdatesStore = defineStore('updates', () => {
  const updates = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const selectedCategory = ref('All');
  const selectedType = ref('All');
  const searchQuery = ref('');

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  const filteredUpdates = computed(() => {
    let filtered = updates.value;

    if (selectedCategory.value !== 'All') {
      filtered = filtered.filter(update => 
        update.categories && update.categories.includes(selectedCategory.value)
      );
    }

    if (selectedType.value !== 'All') {
      filtered = filtered.filter(update => update.type === selectedType.value.toLowerCase());
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(update => 
        update.title.toLowerCase().includes(query) ||
        (update.description && update.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  async function fetchUpdates() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${apiUrl}/updates?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch updates');
      updates.value = await response.json();
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching updates:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const cats = await response.json();
      categories.value = ['All', ...cats];
    } catch (err) {
      console.error('Error fetching categories:', err);
      categories.value = ['All', 'Compute', 'Integration', 'AI', 'Development', 'Azure'];
    }
  }

  function setCategory(category) {
    selectedCategory.value = category;
  }

  function setType(type) {
    selectedType.value = type;
  }

  function setSearchQuery(query) {
    searchQuery.value = query;
  }

  return {
    updates,
    categories,
    loading,
    error,
    selectedCategory,
    selectedType,
    searchQuery,
    filteredUpdates,
    fetchUpdates,
    fetchCategories,
    setCategory,
    setType,
    setSearchQuery
  };
});
