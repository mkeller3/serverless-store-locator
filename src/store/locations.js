// location.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';


export const useLocationsStore = defineStore('locationsStore', () => {
    let storeLocations = ref(null);
    let filterStoreLocations = ref([])

    /**
     * Method used to generate the store locations
     */
    async function generateStoreLocations(){
        if(storeLocations.value == null){

            const response = await fetch("geojson/sams_club_locations.geojson");
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            storeLocations.value = await response.json()
        }
        return storeLocations.value        
    }

    return{
        generateStoreLocations,
        storeLocations,
        filterStoreLocations
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useLocationsStore, import.meta.hot))
}
