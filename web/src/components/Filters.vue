<script setup>
import { useUpdatesStore } from '../stores/updates.js';

const store = useUpdatesStore();

const types = ['All', 'Update', 'Blog'];
const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '14days', label: 'Last 14 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '12months', label: 'Last 12 Months' }
];
</script>

<template>
  <div class="filters">
    <div class="filter-group">
      <label>Search</label>
      <input 
        type="text" 
        class="search-box" 
        placeholder="Search updates..."
        :value="store.searchQuery"
        @input="store.setSearchQuery($event.target.value)"
      />
    </div>
    
    <div class="filter-group">
      <label>Type</label>
      <div class="filter-buttons">
        <button
          v-for="type in types"
          :key="type"
          class="filter-btn"
          :class="{ active: store.selectedType === type }"
          @click="store.setType(type)"
        >
          {{ type }}
        </button>
      </div>
    </div>
    
    <div class="filter-group">
      <label>Category</label>
      <div class="filter-buttons">
        <button
          v-for="category in store.categories"
          :key="category"
          class="filter-btn"
          :class="{ active: store.selectedCategory === category }"
          @click="store.setCategory(category)"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <div class="filter-group">
      <label>Date Range</label>
      <div class="filter-buttons">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          class="filter-btn"
          :class="{ active: store.selectedDateRange === range.value }"
          @click="store.setDateRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
  </div>
</template>
