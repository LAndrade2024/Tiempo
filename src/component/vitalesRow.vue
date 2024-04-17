<style>
.vertical {
  transform: rotate(270deg);
  height: 18px;
  width: 80px;
}

.nombre-vitales {
  width: 150px;
  max-width: 100px;
}

th.turnos {
  text-align: center;
  border: 1px solid #bbb;
}
</style>
<template>
<tr>
  <td v-if="header" :rowspan="headerspan" style="vertical-align: middle;width: 5%;">
    <div class="vertical">
      {{header}}
    </div>
  </td>
  <td class="nombre-vitales"><strong>{{label}}</strong></td>
  <td v-for="item in items.noche">{{item[clave]}}</td>
  <td><strong v-if="total">{{suma(items.noche, clave)}}</strong></td>
  <td v-for="item in items.mañana">{{item[clave]}}</td>
  <td><strong v-if="total">{{suma(items.mañana, clave)}}</strong></td>
  <td v-for="item in items.tarde">{{item[clave]}}</td>
  <td><strong v-if="total">{{suma(items.tarde, clave)}}</strong></td>
  <td class="input">
    <vs-input :type="type" :placeholder="placeholder" v-model="value[clave]"></vs-input>
  </td>
</tr>
</template>
<script>
import {
  input,
} from 'vue-strap';
export default {
  props: {
    clave: String,
    header: String,
    headerspan: Number,
    items: Object,
    label: String,
    value: Object,
    placeholder: {
      type: String,
      default () {
        return '';
      },
    },
    total: Boolean,
    type: {
      type: String,
      default () {
        return 'text';
      },
    }
  },
  components: {
    'vs-input': input,
  },
  methods: {
    suma(items, clave) {
      return items.reduce((sofar, i) => {
        let v = parseFloat(i[clave]);
        return sofar + (isNaN(v) ? 0 : v);
      }, 0);
    }
  },
}
</script>
