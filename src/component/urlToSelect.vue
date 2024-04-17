<template>
<v-select v-model="input"  @input="cambio" :search="true"  :options="opciones"></v-select>
</template>
<script>
import {
  select
} from 'vue-strap';

export default {
  components: {
    vSelect: select,
  },
  data() {
    return {
      opciones: [],
      input: '',
    }
  },
  computed: {
  },
  mounted() {
    this.$http.get(this.url + '?fields=id,nombre')
      .then(res => res.json())
      .then(json => {
        this.opciones = json.map(i => {
          return {
            label: i.nombre,
            value: i.id,
          };
        });
        this.input = this.value;
      })
  },
  props: {
    value: '',
    url: String,

  },
  methods: {
    cambio(e) {
      this.$emit('input', this.input);
    }
  },
  watch: {
    value(){
      this.input = this.value;
    }
  }
}
</script>
