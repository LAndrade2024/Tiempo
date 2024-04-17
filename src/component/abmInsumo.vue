<style>

</style>
<template>
<div class="row" >
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <modal v-model="input" @input="cambioModal($event)" :title="formData.id ? 'Editar Insumo' : 'Nuevo Insumo'" :backdrop="false">
    <v-input v-model="formData.nombre" type="text" label="Nombre"></v-input>
    <div class="row">
      <div class="col-sm-6">
        <label>Rubro</label><br>
        <v-select v-model="formData.rubro_id" :options="rubros" :search="true"> </v-select>
      </div>
      <div v-if="user.role === 'admin'" class="col-sm-6">
        <label>Centro Compra</label><br>
        <v-select v-model="formData.centro_compra_id" :options="options.centros_compra" :search="true"> </v-select>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <label>Unidad</label><br>
        <v-select v-model="formData.unidad" :options="unidades" :search="true"> </v-select>
      </div>
      <div class="col-sm-6">
        <label>Unidad compra</label><br>
        <v-select v-model="formData.unidad_compra" :options="unidades" :search="true"> </v-select>
      </div>
    </div>

    <div>
      <v-input label="IVA" v-model="formData.iva"> </v-input>
    </div>
    <div slot="modal-footer" class="modal-footer">
      <button v-if="formData.id" type="button" class="btn btn-primary" @click="doPut()">
        <i class="fa fa-save"></i> Modificar
      </button>
      <button v-if="!formData.id" type="button" class="btn btn-primary" @click="doPost()">
        <i class="fa fa-save"></i> Guardar
      </button>
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
  select,
} from 'vue-strap';
Vue.filter('hora', i => String(i).substr(11, 2));
const baseUrl = SERVER.baseUrl;
const fechaAIso = (entrada) => String(entrada).split('/').reverse().join('-');
const centro_compra_user = parseInt(USER.centro_compra_id, 10);
let isoToFecha = function (iso) {
  return String(iso).split('-').reverse().join('-');
};
let fechaToIso = (entrada) => String(entrada).split('/').reverse().join('-');
let blankForm = {
  unidad: 'Unidad',
  rubro_id: '',
  nombre: '',
  centro_compra_id: centro_compra_user,
};
let fecha = SERVER.date.split('-').reverse().join('/');
let blank = {};
export default {
  components: {
    alert,
    modal,
    vSelect: select,
    vInput: input,
  },
  computed: {
    input(){
      return this.value;
    },
    formData(){
      return this.data;
    }
  },
  mounted() {
    this.formData = Object.assign({}, blankForm);
    this.formData.centro_compra_id = 0;
    this.$http.get(baseUrl + 'insumo/formOptions')
      .then(res => res.json())
      .then(json => this.options = json)
      .then(() => {
        this.formData.centro_compra_id = USER.centro_compra_id;
      });
    this.requestRubros();
    this.$http.get(baseUrl + 'api/unidad')
      .then(res => res.json())
      .then(json => {
        this.unidades = json.map(i => {
          return {
            label: i.nombre,
            value: i.codigo,
          };
        });
        this.requestedRubros = this.rubros;
      });
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return Object.assign({}, blankForm);
      },
    },
  },
  data() {
    return {

      msg: {
        type: 'danger', //success info warning danger
        text: '',
        show: false,
      },
      options: {
        centros_compra: [],
      },
      unidades: [],
      user: USER,
      rubros: [],
      wait: false,
    };
  },
  methods: {
    hide(){
      this.input = false;
      //this.value = false;
      this.$emit('closed');
      this.$emit('input', false);

    },
    doPost() {
      this.wait = true;
      this.formData.id = null;
      this.$http
        .post(baseUrl + 'insumo', this.formData)
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
    doPut() {
      this.wait = true;
      this.$http
        .put(baseUrl + 'insumo/' + this.formData.id, this.formData)
        .then(res => res.json())
        .then((json) => {
          this.msg.show = true;
          this.msg.text = "Guardado exitosamente";
          this.msg.type = 'success';
          this.formData = Object.assign({}, blankForm);;
          this.hide();
          this.$emit('updated');
        })
        .catch(error => {
          this.msg.show = true;
          this.msg.text = error.bodyText;
          this.wait = false;
        });
    },
    requestRubros() {
      let filtro = centro_compra_user === 99 ? '' : 'centro_compra_id=' + centro_compra_user;
      this.$http.get(baseUrl + 'api/rubro?' + filtro)
        .then(res => res.json())
        .then(json => {
          this.rubros = json.map(i => {
            return {
              label: i.nombre,
              value: i.id,
            };
          });
        });
    },
    cambioModal($event) {
      this.$emit('input', $event);
    }

  },
  watch: {

  }
}
</script>
