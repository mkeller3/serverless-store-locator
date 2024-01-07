// map.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import maplibregl from "maplibre-gl";
import bbox from '@turf/bbox';

export const useMapStore = defineStore('mapStore', () => {
    let map = ref(null)
    let filteredStoreLocations = ref(null)

    /**
     * Method used to build map
     */
    function buildMap() {
        map.value = new maplibregl.Map({
            container: 'map',
            style: {
                'version': 8,
                'sources': {
                    'raster-tiles': {
                        'type': 'raster',
                        'tiles': [
                            'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                        ],
                        'tileSize': 256,
                        'attribution':
                            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href= "https://carto.com/about-carto/">CARTO</a>'
                    }
                },
                'layers': [
                    {
                        'id': 'simple-tiles',
                        'type': 'raster',
                        'source': 'raster-tiles',
                        'minzoom': 0,
                        'maxzoom': 22
                    }
                ]
            },
            center: [-95, 40],
            zoom: 4
        })

        map.value.addControl(new maplibregl.NavigationControl());

        // Add icon for store marker
        map.value.on('load', () => {
            map.value.loadImage(
                'https://scene7.samsclub.com/is/image/samsclub/icon-location-pin-white?wid=32&fmt=png-alpha',
                (error, image) => {
                    if (error) throw error;
                    map.value.addImage('store-marker', image);
                })
        })
    }

    /**
     * Method used to add filtered stores to the map
     */
    function addFilteredStoresToMap() {

        // If there are more than one stores find the bbox of 
        // all stores and zoom to their bounding box
        // otherwise zoom to the single store
        if (filteredStoreLocations.value.length > 1) {
            let storeBbox = bbox({
                'type': 'FeatureCollection',
                'features': filteredStoreLocations.value
            });
            map.value.fitBounds(
                storeBbox
            );
        } else {
            map.value.setCenter(filteredStoreLocations.value[0]['geometry']['coordinates']);
            map.value.setZoom(13);
        }

        // If the source already exists, update the geojson data,
        // otherwise create a new source
        if (map.value.getSource('stores')) {
            map.value.getSource('stores').setData({
                'type': 'FeatureCollection',
                'features': filteredStoreLocations.value
            })
        } else {
            map.value.addSource('stores', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': filteredStoreLocations.value
                }
            });
        }

        // If the layer does not exist create the layer and popup
        if (!map.value.getLayer('stores')) {
            map.value.addLayer({
                'id': 'stores',
                'type': 'symbol',
                'source': 'stores',
                'layout': {
                    'icon-image': 'store-marker',
                    'icon-overlap': 'always'
                }
            });

            map.value.on('click', 'stores', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = `<div>
                <a class="text-subtitle-1" href="https://www.samsclub.com/club/normal-il-sams-club/${e.features[0]['properties']['Store__']}">${e.features[0]['properties']['City']} Sam's Club</a>
                </div>`

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new maplibregl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map.value);
            });

            map.value.on('mouseenter', 'stores', () => {
                map.value.getCanvas().style.cursor = 'pointer';
            });

            map.value.on('mouseleave', 'stores', () => {
                map.value.getCanvas().style.cursor = '';
            });
        }

        // Add a new popup for the closest store
        const description = `<div>
        <a class="text-subtitle-1" href="https://www.samsclub.com/club/normal-il-sams-club/${filteredStoreLocations.value[0]['properties']['Store__']}">${filteredStoreLocations.value[0]['properties']['City']} Sam's Club</a>
        </div>`


        new maplibregl.Popup()
            .setLngLat(filteredStoreLocations.value[0]['geometry']['coordinates'])
            .setHTML(description)
            .addTo(map.value);
    }

    return {
        map,
        filteredStoreLocations,
        buildMap,
        addFilteredStoresToMap
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}
