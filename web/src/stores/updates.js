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
  const selectedDateRange = ref('all');

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  const filteredUpdates = computed(() => {
    let filtered = updates.value;

    // Filter by category
    if (selectedCategory.value !== 'All') {
      filtered = filtered.filter(update => 
        update.categories && update.categories.includes(selectedCategory.value)
      );
    }

    // Filter by type
    if (selectedType.value !== 'All') {
      filtered = filtered.filter(update => update.type === selectedType.value.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(update => 
        update.title.toLowerCase().includes(query) ||
        (update.description && update.description.toLowerCase().includes(query))
      );
    }

    // Filter by date range
    if (selectedDateRange.value !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedDateRange.value) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '14days':
          cutoffDate.setDate(now.getDate() - 14);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '12months':
          cutoffDate.setMonth(now.getMonth() - 12);
          break;
      }
      
      filtered = filtered.filter(update => {
        const updateDate = new Date(update.publishedDate);
        return updateDate >= cutoffDate;
      });
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

  function setDateRange(range) {
    selectedDateRange.value = range;
  }

  return {
    updates,
    categories,
    loading,
    error,
    selectedCategory,
    selectedType,
    searchQuery,
    selectedDateRange,
    filteredUpdates,
    fetchUpdates,
    fetchCategories,
    setCategory,
    setType,
    setSearchQuery,
    setDateRange
  };
});
