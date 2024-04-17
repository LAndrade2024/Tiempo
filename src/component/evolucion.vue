<style>

</style>
<template>
<div class="row" :class="{wait: wait}">
  <div v-if="puedeModificar">
    <pre>{{evolucionActiva.cabecera}}</pre>
    <v-input type="textarea" v-model="evolucionActiva.cuerpo"></v-input>
    <button @click.prevent="guardar()" class="btn btn-primary"><i class="fa fa-save"></i> Guardar</button>
    <a target="_blank" :href="'<?= base_url()?>evolucion/pdf/'+ evolucionActiva.id"><button  class="btn btn-default" ><i class="fa fa-file-pdf-o"></i> Pdf </button></a>
  </div>
  <div v-if="!puedeModificar">
    <pre>{{ evolucionActiva.texto | mostrarSaltos }}</pre>
    <div v-if="evolucionActiva.id">
      <a target="_blank" :href="'<?= base_url()?>evolucion/pdf/'+ evolucionActiva.id"><button  class="btn btn-default" ><i class="fa fa-file-pdf-o"></i> Pdf </button></a>
    </div>
  </div>
</div>
</template>
<script>
import {
  input
} from 'vue-strap';

const baseURL = SERVER.baseUrl;

let isoToFecha = function (iso) {
  return String(iso).split('-').reverse().join('-');
};
let fechaToIso = (entrada) => String(entrada).split('/').reverse().join('-');
let blankForm = {};
let fecha = SERVER.date.split('-').reverse().join('/');
export default {
  components: {
    'v-input': input,
  },
  computed: {
    fechaActual() {
      return fechaToIso(this.fecha);
    },
  },
  mounted() {
    blankForm = Object.assign({}, this.formData);

  },
  props: {
    fecha: String,
    pacienteId: Number
  },
  data() {
    return {
      field: [],
      curaciones: [],
      formData: {
        fecha: "",
        usuario: "",
        cuerpo: ''
        cabecera: '',

      },
      wait: false,
    };
  },
  methods: {
    requestEvolucion() {

    }
  },
  guardar() {
    this.formData.paciente_id = this.pacienteId;
    this.$http.post(baseURL + '', this.formData)
      .then(res => res.json())
      .then(json => {
        this.formData = json;
      });
  },
},
watch: {
  fechaActual() {
    this.requestEscaras();
  },
  pacienteId() {
    this.requestEscaras();
  },
}

}
</script>
