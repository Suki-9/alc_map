<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { onMounted, ref, watch } from 'vue';

// Map Properties
const zoom = ref<number>(15);
const center = ref<{ lat: number, lng: number }>({ lat: 35.6769883, lng: 139.7588499 });

// Form Properties
const name = ref<string>('');
const summary = ref<string>('');
const tag = ref<string>();

const prefecture = ref<string>();
const municipality = ref<string>();
const town = ref<string>();
const block = ref<string>();
const other = ref<string>();

const prefectures = ref<string[]>();
const municipalities = ref<string[]>();
const towns = ref<string[]>();

const showMap = ref<boolean>(true);

const getPrefectures = () => fetch(`${import.meta.env.VITE_HOST}/api/geo/prefectures`)
  .then(async r => prefectures.value = await r.json())

const getMunicipalities = () => fetch(`${import.meta.env.VITE_HOST}/api/geo/municipalities?prefecture=${prefecture.value}`)
  .then(async r => municipalities.value = await r.json())

const getTown = () => fetch(`${import.meta.env.VITE_HOST}/api/geo/towns?prefecture=${prefecture.value}&municipality=${municipality.value}`)
  .then(async r => towns.value = await r.json())

const getAddress = () => fetch(`${import.meta.env.VITE_HOST}/api/geo?lat=${center.value.lat}&lng=${center.value.lng}`)
  .then(async r => {
    const address = await r.json();

    prefecture.value = address.prefecture;
    municipality.value = address.municipalities;
    town.value = address.town;
  });

const postData = () => fetch(`${import.meta.env.VITE_HOST}/api/store`, {
  method: 'POST',
  body: JSON.stringify({
    name: name.value,
    summary: summary.value,
    tag: tag.value,
    address: {
      prefecture: prefecture.value,
      municipality: municipality.value,
      town: town.value,
      block: block.value
    }
  })
}).then(() => {
  prefecture.value = undefined;
  municipality.value = undefined;
  town.value = undefined;
  block.value = undefined;
  other.value = undefined;
});

watch(center, getAddress);
watch(prefecture, getMunicipalities)
watch(municipality, getTown)

onMounted(getAddress);
onMounted(getPrefectures);
</script>

<template>
  <div :class="$style.head">
    <span class="material-symbols-outlined" @click="$router.push('/')">arrow_back</span>
    <h2>お店を登録する</h2>
  </div>

  <div :class="$style.root">
    <div>
      <p>名前</p>
      <input type="text" v-model="name" />
    </div>

    <div>
      <p>説明</p>
      <textarea v-model="summary"></textarea>
    </div>

    <div>
      <p>タグ</p>
      <select v-model="tag">
        <option selected disabled>タグ</option>
        <option v-for="tag in ['ビール', 'ワイン', '日本酒', 'カクテル', '焼酎', 'ウイスキー', '居酒屋', '酒蔵 / 醸造所 / 蒸溜所 / 酒屋']" :value="tag">
          {{ tag }}</option>
      </select>
    </div>

    <div :class="$style.address">
      <p>住所</p>
      <select v-model="prefecture">
        <option selected disabled>都道府県</option>
        <option v-for="prefecture in prefectures" :value="prefecture">{{ prefecture }}</option>
      </select>
      <select v-model="municipality">
        <option selected disabled>市区町村</option>
        <option v-for="municipality in municipalities" :value="municipality">{{ municipality }}</option>
      </select>
      <select v-model="town">
        <option selected disabled>街区</option>
        <option v-for="town in towns" :value="town">{{ town }}</option>
      </select>
      <input v-model="block" placeholder="番地 (e.g. XX-YY or XX番YY号)">
      <input v-model="other" placeholder="その他 ビル名 フロア等">
    </div>

    <button @click="showMap = !showMap">マップを{{ showMap ? '非表示に' : '表示' }}する</button>

    <div :class="$style.map" v-if="showMap">
      <l-map ref="map" v-model:zoom="zoom" :use-global-leaflet="false" v-model:center="center">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
          name="OpenStreetMap"></l-tile-layer>
      </l-map>
      <span :class="[$style.pin, 'material-symbols-outlined']">location_on</span>
    </div>

    <button :class="$style.submit" @click="postData">送信</button>
  </div>
</template>

<style lang="scss" module>
.head {
  display: flex;
  gap: 2em;
  align-items: center;

  user-select: none;

  padding: .5em;

  border-bottom: solid 1px rgba(0, 0, 0, .2);

  span {
    font-size: 2em;
  }
}

.root {
  display: flex;
  flex-direction: column;
  gap: .5em;

  margin: .4em;
  padding-bottom: 5em;

  font-size: 1.2em;

  &>div>p {
    user-select: none;
  }

  .address {
    display: flex;
    gap: .5em;
    flex-direction: column;
  }

  .map {
    position: relative;
    z-index: 1000;
    height: 400px;

    border-radius: .5em;
    overflow: hidden;

    .address {
      display: flex;
      gap: .2em;
      align-items: center;
    }

    .pin {
      position: absolute;
      z-index: 2000;
      inset: 0;

      width: fit-content;
      height: fit-content;

      margin: auto;

      user-select: none;

      color: red;

      font-size: 2rem;
    }
  }

  .submit {
    padding: .5em 2em;

    margin-left: auto;
  }

  input,
  select {
    font-size: 1em;
    width: 100%;
  }

  textarea {
    width: 100%;
    height: 5em;
    resize: vertical;

    font-size: 1em;
  }
}
</style>
