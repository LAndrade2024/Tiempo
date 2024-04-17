<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="input" @input="cambioModal($event)" title="Estado ARM" :backdrop="false">
    <div class="alert alert-info" v-if="paciente && fecha">
      <i class="fa fa-info"></i> Por favor indique el estado de ARM del paciente {{paciente.nombre}}
      el día {{fechaNormal}}
    </div>
    <div class="alert alert-info" v-if="!paciente">
      <i class="fa fa-info"></i> Seleccione un paciente. Si no aparece en la lista desplegable asegúrese que el paciente este internado en la fecha seleccionada.
    </div>
    <div>
      <label>Estado</label><br/>
      <radio button v-model="estado" :selected-value="0">Sin Arm</radio>
      <radio button v-model="estado" :selected-value="1">Con Arm</radio>
    </div>

    <div v-if="estado">
      <pre>El paciente utiliza ARM</pre>
      <div class="form-group">
        <label>Fecha</label><br/>
        <datepicker v-if="!fecha" v-model="formData.fechaActual" ></datepicker>
        <pre v-if="fecha">{{fechaNormal}}</pre>
      </div>
      <div class="form-group">
        <label>Paciente</label><br/>
        <v-select v-if="!paciente || !paciente.id" v-model="formData.paciente_id" :search="true" :options="pacientes"></v-select>
        <pre v-else >{{paciente.nombre}}</pre>
      </div>
      <div class="form-group" >
        <label>Modo</label><br/>
        <v-select :options="options.modos" v-model="formData.modo"></v-select>
      </div>
    </div>
    <div v-else>
      <pre>El paciente no utiliza ARM</pre>
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
  modo: 'VCV',
  fecha: SERVER.date,
};

import datepicker from './datepicker.vue';

let baseUrl = SERVER.baseUrl;

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
    fechaNormal() {
      return this.fecha ? this.fecha.split('-').reverse().join('/') : '';
    }
  },
  data() {
    return {
      estado: this.paciente ? 0 : 1,
      formData: {},
      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {
        modos: [],
      },
      pacientes: [],
    };
  },
  mounted() {
    this.requestModos();
    this.formData = Object.assign({}, blankForm);
    if (!this.paciente_id) {
      this.requestPacientes()
    }
  },
  methods: {
    hide() {
      this.input = false;
      //this.value = false;
      this.$emit('closed');
      this.$emit('input', false);
    },
    doDelete() {
      this.$http.post(baseUrl + 'arm/quitar/', this.formData)
        .then(() => {
          this.hide();
        });
    },
    doPost() {
      this.wait = true;
      if (!this.estado) {
        return this.doDelete();
      }
      if (this.paciente && this.paciente.id) {
        this.formData.paciente_id = this.paciente.id;
      }
      if (this.fecha) {
        this.formData.fecha = this.fecha;
      }
      this.$http
        .post(baseUrl + 'arm', this.formData)
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
    requestModos() {
      this.$http.get(baseUrl + 'arm/formOptions')
        .then(res => res.json())
        .then(json => this.options = json);
    },
    requestPacientes() {
      if (!this.formData.fecha) {
        return;
      }
      this.$http.get(baseUrl + 'historia/agrupado?internado_mes=' + this.formData.fecha)
        .then(res => res.json())
        .then(json => this.pacientes = json.map(i => {
            return {
              value: i.id_paciente,
              label: i.nombre + " - " + i.id_paciente + " (" + i.financiador+ " )",
            };
          }

        ));
    },
  },
  props: {
    paciente: null,
    show: false,
    fecha: '',
    value: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    fecha() {
      this.formData.fecha = this.fecha;
      this.requestPacientes();
    },
  }
}
</script>
