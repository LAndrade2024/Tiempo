<style>
circle{
  stroke-dasharray: 50 100;
  fill: white;
  stroke: #204d74;
  stroke-width: 32;
}
svg {
  width: 60px; height: 60px;
  transform: rotate(-90deg);
  background: yellowgreen;
  border-radius: 50%;
}


</style>
<template>
<div>
  <svg viewBox="0 0 32 32">
    <circle r="16" cx="16" cy="16" :style="stroke"/>
  </svg>


</div>
</template>
<script>
import {
  alert,
  input,
  select,
  tab,
  tabs,
} from 'vue-strap';
Vue.filter('hora', value => String(value).substr(11, 2));
const baseURL = SERVER.baseUrl;
const fechaAIso = (entrada) => String(entrada).split('/').reverse().join('-');
let isoToFecha = function (iso) {
  return String(iso).split('-').reverse().join('-');
};
let fechaToIso = (entrada) => String(entrada).split('/').reverse().join('-');
let blankForm = {};
let fecha = SERVER.date.split('-').reverse().join('/');
export default {
  components: {
    alert,
    vSelect: select,
    vInput: input,
    tab,
    tabs,
  },
  computed: {
    stroke(){

      return {'stroke-dasharray': this.porcentaje + ' 100' };
    }

  },
  mounted() {


  },
  props: {
    porcentaje: Number,

  },
  data() {
    return {};
  },
  methods: {


  },
  watch: {

  }
}
</script>
