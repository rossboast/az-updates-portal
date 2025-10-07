<script setup>
import { useUpdatesStore } from '../stores/updates.js';

const store = useUpdatesStore();

const types = ['All', 'Update', 'Blog'];
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
  </div>
</template>
