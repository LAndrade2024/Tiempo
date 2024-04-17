<template>
<v-select v-model="input"  @input="cambio"  :options="opciones"></v-select>
</template>
<script>
import {
  select
} from 'vue-strap';

export default {
  components: {
    vSelect: select,
  },
  computed: {
    opciones() {
      return this.options.split(',').map(i => {
        return {label: i, value: i};
      });
    }
  },
  data() {
    return {
      input: '',
    }
  },
  mounted() {
    this.input = this.value;
  },
  props: {
    value: '',
    options: String,
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
