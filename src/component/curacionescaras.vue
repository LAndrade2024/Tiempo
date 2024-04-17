<style>
img.cuerpo {
  vertical-align: middle;
  width: 40%;
  margin: auto;
  display: block;
}
</style>
<template>
<div class="row" :class="{wait: wait}">
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <tabs class="col-sm-10 col-sm-offset-1" v-model="tabs" nav-style="tabs" justified v-if="pacienteId && fecha">
    <tab header="Detalles">
      <form>
        <v-input v-model="formData.ubicacion" type="text" label="Ubicación"></v-input>
        <v-input v-model="formData.grado" type="text" label="Grado" placeholder="I,II,III,IV"></v-input>
        <v-input v-model="formData.observacion" type="textarea" label="Observaciones"></v-input>
        <button type="button" class="btn btn-primary" @click.prevent="guardar">Guardar</button>
      </form>
    </tab>
    <tab header="Diagrama">
      <img class="cuerpo" :src="urlImagen" />
    </tab>
  </tabs>
  <div v-if="!pacienteId">
    Seleccione paciente
  </div>
  <div v-if="!fecha">
    Selecione fecha
  </div>
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
    fechaActual() {
      return fechaToIso(this.fecha);
    },
  },
  mounted() {
    blankForm = Object.assign({}, this.formData);
    this.requestEscaras();
  },
  props: {
    fecha: String,
    pacienteId: Number,
    mostrarAnteriores: Boolean,
  },
  data() {
    return {
      field: [],
      curaciones: [],
      formData: {
        fecha: "",
        usuario: "",
        grado: "",
        ubicacion: "",
        observa: "",
      },
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      tabs: 0,
      urlImagen: baseURL + 'img/cuerpo.svg',
      vitales: [],
      wait: false,
    };
  },
  methods: {
    requestEscaras() {
      this.wait = true;
      this.formData = blankForm;
      if (!this.pacienteId || !this.fechaActual) {
        return;
      }
      this.$http.get(baseURL + 'escara/?sort=-fecha&limit=1&fechaiso<=' + this.fecha + '&paciente_id=' + this.pacienteId)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.formData = {};
          this.curaciones = json;
          if (json[0] && json[0].fechaiso === this.fecha) {
            this.formData = json[0];
            return;
          }
          if (json[0]) {
            this.formData.ubicacion = json[0].ubicacion || '';
            this.formData.grado = json[0].grado || ''
            return;
          }
        });

    },
    guardar() {
      this.formData.paciente_id = this.pacienteId;
      this.formData.fecha = this.fecha.split('-').reverse().join('/');
      this.$http.post(baseURL + 'escara', this.formData)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
          //this.formData = json;
        })
        .catch(res => {
          console.log(res);
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible guardar. ' + (res.body.error || '');
          if (res.body.error === 'carga futura') {
            this.msg.text = 'No se permiten fechas futuras, revise la fecha ingresada';
          }
          this.msg.show = true;
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
