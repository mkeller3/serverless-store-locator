<template>
    <div v-if="locationStore.filterStoreLocations.length > 0" class="text-subtitle-2">
        {{ locationStore.filterStoreLocations.length }} stores found.
        <v-divider class="mt-1"/>
    </div>
    <div style="height: calc(100% - 120px); overflow: auto;">
        <v-list>
            <v-list-item v-for="store in locationStore.filterStoreLocations" class="mb-3" :value="store['properties']['City']" @click="zoomToStore(store)">
                <div class="text-h6">{{ store['properties']['City'] }} Sam's Club </div>

                <div class="text-caption">No. {{ parseInt(store['properties']['Store__']) }}</div>



                <div class="my-4 text-subtitle-1">
                    {{ store['properties']['Phone'] }}
                    <div v-if="store['properties']['distance'] > 1" class="text-caption">{{
                        parseInt(store['properties']['distance']) }} miles away</div>
                    <div v-else class="text-caption">{{ store['properties']['distance'].toFixed(2) }} miles away</div>
                </div>
                <v-divider />
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup>
import { useLocationsStore } from '@/store/locations';
import { useMapStore } from '@/store/map';

const locationStore = useLocationsStore();
const mapStore = useMapStore();

/**
 * Method used to zoom to the store clicked on in the list
 */
function zoomToStore(store){
    mapStore.map.setCenter(store['geometry']['coordinates']);
    mapStore.map.setZoom(13);
}
</script>