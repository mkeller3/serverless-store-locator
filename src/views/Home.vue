<template>
  <v-container fluid class="ma-0 pa-0 h-100" v-if="mdAndUp">
    <v-row class="ma-0 pa-0 h-100">
      <v-col class="ma-0 pa-0 h-100" cols="3">
        <SideBar />
      </v-col>
      <v-col class="ma-0 pa-0 h-100" cols="9">
        <WebMap />
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-row class="ma-0 pa-0 h-100">
      <v-col class="ma-0 pa-0" cols="12">
        <SearchForm />
        <v-divider/>
      </v-col>
      <v-col class="ma-0 pa-0" cols="12" style="height: 200px;">
        <WebMap />
      </v-col>
      <v-col class="ma-0 pa-0 h-100" cols="12">
        <StoreList />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify';
import SideBar from '@/components/SideBar.vue';
import WebMap from '@/components/WebMap.vue';
import SearchForm from '@/components/SearchForm.vue';
import StoreList from '@/components/StoreList.vue';

const { mdAndUp } = useDisplay()

</script>
