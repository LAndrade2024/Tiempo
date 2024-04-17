<style>

</style>
<template>
<div  v-if="diaArm[fecha]">
  Con ARM {{diaArm[fecha].modo}} <span>Total fecha: </span>{{arm.indexOf(diaArm[fecha]) + 1}}<span> Total mes:</span>{{arm.length}}
</div>
</template>
<script>
import {
  alert,
  input,
  select,
} from 'vue-strap';
Vue.filter('hora', value => String(value).substr(11, 2));
const baseURL = SERVER.baseUrl;
const fechaAIso = (entrada) => String(entrada).split('/').reverse().join('-');
let isoToFecha = function (iso) {
  return String(iso).split('-').reverse().join('-');
};
let fechaToIso = (entrada) => String(entrada).split('/').reverse().join('-').substr(0, 10);
let blankForm = {};
let fecha = SERVER.date;
export default {
  components: {},
  computed: {},
  props: {
    arm: '',
    diaArm: '',
    fecha: '',
  },
  data() {
    return {};
  },
  methods: {

  },

}
</script>
