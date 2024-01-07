<template>
    <v-form @keyup.enter="findStores" style="height: 100px;">
        <v-autocomplete label="Zip Code" density="compact" prepend-inner-icon="mdi-magnify" variant="outlined" v-model="zipCode" :loading="loading" :disabled="loading"
            :items="zipList" @update:search="generateZipAutocompleteList">
        </v-autocomplete>
        <v-btn color="success" variant="text" @click="findStores()">
            Find Stores
        </v-btn>
    </v-form>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import buffer from '@turf/buffer';
import booleanWithin from '@turf/boolean-within';
import distance from '@turf/distance';

import { useZipCodeStore } from '@/store/zipCode';
import { useLocationsStore } from '@/store/locations';
import { useMapStore } from '@/store/map';

const zipCodeStore = useZipCodeStore();
const locationStore = useLocationsStore();
const mapStore = useMapStore();

let zipCode = ref("");
let loading = ref(false)
let zipList = ref([]);
let bufferDistance = ref(100);

onMounted(async () => {
    loading.value = true;
    await zipCodeStore.generateZipCodeVariables();
    await locationStore.generateStoreLocations();
    loading.value = false;

    // Check if a zip code is provided in the url and find the closest stores
    let uri = window.location.search.substring(1); 
    let params = new URLSearchParams(uri);
    if(params.get("zipCode")){
        zipCode.value = params.get("zipCode")
        findStores()
    }else{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
    }
})

/**
 * Method used to get find the users position and find the closest stores
 */
function showPosition(position){
    let geojson = {
        "type": "Feature",
        "geometry": {
            "coordinates": [position['coords']['longitude'], position['coords']['latitude']],
            "type": "Point"
        }
    }
    const zipCodeBuffer = buffer(geojson, 100, { units: 'miles' });
    let nearbyZipCodes = []
    zipCodeStore.zipCodeGeojson['features'].forEach(zipCode => {
        if (booleanWithin(zipCode, zipCodeBuffer)) {
            zipCode['properties']['distance'] = distance(zipCode, [position['coords']['longitude'], position['coords']['latitude']], {units: 'miles'})
            nearbyZipCodes.push(zipCode)
        }
    });
    nearbyZipCodes = nearbyZipCodes.slice().sort((a, b) => a['properties']['distance'] - b['properties']['distance']);
    zipCode.value = nearbyZipCodes[0]['properties']['ZCTA5CE20'];
    findStores()
}

/**
 * Method used to generate the autocomplete zip code list if more than
 * two characters are entered
 */
function generateZipAutocompleteList(e) {
    if (e.length >= 3) {
        zipList.value = zipCodeStore.zipCodeList.filter(item =>
            item.toLowerCase().startsWith(e.toLowerCase().substring(0, 3))
        );
    }
}

/**
 * Method used to find stores near the selected zip code
 */
function findStores() {
    loading.value = true;
    locationStore.filterStoreLocations = []
    let zipDetails = zipCodeStore.zipCodeMap[zipCode.value]
    let geojson = {
        "type": "Feature",
        "geometry": {
            "coordinates": [zipDetails['lng'], zipDetails['lat']],
            "type": "Point"
        }
    }
    const zipCodeBuffer = buffer(geojson, bufferDistance.value, { units: 'miles' });
    locationStore.storeLocations['features'].forEach(store => {
        if (booleanWithin(store, zipCodeBuffer)) {
            store['properties']['distance'] = distance(store, [zipDetails['lng'], zipDetails['lat']], {units: 'miles'})
            locationStore.filterStoreLocations.push(store)
        }
    });
    locationStore.filterStoreLocations = locationStore.filterStoreLocations.slice().sort((a, b) => a['properties']['distance'] - b['properties']['distance']);
    mapStore.filteredStoreLocations = locationStore.filterStoreLocations;
    mapStore.addFilteredStoresToMap();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('zipCode', zipCode.value);
    const updatedQueryString = urlParams.toString();
    window.history.replaceState({}, '', `${window.location.pathname}?${updatedQueryString}`);
    loading.value = false;
}

</script>