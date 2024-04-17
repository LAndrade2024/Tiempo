<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="mostrar" @input="cambioModal($event)" title="Agregar evento" :backdrop="false">
    <div class="row">
      <div class="form-group col-sm-4">
        <label>Fecha</label><br/>
        <datepicker v-if="!fecha" v-model="formData.vigente_desde"></datepicker>
        <pre v-if="fecha">{{fechaNormal}}</pre>
      </div>
      <div class="form-group col-sm-4">
        <label>Desde</label><br/>
        <v-select :options="horas" v-model="formData.hora_desde" :search="true"></v-select>
      </div>
      <div class="form-group col-sm-4">
        <label>Hasta</label><br/>
        <v-select :options="horas" v-model="formData.hora_hasta" :search="true"></v-select>
      </div>
    </div>
    <div class="row">
      <div class="form-group col-sm-4">
        <label>Tipo evento</label><br/>
        <v-select :options="options.tipos" v-model="formData.evento_tipo_id" :search="true"></v-select>
      </div>


      <div class="form-group col-sm-8">
        <label>Periodicos</label><br/>
        <v-select :options="options.periodicos" v-model="formData.periodico" :search="true"></v-select>
      </div>
    </div>
    <div slot="modal-footer" class="modal-footer">
      <button type="button" class="btn btn-primary" @click="doPost()">Guardar</button>
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
const controller = 'evento_empleado';
let blankForm = {
  legajo: USER.legajo,
  evento_tipo_id: '',
  hora_desde: '08:00:00',
  hora_hasta: '09:00:00',
  vigente_desde: SERVER.date,
  periodico: '',
}

let horas = (function () {
  let salida = [];
  let j = '';
  for (let i = 0; i < 24; i++) {
    j = i > 9 ? i : ('0' + i);
    salida.push({
      label: i + ':00',
      value: j + ':00:00',
    });
  }
  return salida;
}());

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
    fechaNormal() {
      return this.fecha ? this.fecha.split('-').reverse().join('/') : '';
    }
  },
  data() {
    return {
      estado: this.paciente ? 0 : 1,
      formData: {},
      horas: horas,
      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {},
      pacientes: [],
      tratamientos: [],
      user: USER,
    };
  },
  mounted() {
    this.requestTratamiento();
    this.requestOptions()
      .then(() => this.nuevo());


  },
  methods: {
    hide() {
      this.input = false;
      this.mostrar = false;
      //this.value = false;
      this.$emit('closed');
      this.$emit('input', false);
    },

    doPost() {
      this.wait = true;

      if (this.paciente && this.paciente.id) {
        this.formData.paciente_id = this.paciente.id;
      }
      if (this.fecha) {
        this.formData.vigente_desde = this.fecha;
      }
      if (this.hora) {
        this.formData.hora = this.hora;
      }
      this.$http
        .post(baseUrl + controller, this.formData)
        .then(res => res.json())
        .then((json) => {
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          this.nuevo();
          this.hide();
          this.$emit('updated');
          this.$emit('new', json)
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
      this.formData.periodico = 'no';
      this.formData.evento_tipo_id = 1;
    },

    requestTratamiento() {
      this.$http.get(baseUrl + 'api/tratamiento')
        .then(res => res.json())
        .then(json => this.tratamientos = json.map(i => {
            return {
              value: i.id,
              label: i.nombre + " (" + i.id + " )",
            };
          }

        ));
    },
    requestOptions() {
      return this.$http.get(baseUrl + controller + '/formOptions')
        .then(res => res.json())
        .then(json => this.options = json);
    },

  },
  props: {
    paciente: null,
    show: false,
    fecha: '',
    hora: '',
    value: {
      default: false,
    },
  },
  watch: {
    fecha() {
      this.formData.fecha = this.fecha;

    },
    hora() {
      this.formData.hora = this.hora;
      console.log(this.hora);
    },
  }
}
</script>
