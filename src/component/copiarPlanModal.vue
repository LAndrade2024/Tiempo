<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="mostrar" @input="cambioModal($event)" title="Plan trabajo" :backdrop="false">

    <div class="alert alert-info" >
      <i class="fa fa-info"></i> Copiar plan de trabajo entre las fechas sellecionadas y aplicar a partir de la fecha actual.
    </div>
    <div class="row">
      <div class="form-group col-sm-4">
        <label>Copiar desde</label><br/>
        <datepicker v-model="formData.desde"></datepicker>
      </div>
      <div class="form-group col-sm-4">
        <label>Copiar hasta</label><br/>
        <datepicker v-model="formData.hasta"></datepicker>
      </div>
      <div class="form-group col-sm-4">
      </br>
        <button type="button" class="btn btn-primary" @click="doGet()">Buscar</button>
      </div>
    </div>
    <div class="row">
      <div class="form-group col-sm-4">
        <label>Pegar en semana:</label><br/>
        <v-select :options="options.semanas" v-model="formData.pegar"></v-select>
      </div>
    </div>
    <div>

      <div class="alert alert-info" v-if="planACopiar.length">
         Planes encontrados {{planACopiar.length}}
      </div>
    </div>

    <div slot="modal-footer" class="modal-footer">
      <button v-if="planACopiar.length" type="button" class="btn btn-primary" @click="doPost()">Copiar</button>
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

let blankForm = {
  desde: '',
  hasta: '',
  pegar: '',
};

let baseUrl = SERVER.baseUrl;
const controller = 'plan_trabajo';


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
      formData: {},
      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {},
      pacientes: [],
      planACopiar: [],
      user: USER,
    };
  },
  mounted() {
    this.formData = Object.assign({}, blankForm);
    this.requestOptions()
      .then(() => {

        this.formData.pegar = this.options.semanaPredeterminada;
      });

  },
  methods: {
    hide() {
      this.input = false;
      this.mostrar = false;
      this.$emit('closed');
      this.$emit('input', false);
    },
    doGet() {
      this.wait = true;
      this.$http
        .get(baseUrl + controller + '?legajo=' + USER.legajo +'&desde>=' + this.formData.desde + '&desde<=' +this.formData.hasta )
        .then(res => res.json())
        .then((json) => {
          this.planACopiar = json;
        })
        .catch(error => {
          this.msg.show = true;
          this.msg.text = error.bodyText;
          this.wait = false;
        });
    },
    doPost() {
      this.wait = true;

      this.$http
        .post(baseUrl + controller + '/copiar', this.formData)
        .then(() => {
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          //this.planACopiar = json;
          this.hide();
          this.$emit('updated');
          this.$emit('new')
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

    requestOptions() {
      return this.$http.get(baseUrl + controller + '/copiarOptions')
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

  }
}
</script>
