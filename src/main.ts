import Vue from 'vue'
import App from './App.vue'
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import { faGear, faLocationArrow, faWeightHanging, faDroplet, faBinoculars, faBars, faXmark, faPlus, faTrashCan} from '@fortawesome/free-solid-svg-icons'
import router from './router'
// import './assets/style.less';
import VueCompositionAPI from '@vue/composition-api'

// library.add(faGear, faLocationArrow, faWeightHanging, faDroplet, faBinoculars, faBars, faXmark, faPlus, faTrashCan)
// Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false
Vue.use(VueCompositionAPI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
