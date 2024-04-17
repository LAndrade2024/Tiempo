'use strict';

import {
  alert,
  input,
  modal,
  select
} from 'vue-strap';
import Tabla_Camas from '../component/Table.vue';
import datepicker from '../components/datepicker.vue';
import urlToTable from '../components/urlToTable.vue';

Vue.use(VueResource);
let decimal = value => typeof value !== 'number' ? value : value.toFixed(2);
Vue.filter('decimal', decimal);
Vue.filter('miles', i => parseFloat(decimal(i)).toLocaleString());
const controllerUrl = SERVER.controllerUrl;
console.log('Valor',controllerUrl);
let objectToUri = obj => Object.keys(obj).filter(i => obj[i]).map(i => i + '='  + obj[i]).join('&');

let main = new Vue({
    el: '#vue-simpleList',  
    data: {  
        filter: {
        'fecha>':  SERVER.date.substr(0,8) + '01',
        'fecha<': SERVER.date,
                },
        msg: {
        show: false,
        text: '',
      },
      options: {
        periodos: []
      },
      total: {},
      url: SERVER.controllerUrl,
      wait: false,
    },
    components: {
    Tabla_Camas,
    alert,
    datepicker,
    modal,
    urlToTable,
    vInput: input,
    vSelect: select,
    },

    computed: {
    },

    created() {
        this.requestTotal();
    },

    methods:{
        requestTotal(){
            this.$http.get(controllerUrl + '/total?' + objectToUri(this.filter))
              .then(res => res.json())
              .then(json => this.total = json);
          },
        },
        watch:{
          filter:{
            handler(){
              this.requestTotal();
            },
            deep: true,
          },
        },
      });
      window.mainVue = main;