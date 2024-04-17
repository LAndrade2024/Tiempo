<style>
tr.active {
  border-left: solid blue 3px;
}

.comentarios textarea.form-control {
  height: 254px;
}

.table-too-compact .form-control {
  height: 20px;
  padding: 3px;
  line-height: 1;
  font-size: 12px;
}

.table-too-compact th,
.table-too-compact td {
  padding: 2px !important;
}

textarea {
  min-width: 150px;
}

pre {
  white-space: pre-line;
}
</style>
<template>
<div class="row" :class="{wait: wait}">
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <div v-if="pacienteId">
    <div class="col-sm-12">
      <h3>
        {{paciente.paciente}}
        <small></small>
      </h3>
      <div>
        <div>
          <table class="table table-compact table-striped table-bordered table-too-compact">
            <thead>
              <tr>
                <th></th>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Observacion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formData.items">
                <td><button @click="quitarInsumo(index)" class="btn btn-danger btn-xs"><i class="fa fa-remove"></i></button></td>
                <td>
                  <v-select :options="insumos" v-model="item.insumo_id" :search="true"></v-select>
                </td>
                <td>
                  <input type="text" v-model="item.cantidad" style="width:60px;display: inline-block" class="form-control"></input>
                </td>
                <td>
                  {{ item.insumo_id ? insumosData[item.insumo_id].unimed : '-'}}
                </td>
                <th>
                  <v-input type="textarea" v-model="item.observacion"></v-input>
                </th>
              </tr>
            </tbody>
          </table>
          <div class="clearfix">
            <button class="btn btn-primary " @click="agregarInsumo()">
              <i class="fa fa-plus" ></i> Agregar Insumo
            </button>
          </div>
        </div>

      </div>

      <div class="clearfix" v-if="formData" style="text-align: right">
        <button v-if="pacienteId" class="btn btn-primary " @click="guardar()"><i class="fa fa-save" ></i> Guardar</button>
        <button class="btn btn-default " @click="pdf()"><i class="fa fa-file-pdf-o" ></i> Movimientos Truno</button>
      </div>
    </div>

  </div>
  <div v-if="!pacienteId">
    <button>Transferir Insumos</button>
  </div>

  <div>
    <h3>Stock en farmacia</h3>
    <table class="table table-compact table-striped table-bordered ">
      <thead>
        <tr>
          <th>Insumo</th>
          <th>Stock critico</th>
          <th>Cantidad</th>
          <th>Unidad</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientos">
          <td>{{mov.nombre}}</td>
          <td> </td>
          <td style="color: red">-{{mov.cantidad}}</td>
          <td>{{mov.unidad}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>
<script>
import {
  alert,
  checkbox,
  input,
  select,
  tab,
  tabs,
} from 'vue-strap';
import datepicker from "./datepicker.vue"
Vue.filter('mostrarSaltos', entrada => String(entrada).replace(/[\r\n]/gm, '\n'));
Vue.filter('fechaCorta', v => {
  let arr = String(v).split('-');
  return arr[2] + '/' + arr[1];
});
const baseURL = SERVER.baseUrl;
const fechaAIso = (entrada) => String(entrada).split('/').reverse().join('-');
let pad = (i) => i < 10 ? '0' + i : i;
let dateToString = (m) => '' + m.getFullYear() + '-' + pad(m.getMonth() + 1) + '-' + pad(m.getDate());
let isoToFecha = iso => String(iso).split('-').reverse().join('/');
let fechaToIso = entrada => String(entrada).split('/').reverse().join('-');

Vue.filter('isoToFecha', isoToFecha)
let blankForm = {};
let fecha = SERVER.date.split('-').reverse().join('/');

export default {
  components: {
    alert,
    checkbox,
    datepicker,
    vSelect: select,
    vInput: input,
    tab,
    tabs,
  },
  computed: {
    fechaActual() {
      return fechaToIso(this.fecha);
    },
    formDesde() {
      if (!this.formData) {
        return null;
      }
      return this.formData.fecha;
    },
    pacienteId() {
      if (this.paciente) {
        return this.paciente.id;
      }
      return null;
    }

  },
  mounted() {
    this.$http.get(baseURL + 'farmacia_satelite/formOptions')
      .then(res => res.json())
      .then(json => {
        this.options = json
      });
    this.$http.get(baseURL + 'api/insumo_medico?limit=no')
      .then(res => res.json())
      .then(json => {
        this.insumosData = json.reduce((s, i) => {
          s[i.id] = i;
          return s;
        }, {});
        this.insumos = json.map(i => {
          return {
            label: i.nombre,
            value: i.id,
          };
        });
      });
    this.requestMovimientos();
  },
  props: {
    fecha: String,
    paciente: Object,
    mostrarAnteriores: Boolean,
  },
  data() {
    return {
      formData: {
        items: [],
      },
      insumos: [],
      insumosData: {

      },
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      options: {},
      movimientos: [],
      wait: false,
    };
  },
  methods: {
    agregarInsumo() {
      this.formData.items.push({
        insumo_id: '',
        cantidad: 1,
        unidad: '',
        observacion: ''
      });
    },
    guardar() {
      this.formData.paciente_id = this.paciente.id;
      this.wait = true;
      this.formData.items.forEach(i => {
        i.unidad = this.insumosData[i.insumo_id].unimed;
      });
      this.$http.post(baseURL + 'farmacia_satelite', this.formData)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.formData = {
            items: []
          };
          this.pacienteId = null;
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
          this.requestMovimientos();
        })
        .catch(res => {
          console.log(res);
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible guardar';
          this.msg.show = true;
        });
    },

    nuevo() {

    },
    quitarInsumo(index) {
      this.formData.items.splice(index, 1);
    },
    requestMovimientos() {
      this.$http.get(baseURL + 'api/stock/?fecha=' + SERVER.date)
        .then(res => res.json())
        .then(json => {
          this.movimientos = json;
        })
    },

  },
  watch: {

  }
}
</script>
