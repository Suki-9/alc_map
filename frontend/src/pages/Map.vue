<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import { onMounted, ref } from 'vue';

type MarkerData = { name: string; description?: string; lat: number; lng: number; category: string, index: number };

const zoom = ref<number>(15);
const center = ref<[number, number]>([35.6769883, 139.7588499]);

const markers = ref<MarkerData[]>([]);
const modalData = ref<MarkerData & { address: string } | null>(null);

const getAddress = (lat: number, lng: number) => fetch(`${import.meta.env.VITE_HOST}/api/geo?lat=${lat}&lng=${lng}`)
  .then(async r => await <Promise<{ prefecture: string; municipalities: string; town: string; }>>r.json());

const getPin = () => fetch(`${import.meta.env.VITE_HOST}/api/pin`).then(
  async r => markers.value = (await <Promise<MarkerData[]>>r.json()).map((v, i) => { v.index = i; return v })
);

const showModal = async (marker: MarkerData) => {
  if (modalData.value?.index === marker.index) modalData.value = null;
  else {
    const address = await getAddress(marker.lat, marker.lng);
    modalData.value = { address: `${address.prefecture} ${address.municipalities} ${address.town} 付近`, ...marker };
  }

  console.log(modalData.value)
};

const beforeEnter = (path: string) => location.href = path;

onMounted(getPin)
</script>

<template>
  <div :class="$style.map">
    <l-map ref="map" id="map" v-model:zoom="zoom" :use-global-leaflet="false" :center="center">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
        name="OpenStreetMap"></l-tile-layer>
      <l-marker v-for="marker in markers" :lat-lng="[marker.lat, marker.lng]" @click="showModal(marker)"></l-marker>
    </l-map>
  </div>

  <div :class="$style.bg" v-show="modalData" @click="modalData = null"></div>
  <div :class="$style.modal" v-show="modalData">
    <p>
      <span>名前</span>
      <span>{{ modalData?.name }}</span>
    </p>
    <p>
      <span>カテゴリ</span>
      <span>{{ modalData?.category }}</span>
    </p>
    <p>
      <span>位置情報</span>
      <span>{{ modalData?.address }}</span>
      <span :class="$style.link"
        @click="beforeEnter(`https://www.google.com/maps/search/?api=1&query=${modalData?.name}+${modalData?.lat},${modalData?.lng}`)">GoogleMapで開く</span>
    </p>
    <div v-show="modalData?.description">
      <p>詳細</p>
      <div>{{ modalData?.description?.replace('<br>', '\n') }}</div>
    </div>
  </div>
</template>

<style lang="scss" module>
.bg {
  position: absolute;
  inset: 0;
  z-index: 1500;

  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, .7);
}

.link {
  color: rgb(122, 130, 235);
}

.modal {
  position: absolute;
  inset: 0;
  z-index: 2000;

  display: flex;
  gap: 2em;
  flex-direction: column;

  margin: auto;
  padding: .5em;

  border-radius: .5em;

  width: fit-content;
  min-width: 60%;
  max-width: 95%;
  height: fit-content;

  background-color: rgb(255, 255, 255);

  &>p,
  &>div {
    display: flex;
    gap: .4em;
    flex-direction: column;

    &> :nth-child(1) {
      color: rgba(0, 0, 0, .7);
    }
  }
}

.map {
  position: absolute;
  inset: 0;
  z-index: 1000;

  overflow: hidden;

  height: 100vh;
  width: 100vw;
}
</style>