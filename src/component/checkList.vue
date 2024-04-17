<template>
  <div>
    <checkbox @input="cambio" v-model="input[key]" v-for="key in opciones">{{key}}</checkbox>
  </div>
</template>
<script>
import {
  checkbox
} from 'vue-strap';

export default {
  components: {
    checkbox
  },
  computed: {
    opciones() {
      return this.options.split(',');
    }
  },
  created() {
    this.input = typeof this.value === 'object'? this.value : {};
    this.options.split(',').forEach(i => {
      if (!this.input[i]) {
        this.input[i] = false;
      }
    });
  },
  props: {
    value: {},
    options: String,
  },
  methods: {
    cambio(e) {
      this.$emit('input', this.input);
    }
  },
  watch: {
    value() {
      this.input = this.value;
    }
  }
}
</script>
