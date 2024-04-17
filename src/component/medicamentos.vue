<style>
tr.active {
  border-left: solid blue 3px;
}

.comentarios textarea.form-control {
  height: 254px;
}

.table-too-compact .form-control {
  height: 20px;
  padding: 3px;
  line-height: 1;
  font-size: 12px;
}

.table-too-compact th,
.table-too-compact td {
  padding: 2px !important;
}

textarea {
  min-width: 150px;
}

pre {
  white-space: pre-line;
}
</style>
<template>

</template>
<script>
export default {
  components: {
    alert,
    checkbox,
    datepicker,
    vSelect: select,
    vInput: input,
    tab,
    tabs,
  },
  computed: {

    pacienteId() {
      if (this.paciente) {
        return this.paciente.id;
      }
      return null;
    }

  },
  mounted() {

  },

  data() {
    return {
      formData: {
        items: [],
      },
      insumos: [],
      insumosData: {

      },
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      options: {},
      movimientos: [],
      wait: false,
    };
  },
  methods: {

  },
  watch: {

  }
}
</script>
