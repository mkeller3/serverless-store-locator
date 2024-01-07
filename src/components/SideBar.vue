<template>
    <v-container class="sidebar">
        <SearchForm />
        <v-divider class="my-4" />
        <StoreList />
    </v-container>
</template>

<script setup>
import SearchForm from '@/components/SearchForm.vue';
import StoreList from '@/components/StoreList.vue';

</script>

<style>

.sidebar{
    height: 100%;
}

</style>