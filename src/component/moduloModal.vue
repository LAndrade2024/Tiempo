<template>
<div>
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal title="Modulo" v-model="mostrar" @input="cambioModal($event)"  :backdrop="false" width="60%">
    <div slot="modal-body" class="modal-body clearfix">
        <div>
          <label>Diagnostico ingreso:</label><br/>
          <pre v-if="formData.numero">{{formData.diagnostico}}</pre>
          <v-select v-if="!formData.numero" :options="options.diagnosticos" v-model="formData.diagnostico_id" :search="true"></v-select>
        </div>
        <hr/>
        <div class="row">
          <div class="col-sm-2">
            <label>Inicio:</label><br/>
            <datepicker v-model="formData.fecha"></datepicker>
          </div>

          <div class="col-sm-3">
            <label>Derivador:</label><br/>
            <v-select :search="true" :options="options.derivadores" v-model="formData.derivador_id"></v-select>
          </div>
          <div class="col-sm-3">
            <label>Sector:</label><br/>
            <v-select :options="options.sectores"  v-model="formData.sector_id" :search="true"></v-select>
          </div>
          <div class="col-sm-2">
            <label>Alta:</label><br/>
            <datepicker v-model="formData.alta" :clear-button="true"></datepicker>
          </div>
          <div class="col-sm-2" v-if="formData.alta">
            <label>Razón alta:</label><br/>
            <v-select :options="options.egreso"  v-model="formData.egreso_id" :search="true"></v-select>
          </div>
        </div>
        <hr />
        <div class="row">
          <div class="col-sm-4" v-if="formData.nuevo|| editable">
            <label>Modulo:</label></br>
            <v-select :options="modulos"  v-model="formData.modulo_id" :search="true"></v-select>
          </div>
          <div class="col-sm-4" v-else>
            <label>Modulo:</label>
            <pre>{{formData.modulo}}</pre>
          </div>
          <div class="col-sm-2" v-if="!editable">
            <br/>
            <button class="btn btn-default" @click="editable = true"><i class="fa fa-edit"></i> Editar</button>
          </div>
          <div class="col-sm-2" v-if="(obra_social_id != 27 && formData.nuevo) || editable">
            <br/>
            <button class="btn btn-default" @click="usarOsep()"><i class="fa fa-refresh"></i> Usar modulos OSEP</button>
          </div>
          <div class="col-sm-2" v-if="formData.nuevo || editable">
            <br/>
            <button class="btn btn-default" @click="usarTodos()"><i class="fa fa-refresh"></i> Usar todos los modulos</button>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Financiador</th>
              <th>Día</th>
              <th>Coseguro día</th>
              <th>Descuento</th>
              <th>Sesiones</th>
              <th>A pagar Paciente</th>
            </tr>
          </thead>
          <tbody >
            <tr v-if="!formData.nuevo && !editable">
              <td>{{ paciente.obra_social}}</td>
              <td>$ {{formData.precio_dia}}</td>
              <td>$ {{formData.coseguro_dia}}</td>
              <td>$ {{formData.descuento}}</td>
              <td> {{formData.n_sesiones || 1}}</td>
              <td>$ {{ formData.coseguro_dia * (formData.n_sesiones || 1) }} </td>
            </tr>
            <tr v-if="editable">
              <td>{{ paciente.obra_social}}</td>
              <td> <input class="form-control" type="text" v-model="formData.precio_dia"></input></td>
              <td> <input class="form-control" type="text" v-model="formData.coseguro_dia"></input></td>
              <td> <input class="form-control" type="text" v-model="formData.descuento"></input></td>
              <td> <input class="form-control" type="text" v-model="formData.n_sesiones"></input></td>
              <td> {{ formData.coseguro_dia * (formData.n_sesiones || 1) }} </td>
            </tr>
          </tbody>
        </table>
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
      formData: {},

      msg: {
        show: false,
        type: '',
        text: '',
      },
      options: {},
      modulos: [],
      modulosPropios: [],
      modulosOsep: [],
      modulosTodos: [],
      precios: {},
      preciosOsep: {},
      preciosPropios: {},
      pacientes: [],
      tratamientos: [],
    };
  },

  mounted() {
    this.requestOptions()
      .then(() => this.nuevo());
    this.requestPreciosOsep();
    this.requestModulos();
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
    doPost() {
      this.wait = true;


      this.formData.paciente_id = this.paciente.id;
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



      this.$http
        .post(baseUrl + controller + '/', this.formData)
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
      this.formData.nuevo = true;

    },

    requestOptions() {
      console.log('options');
      return this.$http.get(baseUrl + controller + '/formOptions')
        .then(res => res.json())
        .then(json => this.options = json);
    },
    requestModulos() {
      return this.$http.get(baseUrl + 'api/modulo?fields=id,nombre')
        .then(res => res.json())
        .then(json => {
          this.modulosTodos = json.map(i => {
            return {label: i.nombre, value: i.id};
          });
        });
    },
    requestPrecios() {
      if (!this.obra_social_id) {
        return;
      }
      if (this.obra_social_id == 27) {
        this.precios = this.preciosOsep;
        this.modulos = this.modulosOsep;
        return;
      }
      this.precios = {};
      return this.$http.get(baseUrl + 'api/modulo_precio?obra_social_id=' + this.obra_social_id)
        .then(res => res.json())
        .then(json => {
          this.precios = json.reduce((s, i) => {
            s[i.id] = i;
            return s;
          }, {});
          this.preciosPropios = this.precios;
          this.modulos = json.map(i => {
            return {label: i.nombre, value: i.id};
          });
          this.modulosPropios = this.modulos;
        });
    },
    requestPreciosOsep() {
      return this.$http.get(baseUrl + 'api/modulo_precio?obra_social_id=27')
        .then(res => res.json())
        .then(json => {
          this.preciosOsep = json.reduce((s, i) => {
            s[i.id] = i;
            return s;
          }, {});
          this.modulosOsep = json.map(i => {
            return {label: i.nombre, value: i.id};
          });
        });
    },
    usarOsep() {
      this.precios = this.preciosOsep;
      this.modulos = this.modulosOsep;
      let modulo_id = this.formData.modulo_id;
      this.formData.modulo_id = 0;
      this.formData.modulo_id = modulo_id;
    },
    usarTodos() {
      this.modulos = this.modulosTodos;
      let modulo_id = this.formData.modulo_id;
      this.formData.modulo_id = 0;
      this.formData.modulo_id = modulo_id;
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
    obra_social_id() {
      this.requestPrecios();
    },
    ingreso() {
      this.formData = Object.assign({}, this.ingreso);
      if (!this.formData.n_sesiones){
          this.formData.n_sesiones = 1;
      }
    },
    modulo_id(){
      let data = this.formData;
      if (!data){
        return;
      }
      if (!this.precios || !this.precios[data.modulo_id]) {
        return;
      }
      data.precio_dia = this.precios[data.modulo_id]['precio_dia'];
      data.coseguro_dia = this.precios[data.modulo_id]['coseguro_dia'];
      console.log( this.precios[data.modulo_id]);
    },
    value() {

      if (this.ingreso && this.ingreso.numero) {
        this.formData = Object.assign({}, this.ingreso);
      }
      if (!this.value) {
        this.reset();
      }
      if (!this.ingreso || !this.ingreso.numero) {
        this.nuevo()
      }

    }
  },
}
</script>
