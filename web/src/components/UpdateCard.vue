<script setup>
defineProps({
  update: {
    type: Object,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
});
</script>

<template>
  <article class="update-card">
    <div class="update-header">
      <span class="update-type" :class="update.type">{{ update.type }}</span>
    </div>
    
    <h3 class="update-title">{{ update.title }}</h3>
    
    <p class="update-source">{{ update.source }}</p>
    
    <p class="update-description">{{ update.description }}</p>
    
    <div v-if="update.categories && update.categories.length" class="categories">
      <span 
        v-for="category in update.categories.slice(0, 3)" 
        :key="category" 
        class="category-tag"
      >
        {{ category }}
      </span>
    </div>
    
    <div class="update-footer">
      <span class="update-date">{{ formatDate(update.publishedDate) }}</span>
      <a :href="update.link" target="_blank" rel="noopener noreferrer" class="update-link">
        Read More →
      </a>
    </div>
  </article>
</template>
