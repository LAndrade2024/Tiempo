<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal title="Alta paciente" v-model="mostrar" @input="cambioModal($event)"  :backdrop="false" width="60%">
    <div slot="modal-body" class="modal-body clearfix">


        <pre>{{paciente.nombre}}</pre>

        <table class="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Ingreso</th>
              <th>Diagnostico</th>
              <th>Modulo</th>
              <th>Sector</th>
              <th>Alta</th>
              <th>Razón Alta</th>
            </tr>
          </thead>
          <tbody >
            <tr v-for="historia in historias">
              <td>{{ historia.numero}}</td>
              <td>{{historia.fecha}}</td>
              <td>{{historia.diagnostico}}</td>
              <td>{{historia.modulo}}</td>
              <td>{{historia.sector}}</td>
              <template v-if="historia.alta">
                <td>{{historia.alta}}</td>
                <td>{{historia.egreso}}</td>
              </template>
              <template v-if="!historia.alta">
                <td>-</td>
                <td>
                  <v-select :options="options.egreso" v-model="formData[historia.numero]" clear-button placeholder="Sin alta"></v-select>
                </td>
              </template>
            </tr>

          </tbody>
        </table>
      </div>
      <div slot="modal-footer" class="modal-footer">

        <button type="button" class="btn btn-primary" @click="guardar()">Guardar</button>
        <button type="button" class="btn btn-default" @click="hide()">Cancelar</button>
      </div>
  </modal>
</div>
</template>
<script>
import {
  alert,
  input,
  modal,
  radio,
  select,
} from 'vue-strap';

import datepicker from './datepicker.vue';

let baseUrl = SERVER.baseUrl;
const controller = 'modulo_paciente';
let blankForm = {
  coseguro_dia: 0,
  precio_dia: 0,
  n_sesiones: 1,
}



export default {
  components: {
    alert,
    datepicker,
    modal,
    radio,
    vInput: input,
    vSelect: select,
  },
  computed: {
    input() {

      return this.value;
    },
    mostrar() {
      return !!this.value;
    },
    modulo_id() {
      if (!this.formData){
        return null;
      }
      return this.formData.modulo_id;
    },
    totalPaciente(){
      let data = this.formData;
      console.log(data);
      return data.n_sesiones * (this.precios[data.modulo_id] ? this.precios[data.modulo_id].coseguro_dia : 0)  - (data.descuento || 0);
    },
  },
  data() {
    return {
      editable: false,
      fecha: SERVER.date.split('-').reverse().join('/'),
      formData: {},
      historias: [],
      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {},

    };
  },

  mounted() {
    this.requestOptions()
      .then(() => this.nuevo());


  },
  methods: {
    hide() {
      this.input = false;
      this.mostrar = false;
      this.editable = false;
      this.$emit('input', false);
      this.reset();
    },
    reset() {
      this.nuevo();
      this.$emit('closed');
      this.modulos = this.modulosPropios;
      this.precios = this.preciosPropios;
    },
    guardar() {
      this.wait = true;
      let cambios = Object.entries(this.formData).filter(e => e[1]).map(e => {
        return {egreso_id: e[1],numero: e[0]};
      });
      Promise.all(cambios.map(e => this.doPost(this.paciente.id,parseInt(e.numero,10), e.egreso_id)))
      .then(() => {
        this.wait = false;
        this.$emit('alta');
        this.hide();

      });

    },
    doPost(paciente_id, numero, egreso_id){
      let data = {
        paciente_id,
        numero,
        egreso_id,
      };
      return this.$http.post(baseUrl + "mapa_cama/alta", data);

    },
    doPut() {
      this.wait = true;



      this.$http
        .post(baseUrl + controller + '/', this.formData)
        .then(() => {
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          this.nuevo();
          this.hide();
          this.$emit('updated');
          this.$emit('alta', {})
        })
        .catch(error => {
          this.msg.show = true;
          this.msg.text = error.bodyText;
          this.wait = false;
        });
    },

    cambioModal($event) {
      this.$emit('input', $event);
    },
    nuevo(){
      this.formData = Object.assign({}, blankForm);
      this.formData.nuevo = true;

    },

    requestOptions() {
      console.log('options');
      return this.$http.get(baseUrl + controller + '/formOptions')
        .then(res => res.json())
        .then(json => this.options = json);
    },
    requestHistorias() {
      this.historias = [];
      return this.$http.get(baseUrl + 'api/historia?paciente_id=' + this.paciente.id)
        .then(res => res.json())
        .then(json => {
          this.historias = json
          this.formData = {};
          this.historias.forEach(h => this.formData[h.numero] = false)
        });
    },


  },
  props: {
    paciente: null,
    ingreso: null,
    obra_social_id: null,
    value: {
      default: false,
    },
    financiador_id: 0,
  },
  watch: {

    value(){

      if (this.value) {
        this.requestHistorias();
      }
    }

  },
}
</script>
