<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="mostrar" @input="cambioModal($event)" title="Plan trabajo" :backdrop="false">

    <div class="alert alert-info" v-if="!paciente">
      <i class="fa fa-info"></i> Seleccione un paciente. Si no aparece en la lista el paciente que busca
      asegúrese que el paciente tenga un módulo activo en la fecha seleccionada.
    </div>
    <div class="row">
      <div class="form-group col-sm-8">
        <label>Paciente</label><br/>
        <v-select v-if="!paciente || !paciente.id" v-model="formData.paciente_id" :search="true" :options="pacientes"></v-select>
        <pre v-else >{{paciente.nombre}}</pre>
      </div>
      <div class="form-group col-sm-4">
        <label>Fecha</label><br/>
        <datepicker v-if="!fecha" v-model="formData.fecha"></datepicker>
        <pre v-if="fecha">{{fechaNormal}}</pre>
      </div>
    </div>
    <div class="row">
      <div class="form-group col-sm-8">
        <label>Tratamiento</label><br/>
        <v-select :options="tratamientos" v-model="formData.tratamiento_id" :search="true"></v-select>
      </div>
      <div class="form-group col-sm-4">
        <label>Hora</label><br/>
        <v-select :options="horas" v-model="formData.hora" :search="true"></v-select>
      </div>
    </div>
    <div class="form-group" >
      <label>Team</label><br/>
      <v-select :options="options.grupo_terapeuta" v-model="formData.terapeuta_grupo_id" :search="true"></v-select>
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
let blankForm = {
  paciente_id: '',
  tratamiento_id: '',
  fecha: SERVER.date,
  hora: "08:00:00",
  usuario_id: USER.id,
};

import datepicker from './datepicker.vue';

let baseUrl = SERVER.baseUrl;
const controller = 'plan_trabajo';

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
    this.requestOptions();
    this.formData = Object.assign({}, blankForm);
    if (!this.paciente_id) {
      this.requestPacientes()
    }
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
        this.formData.fecha = this.fecha;
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
          this.formData = Object.assign({}, blankForm);
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
      this.$http.get(baseUrl + controller + '/formOptions')
        .then(res => res.json())
        .then(json => this.options = json);
    },
    requestPacientes() {
      if (!this.formData.fecha) {
        return;
      }
      this.$http.get(baseUrl + 'historia/agrupado?activo_mes=' + this.formData.fecha)
        .then(res => res.json())
        .then(json => this.pacientes = json.map(i => {
            return {
              value: i.id_paciente,
              label: i.nombre + " - " + i.id_paciente + " (" + i.financiador + " )",
            };
          }

        ));
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
      this.requestPacientes();
    },
    hora() {
      this.formData.hora = this.hora;
      console.log(this.hora);
    },
  }
}
</script>
