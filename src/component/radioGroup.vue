<template>
<button-group @input="cambio" v-model="input" :buttons="false">
  <radio v-for="key in opciones" :selected-value="key">{{key}}</radio>
</button-group>
</template>
<script>
import {
  buttonGroup,
  radio,
} from 'vue-strap';

export default {
  components: {
    buttonGroup,
    radio,
  },
  computed: {
    opciones() {
      return this.options.split(',');
    }
  },
  created() {
    this.input = this.value;
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
