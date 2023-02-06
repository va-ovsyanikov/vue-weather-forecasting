<template>
  <div id="app" class="app">
    <div class="home" v-if="isPage === ''">
      <div class="home__top">
        <span class="home__title">Weather Forecasting</span>
        <font-awesome-icon icon="fa-solid fa-gear" @click="getPage('settings')" />
      </div>
      <div class="home__content">
        <div class="home-item__loading" v-if="!data.length">Loading....</div>
        <div class="home-item" v-for="item in data" :key="item.id" v-else>
          <h3 class="home-item__name">{{ item.name }}, {{ item.country }}</h3>
          <div class="home-item__сontent-temp">
            <img class="home-item__img" :src="`http://openweathermap.org/img/wn/${item.icon}.png`" alt="">
            <span class="home-item__temp">{{ temp(item.temp) }}&deg;C</span>
          </div>
          <div class="home-item__content">
            <div class="content__item content__item_recede">
              <span class="home-item__feels">Feels like: 
                {{temp(item.feels_like)}}&deg;c</span>
              <span class="home-item__clouds">{{ capitalised(item.clouds) }}</span>
            </div>
            <div class="content__item content__item_line">
              <span class="home-item__wind">
                <font-awesome-icon icon="fa-solid fa-location-arrow" />
                {{ item.wind }}
                m/s</span>
              <span class="home-item__pressure">
                <font-awesome-icon icon="fa-solid fa-weight-hanging" />
                {{ item.pressure }}
                hPa</span>
            </div>
            <div class="content__item content__item_line">
              <span class="home-item__humidity">
                <font-awesome-icon icon="fa-solid fa-droplet" />
                {{item.humidity}} %</span>
              <span class="home-item__visibility">
                <font-awesome-icon icon="fa-solid fa-binoculars" />
                {{visibility(item.visibility)}} km</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings" v-if="isPage === 'settings'">
      <div class="settings__top">
        <span class="settings__title">Settings</span>
        <font-awesome-icon icon="fa-solid fa-xmark" @click="getPage('')" />
      </div>
      <div class="settings__content">
        <draggable v-model="cities" @change="onDrag">
          <div class="setting-item settings__drag-item" v-for="city in cities" :key="city.id">
            <font-awesome-icon class="setting-item__drag" icon="fa-solid fa-bars" />
            <span class="setting-item__city">{{ city.name }}, {{ city.country }}</span>
            <font-awesome-icon v-if="city.city_user" icon="fa-solid fa-trash-can" class="setting-item__desabled" />
            <font-awesome-icon v-else icon="fa-solid fa-trash-can" class="setting-item__delete"
              @click="deleteItem(city.id)" />
          </div>
        </draggable>
      </div>
      <div class="input">
        <input type="text" class="input__field" placeholder="Enter city name" v-model="name"
          :disabled="cities.length >= 6">
        <button class="input__btn" :disabled="name === ''" @click="setItem">
          <font-awesome-icon icon="fa-solid fa-plus" />
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Vue, { ref, onMounted } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGear, faLocationArrow, faWeightHanging, faDroplet, faBinoculars, faBars, faXmark, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import draggable from 'vuedraggable'
import axios from 'axios';
library.add(faGear, faLocationArrow, faWeightHanging, faDroplet, faBinoculars, faBars, faXmark, faPlus, faTrashCan)
Vue.component('font-awesome-icon', FontAwesomeIcon)
const API_KEY = '4178a525fa94f75cb887bdba6f69902a';
interface ICity {
  id: number,
  name: string,
  country: string,
  temp: number,
  feels_like: number,
  clouds: string,
  wind: number,
  humidity: number,
  pressure: number,
  visibility: number,
  icon: string,
  city_user?: boolean
}
const fetchCity = async (name: string): Promise<ICity> => {
  const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}`);
  const obj: ICity = {
    id: response.data.id,
    name: response.data.name,
    country: response.data.sys.country,
    temp: response.data.main.temp,
    feels_like: response.data.main.feels_like,
    clouds: response.data.weather[0].description,
    wind: response.data.wind.speed,
    humidity: response.data.main.humidity,
    pressure: response.data.main.pressure,
    visibility: response.data.visibility,
    icon: response.data.weather[0].icon
  }
  return obj
}

const userCity = async () => {
  const response = await axios.get('http://api.sypexgeo.net')
  const name: string = response.data.city.name_en
  return name
}

const cities = ref(localStorage.getItem('cities') ? (JSON.parse(localStorage.getItem('cities') as string)) as Array<Pick<ICity, 'id' | 'name' | 'country' | 'city_user'>> : [] as Array<Pick<ICity, 'id' | 'name' | 'country' | 'city_user'>>)
const data = ref([] as Array<ICity>)
const isPage = ref('')

const getPage = (str: string) => {
  isPage.value = str
  data.value = []
  getUserPosition()
  getCities()
}

onMounted(() => getUserPosition())

const getCities = () => {
  cities.value = localStorage.getItem('cities') ? (JSON.parse(localStorage.getItem('cities') as string)) as Array<Pick<ICity, 'id' | 'name' | 'country' | 'city_user'>> : [] as Array<Pick<ICity, 'id' | 'name' | 'country' | 'city_user'>>
}

const getCity = async (name: string) => {
  try {
    const response: ICity = await fetchCity(name)
    const obj: Pick<ICity, 'id' | 'name' | 'country' | 'city_user'> = {
      id: response.id,
      name: response.name,
      country: response.country,
      city_user: true
    }
    let cityUser: Pick<ICity, 'id' | 'name' | 'country' | 'city_user'> = obj
    if (!cities.value.length) {
      const response: ICity = await fetchCity(cityUser.name as string)
      response.city_user = true
      data.value.push(response)
      localStorage.setItem('cities', JSON.stringify([cityUser]))
    } else {

      const index2 = cities.value.findIndex(el => 'city_user' in el)
      if (index2 !== -1) {
        cities.value.splice(index2, 1, cityUser)
      }
      const index1 = cities.value.findIndex(el => el.id === cityUser.id && 'city_user' in el !== true)
      if (index1 !== -1) {
        cities.value.splice(index1, 1)
      }
  


      const promises = []
      for (let city of cities.value) {
        const response: ICity = await fetchCity(city.name as string)
        promises.push(response)
      }
      Promise.all(promises).then(res => {
        for (let elem of res) {
          data.value.push(elem)
        }
      }).catch(err => {
        console.log(err);
      })
    }
  } catch (error) {
    console.log(error);
  }
}

const getUserPosition = async () => {
  try {
    const name = await userCity()
    getCity(name)
  } catch (error) {
    console.log(error);
  }
}
const temp = (data: number) => {
  return Math.round(data - 273)
}
const capitalised = (str: string) => {
  return str[0].toUpperCase() + str.slice(1)
}
const visibility = (data: number) => {
  return Math.round(data / 1000)
}

const name = ref('')

const setItem = async () => {
  if (name.value) {
    try {
      const response: ICity = await fetchCity(name.value)
      const index = cities?.value.findIndex((el: Pick<ICity, 'id' | 'name' | 'country'>) => el.id === response.id)
      if (index === -1) {
        const obj: Pick<ICity, 'id' | 'name' | 'country'> = {
          id: response.id,
          name: response.name,
          country: response.country
        }
        if (cities.value.length < 6) {
          cities.value.push(obj)
          localStorage.setItem('cities', JSON.stringify(cities.value))
          name.value = ''
        } else {
          alert('Maximum 6 cities')
        }
      } else {
        alert('The city exists')
      }
    } catch (error) {
      alert('Wrong city name')
    }
  }
}

const deleteItem = (id: number) => {
  if (confirm("Do you want to delete a city?")) {
    cities.value = cities.value.filter(el => el.id !== id)
    localStorage.setItem('cities', JSON.stringify(cities.value))
  }
}

const onDrag = () => {
  localStorage.setItem('cities', JSON.stringify(cities.value))
}
</script>
<style lang="less">
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

* {
  margin: 0;
  padding: 0;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

.app {
  width: 350px;
  margin: 50px auto;
  border: 1px solid #eaeaea;
  background-color: #fffcfc;
  color: #000;
  border-radius: 5px;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  box-sizing: border-box;
  height: 415px;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #43AFFC;
    height: 50px;
  }

  ::-webkit-scrollbar-track {
    background: #eaeaea;
  }
}

.svg-inline--fa {
  width: 16px;
}

.home__top,
.settings__top {
  padding: 0 10px;
  height: 57px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  color: #43AFFC;
  font-size: 18px;

  a {
    color: #43AFFC;
  }

  .svg-inline--fa {
    cursor: pointer;
  }
}

.home {
  &__content {
    height: 357px;
    overflow: auto;
  }
}

.home-item {
  height: 357px;
  padding: 35px 0 0;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eaeaea;

  &__date {
    margin-bottom: 20px;
    text-align: center;
  }

  &__name {
    font-size: 20px;
    margin-bottom: 20px;
    text-align: center;
    color: #eb6e4c;
  }

  &__сontent-temp {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40px;
  }

  &__content {
    margin-top: auto;
  }

  &__temp {
    font-size: 50px;
    margin-left: 10px;
    font-weight: bold;
  }

  &__feels {
    font-weight: bold;
  }

  &__clouds {
    font-weight: bold;
  }

  &__wind {
    border-right: 1px solid #eaeaea;
  }

  &__humidity {
    border-right: 1px solid #eaeaea;
  }

  &__loading {
    text-align: center;
    margin-top: 100px;
  }
}

.content {
  &__item {
    font-size: 18px;
    display: flex;
    justify-content: space-around;
  }

  &__item_recede {
    margin-bottom: 10px;
  }

  &__item_line {
    border-top: 1px solid #eaeaea;

    span {
      display: flex;
      align-items: center;
      padding: 17px 0;
      width: 50%;
      margin-left: 45px;

      .svg-inline--fa {
        color: #43AFFC;
        margin-right: 5px;
      }
    }
  }
}

.fa-solid {
  color: #43AFFC;
}

.settings {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__content {
    flex: 1 0 auto;

    .settings__drag-item:nth-child(6) {
      border-bottom: none;
    }
  }
}

.input {
  margin-top: auto;
  display: flex;
  align-items: center;

  &__field {
    height: 57px;
    padding-left: 5px;
    border: none;
    border-top: 1px solid #eaeaea;
    background-color: #fafafa;
    width: 100%;
    font-size: 18px;
    border-bottom-left-radius: 5px;

    &:focus {
      background-color: #f5f7fb;
    }

    outline:none;
  }

  &__btn {
    height: 57px;
    width: 60px;
    border: none;
    border-top: 1px solid #eaeaea;
    border-left: 1px solid #eaeaea;
    background-color: #fafafa;
    color: #43AFFC;
    font-size: 20px;
    cursor: pointer;
    border-bottom-right-radius: 5px;
  }
}

::-webkit-input-placeholder {
  color: #eaeaea;
}

::-moz-placeholder {
  color: #eaeaea;
}

:-moz-placeholder {
  color: #eaeaea;
}

:-ms-input-placeholder {
  color: #eaeaea;
}

.setting-item {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 10px;
  border-bottom: 1px solid #eaeaea;
  cursor: grab;

  &__city {
    margin-left: 10px;
  }

  &__drag {
    color: #000;
  }

  &__delete {
    margin-left: auto;
    cursor: pointer;
    color: #eb6e4c;
  }

  &__desabled {
    margin-left: auto;
    color: #bebebeff;
  }
}

.sortable-ghost {
  background-color: #f5f7fb;

  .setting-item {
    &__drag {
      display: none;
    }

    &__city {
      display: none;
    }

    &__delete {
      display: none;
    }
  }
}

.sortable-drag {
  background-color: #43AFFC;

  .item__drag {
    color: #43AFFC;
  }
}
</style>