<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="mostrar" @input="cambioModal($event)" title="Asistencia Paciente" :backdrop="false">
    <div >


      <div>
        <label>Asistencia</label><br/>
        <radio button v-model="formData.asistencia_tratamiento" :selected-value="0">Sin Asistencia</radio>
        <radio button v-model="formData.asistencia_tratamiento" :selected-value="1">Con Asistencia</radio>
      </div>

      <v-input label="Observacion" v-model="formData.observacion" type="textarea" ></v-input>
      <template v-if="plan.desde < fechaActual">
        <div class="alert alert-info">
            Por favor explique abajo por qué esta completando este reporte un día/s después de ejecutada la tarea.
        </div>
        <v-input label="Justificación"  v-model="formData.justificacion" type="textarea" ></v-input>
      </template>
    </div>
    <div slot="modal-footer" class="modal-footer">
      <button v-if="!formData.nuevo" type="button" class="btn btn-primary" @click="doPut()">Modificar</button>
      <button v-if="!formData.nuevo" type="button" class="btn btn-danger" @click="doDelete()">Borrar</button>
      <button v-if="formData.nuevo" type="button" class="btn btn-primary" @click="doPost()" :disabled="plan.desde < fechaActual && !formData.justificacion" >Guardar</button>
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
const controller = 'asistencia';
let blankForm = {
  legajo: USER.legajo,
  observacion: ' ',
  plan_trabajo_id: '',
  asistencia_tratamiento: 0,
  nuevo: true,
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

  },
  data() {
    return {
      estado: this.paciente ? 0 : 1,
      fechaActual: SERVER.date,
      formData: {},
      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {},

      plan: {},
      user: USER,
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
      //this.value = false;
      this.$emit('closed');
      this.$emit('input', false);
    },

    doPost() {
      this.wait = true;


      this.formData.plan_trabajo_id = this.planTrabajoId;
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


      this.formData.plan_trabajo_id = this.planTrabajoId;
      this.$http
        .put(baseUrl + controller + '/' + this.planTrabajoId, this.formData)
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
        .delete(baseUrl + controller + '/' +  this.planTrabajoId)
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
      this.formData.periodico = 'no';
      this.formData.evento_tipo_id = 1;
    },

    requestAsistencia() {
      this.$http.get(baseUrl + 'asistencia/' + this.planTrabajoId)
        .then(res => res.json())
        .then(json => {
          this.formData = json;
          this.formData.nuevo = false;
        })
        .catch(() => this.nuevo);
    },

    requestPlan(){
      this.$http.get(baseUrl + 'plan_trabajo/' + this.planTrabajoId)
        .then(res => res.json())
        .then(json => {
          this.plan = json;
        })
        .catch(res => console.error(res));
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
    value: {
      default: false,
    },
    planTrabajoId: null,
  },
  watch: {

    value() {
      if (!this.planTrabajoId || !this.value){
        return;
      }
      this.requestPlan();
      this.requestAsistencia();
    }
  }
}
</script>
