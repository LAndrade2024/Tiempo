<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="mostrar" @input="cambioModal($event)" title="Asistencia Paciente" :backdrop="false">
    <div >
      <label>Porcentaje consumido</label>
      <div class="row" style="    text-align: center;">
        <div class="col-sm-2 col-sm-offset-1">
          <pie :porcentaje="101"></pie>
          <input type="radio" v-model="formData.porcentaje_consumido" value="100"> </input>
          <div>Todo</div>
        </div>
        <div class="col-sm-2">
          <pie :porcentaje="75"></pie>
          <input type="radio" v-model="formData.porcentaje_consumido" value="75"></input>
          <div>75%</div>
        </div>
        <div class="col-sm-2">
          <pie :porcentaje="50"></pie>
          <input type="radio" v-model="formData.porcentaje_consumido" value="50"></input>
          <div>50%</div>
        </div>
        <div class="col-sm-2">
          <pie :porcentaje="25"></pie>
          <input type="radio" v-model="formData.porcentaje_consumido" value="25"></input>
          <div>25%</div>
        </div>
        <div class="col-sm-2">
          <pie :porcentaje="0"></pie>
          <input type="radio" v-model="formData.porcentaje_consumido" value="0"></input>
          <div>nada</div>
        </div>
      </div>
      <div>
        <label>Suplementado</label><br/>
        <radio button v-model="formData.suplementado" :selected-value="1">Si </radio>
        <radio button v-model="formData.suplementado" :selected-value="0">No</radio>
      </div>
      <v-input label="Observacion" v-model="formData.observacion" type="textarea" ></v-input>
    </div>
    <div slot="modal-footer" class="modal-footer">
      <button v-if="!formData.nuevo" type="button" class="btn btn-primary" @click="doPut()">Modificar</button>
      <button v-if="!formData.nuevo" type="button" class="btn btn-danger" @click="doDelete()">Borrar</button>
      <button v-if="formData.nuevo" type="button" class="btn btn-primary" @click="doPost()">Guardar</button>
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
import pie from './pie.vue';

let baseUrl = SERVER.baseUrl;
const controller = 'asistencia_nutricion';
let blankForm = {

  observacion: ' ',
  id: '',
  porcentaje_consumido: 100,
  suplementado: 0,
  nuevo: true,
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
    pie,
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
      this.formData.id = this.planId;
      this.$http
        .post(baseUrl + controller, this.formData)
        .then(() => {
          this.$emit('new', {})
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          this.nuevo();
          this.hide();
          this.$emit('updated');
        })
        .catch(error => {
          this.msg.show = true;
          this.msg.text = error.bodyText;
          this.wait = false;
        });
    },
    doPut() {
      this.wait = true;
      this.formData.id = this.planId;
      this.$http
        .put(baseUrl + controller + '/' + this.planId, this.formData)
        .then(() => {
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          this.nuevo();
          this.hide();
          this.$emit('updated');
          this.$emit('new', {})
        })
        .catch(error => {
          this.msg.show = true;
          this.msg.text = error.bodyText;
          this.wait = false;
        });
    },
    doDelete() {
      this.$http
        .delete(baseUrl + controller + '/' +  this.planId)
        .then(() => {
          this.msg.show = true;
          this.msg.text = "Borrado exitosamente";
          this.msg.type = 'success';
          this.nuevo();
          this.hide();
          this.$emit('updated');
          this.$emit('new', {})
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
      this.formData.id = this.planId;
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
    requestAsistencia() {
      this.$http.get(baseUrl + controller + '/' +this.planId)
        .then(res => res.json())
        .then(json => {
          this.formData = json;
          this.formData.nuevo = false;
        })
        .catch(() => this.nuevo);
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
    planId: null,
  },
  watch: {
    fecha() {
      this.formData.fecha = this.fecha;

    },
    hora() {
      this.formData.hora = this.hora;
      console.log(this.hora);
    },
    value() {
      if (!this.planId || !this.value){
        return;
      }
      this.requestAsistencia();
    }
  }
}
</script>
