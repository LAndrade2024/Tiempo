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

.antes12 {
  color: gray;
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
    <div class="col-sm-1">
      <h4>Anteriores</h4>
      <table class="table table-compact table-striped table-bordered ">
        <thead>
          <tr>
            <th>Indicacion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cabecera in cabeceras" :class="{active: cabeceraActiva && cabecera.id == cabeceraActiva.id}" @click="cabeceraActiva = cabecera" style="cursor: pointer">
            <td>{{cabecera.fecha|fechaCorta }} {{cabecera.responsable}} <button class="btn btn-danger btn-xs" v-if="allowed.delete" @click.prevent="borrarCabecera(cabecera.id)"><i class="fa fa-remove"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-sm-11">
      <h3>
        {{paciente.paciente}} ({{tipo}})
        <small v-if="!formData">
          <button v-if="cabeceraActiva && allowed.post" class="btn btn-default" @click="copiar"><i class="fa fa-copy"></i> Duplicar</button>
          <button v-if="allowed.post" class="btn btn-default" @click="nuevo"><i class="fa fa-file"></i> Nuevo</button>
          <button v-if="cabeceraActiva" class="btn btn-primary" @click="getPdf(cabeceraActiva.id)"><i class="fa fa-file-pdf-o"></i> Pdf</button>
        </small>
      </h3>
      <div v-if="formData">
        <div>
          <strong>Desde:</strong>
          <datepicker format="dd/MM/yyyy" v-model="formData.fecha"></datepicker>
          <strong>Hasta:</strong>
          <strong> {{formData.hasta|isoToFecha}}</strong>
          <table class="table table-compact table-striped table-bordered table-too-compact">
            <thead>
              <tr>
                <th></th>
                <th>Medicamento</th>
                <th>Via</th>
                <th>Dosis</th>
                <th v-if="tipo !== 'uce'">Noche</th>
                <th>Frecuencia</th>
                <th>Inicio</th>
                <template v-if="tipo !== 'uce'">
                  <th>lun</th>
                  <th>mar</th>
                  <th>mie</th>
                  <th>jue</th>
                  <th>vie</th>
                  <th>sab</th>
                  <th>dom</th>
                </template>
                <template v-if="tipo === 'uce'">
                  <th>{{dia}}</th>
                  <th>{{ diaSiguiente }}</th>
                </template>
                <th>Indicación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(indicacion, index) in formData.items">
                <td><button @click="quitarInsumo(index)" class="btn btn-danger btn-xs"><i class="fa fa-remove"></i></button></td>
                <td>
                  <v-select :options="insumos" v-model="indicacion.medicamento" :search="true"></v-select>
                  <template v-if="!existe(indicacion.medicamento)">
                    <br/>
                    <span class="alert alert-danger">Ya no se encuentra {{indicacion.medicamento}}</span>
                  </template>
                </td>
                <td>
                  <v-select :options="options.vias" v-model="indicacion.via"></v-select>
                </td>
                <td>
                  <input type="text" v-model="indicacion.dosis" style="width:60px;display: inline-block" class="form-control"></input>
                  <v-select :options="options.unidades" v-model="indicacion.unidad" :search="true" placeholder="nada"></v-select>
                </td>
                <th v-if="tipo !== 'uce'">
                  <checkbox v-model="indicacion.nocturno"></checkbox>
                </th>
                <td>
                  <v-select :options="options.horas" v-model="indicacion.frecuencia" placeholder="nada"></v-select>
                </td>
                <th>
                  <v-select :options="horasDia" v-model="indicacion.hora_inicio" placeholder="nada"></v-select>
                </th>
                <template v-if="tipo !=='uce'">
                  <th>
                    <checkbox v-model="indicacion.usarDia.lun"></checkbox>
                    <hr> {{ calcIndicacion(index, 'lun') }}
                  <th>
                    <checkbox v-model="indicacion.usarDia.mar"></checkbox>
                    <hr> {{ calcIndicacion(index, 'mar') }}
                  </th>
                  <th>
                    <checkbox v-model="indicacion.usarDia.mie"></checkbox>
                    <hr> {{ calcIndicacion(index, 'mie') }}
                  </th>
                  <th>
                    <checkbox v-model="indicacion.usarDia.jue"></checkbox>
                    <hr> {{ calcIndicacion(index, 'jue') }}
                  </th>
                  <th>
                    <checkbox v-model="indicacion.usarDia.vie"></checkbox>
                    <hr> {{ calcIndicacion(index, 'vie') }}
                  </th>
                  <th>
                    <checkbox v-model="indicacion.usarDia.sab"></checkbox>
                    <hr> {{ calcIndicacion(index, 'sab') }}
                  </th>
                  <th>
                    <checkbox v-model="indicacion.usarDia.dom"></checkbox>
                    <hr> {{ calcIndicacion(index, 'dom') }}
                  </th>
                </template>
                <template v-if="tipo === 'uce'">
                  <th>
                    <span v-for="hora in calcIndicacionUceDesde(index)" :class="{antes12 : hora <= 12}">{{hora}} </span>
                  </th>
                  <th>
                    {{ calcIndicacionUceHasta(index) }}
                  </th>
                </template>
                <th>
                  <v-input type="textarea" v-model="indicacion.observaciones"></v-input>
                </th>
              </tr>
            </tbody>
          </table>
          <div class="clearfix">
            <button class="btn btn-primary pull-right" @click="agregarInsumo()">
              <i class="fa fa-plus" ></i> Agregar Medicamento
            </button>
          </div>
        </div>
        <div class="row comentarios">
          <div class="col-sm-4">
            <label>Alimentación</label><br/>
            <pre v-if="tipoAlimentacion === 'sng'">
              SNG con guia y bomba correspondiente
            </pre>
            <pre v-if="tipoAlimentacion === 'gastro'">
              Gastroma con guía y bomba correspondiente
            </pre>
            <v-input type="textarea"  v-model="formData.alimentacion" ></v-input>
          </div>
          <div class="col-sm-4">
            <v-input type="textarea" label="Indicaciones especiales" v-model="formData.especiales"></v-input>
          </div>
          <div class="col-sm-4">
            <v-input type="text" label="Guia A" v-model="formData.guia_a"></v-input>
            <v-input type="text" label="Guia B" v-model="formData.guia_b"></v-input>
            <v-input type="text" label="Guia C" v-model="formData.guia_c"></v-input>
            <v-input type="text" label="Guia D" v-model="formData.guia_d"></v-input>
            <v-input type="text" label="Guia E" v-model="formData.guia_e"></v-input>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-4">
            <label>Higiene bucal</label>
            <checkbox v-model="formData.bucal_tm">TM</checkbox>
            <checkbox v-model="formData.bucal_tt">TT</checkbox>
            <checkbox v-model="formData.bucal_tn">TN</checkbox>
          </div>
          <div class="col-sm-4">
            <checkbox v-model="formData.arco">Arco Metalico</checkbox>
            <checkbox v-model="formData.antiequino">Cajón antiequino</checkbox>
          </div>
          <div class="col-sm-4">
            <v-input type="text" label="CSV" v-model="formData.csv"></v-input>
          </div>
        </div>
      </div>
      <div class="clearfix" v-if="formData">
        <button class="btn btn-primary pull-right" @click="guardar()"><i class="fa fa-save" ></i> Guardar</button>
      </div>
      <div v-if="!formData">
        <table class="table table-compact table-striped table-bordered ">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Via</th>
              <th>Dosis</th>
              <th>Frecuencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="indicacion in indicaciones">
              <td>{{indicacion.medicamento}}</td>
              <td>{{indicacion.via}}</td>
              <td>{{indicacion.dosis|comaDecimal }} {{indicacion.unidad}}</td>
              <td>{{indicacion.frecuencia}} hs</td>
            </tr>
          </tbody>
        </table>
        <div v-if="cabeceraActiva">
          <div class="row comentarios">
            <div class="col-sm-4">
              <label>Alimentacion</label>
              <pre v-if="tipoAlimentacion === 'sng'">
                SNG con guia y bomba correspondiente
              </pre>
              <pre v-if="tipoAlimentacion === 'gastro'">
                Gastroma con guía y bomba correspondiente
              </pre>
              <pre>{{cabeceraActiva.alimentacion| mostrarSaltos }}</pre>

            </div>
            <div class="col-sm-4">
              <label>Indicaciones especiales</label><pre>{{cabeceraActiva.especiales| mostrarSaltos }}</pre>
            </div>
            <div class="col-sm-4">
              <label>Guia A</label><pre>{{cabeceraActiva.guia_a}}</pre>
              <label>Guia B</label><pre>{{cabeceraActiva.guia_b}}</pre>
              <label>Guia C</label><pre>{{cabeceraActiva.guia_c}}</pre>
              <label>Guia D</label><pre>{{cabeceraActiva.guia_d}}</pre>
              <label>Guia E</label><pre>{{cabeceraActiva.guia_e}}</pre>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <label>Higiene bucal</label><br>
              <span><strong>TM</strong> {{ cabeceraActiva.bucal_tm?'Si': 'No' }}</span>
              <span><strong>TT:</strong> {{ cabeceraActiva.bucal_tt?'Si': 'No' }}</span>
              <span><strong>TN:</strong> {{ cabeceraActiva.bucal_tn?'Si': 'No' }}</span>
            </div>
            <div class="col-sm-4">
              <span><strong>Arco Metalico</strong> {{ cabeceraActiva.arco?'Si': 'No' }}</span><br>
              <span><strong>Cajón antiequino</strong> {{ cabeceraActiva.antiequino?'Si': 'No' }}</span>
            </div>
            <div class="col-sm-4">
              <label>CSV</label><pre>{{cabeceraActiva.csv}}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!pacienteId">
    Seleccione paciente
  </div>
  <div v-if="!fecha">
    Selecione fecha
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
import permisos from '../modules/permisos.js';
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
let horasDia = (function () {
  let salida = [];
  for (let i = 0; i < 24; i++) {
    salida.push({
      label: i,
      value: i,
    });
  }
  return salida;
}());

const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', 'lun'];
let diaAnterior = (i) => dias[dias.indexOf(i) - 1];
let diaSiguiente = (i) => dias[dias.indexOf(i) + 1];

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
    diaSiguiente() {
      return diaSiguiente(this.dia);
    },
    fechaActual() {
      return fechaToIso(this.fecha);
    },
    formDesde() {
      if (!this.formData) {
        return null;
      }
      return this.formData.fecha;
    },
    dia() {
      if (!this.formData) {
        return 'lun';
      }
      let day = (new Date(this.formData.fecha + ' 12:00:00')).getDay();
      return dias[day ? day - 1 : 6];
    },
    pacienteId() {
      if (this.paciente) {
        return this.paciente.id;
      }
      return null;
    },
    tipo() {

      return this.paciente.tipo_habitacion;
    },
    tipoAlimentacion(){
      if (!this.formData){
        if (this.indicaciones.some(i => i.via && i.via.toLowerCase() === 'gastro')) {
          return 'gastro';
        }
        if (this.indicaciones.some(i => i.via && i.via.toLowerCase() === 's.n.g')) {
          return 'sng';
        }
        return 'normal';
      }
      if (!this.formData.items || !this.formData.items.length){
        return 'normal2';
      }
      if (this.formData.items.some(i => i.via && i.via.toLowerCase() === 'gastro')) {
        return 'gastro';
      }
      if (this.formData.items.some(i => i.via && i.via.toLowerCase() === 's.n.g')) {
        return 'sng';
      }
      return 'normal3';
    }
  },
  mounted() {
    permisos.getAllowed(baseURL + 'indicacion_cabecera')
      .then(allowed => this.allowed = allowed);
    this.requestCabeceras();
    this.$http.get(baseURL + 'indicacion/formOptions')
      .then(res => res.json())
      .then(json => {
        this.options = json
      });
    this.$http.get(baseURL + 'api/insumo_medico?limit=no')
      .then(res => res.json())
      .then(json => {
        this.insumos = json.map(i => {
          return {
            label: i.nombre,
            value: i.nombre,
            codigo: i.id,
          };
        });
      });
  },
  props: {
    fecha: String,
    paciente: Object,
    mostrarAnteriores: Boolean,
  },
  data() {
    return {
      allowed: {},
      field: [],
      cabeceras: [],
      cabeceraActiva: null,
      calculado: {},
      formData: null,
      horasDia: horasDia,
      indicaciones: [],
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      options: {
        vias: [],
      },
      wait: false,
    };
  },
  methods: {
    agregarInsumo() {
      this.formData.items.push({
        usarDia: {
          lun: true,
          mar: true,
          mie: true,
          jue: true,
          vie: true,
          sab: true,
          dom: true,
        },
        medicamento: '',
        codigo_insumo: 0,
        frecuencia: 12,
        hora_inicio: 8,
        nocturno: false,
        unidad: 'Unidad',
        lun: '',
        mar: '',
        mie: '',
        jue: '',
        vie: '',
        sab: '',
        dom: '',
      });
    },
    borrarCabecera(idCabecera) {
      if (!window.confirm('Seguro desea borrar?')) {
        return;
      }
      this.wait = true;
      this.$http.delete(baseURL + 'indicacion_cabecera/' + idCabecera)
        .then(() => {
          this.wait = false;
          this.msg.type = 'success';
          this.msg.text = 'Borrado exitosamente';
          this.msg.show = true;
          this.requestCabeceras();
        })
        .catch(res => {
          console.error(res);
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible borrar';
          this.msg.show = true;
        });
    },
    guardar() {
      let formData = this.formData;
      formData.paciente_id = this.paciente.id;
      this.wait = true;
      let faltanDatos = false;
      this.formData.items.forEach(i => {
        let insumo = this.insumos.find(f => f.lavel === i.medicamento)
        if (!i.via){
          this.msg.type = 'danger';
          this.msg.text = 'Falta via de ' + i.medicamento;
          this.msg.show = true;
          faltanDatos = true;
          return;
        }
        if (!i.dosis){
          this.msg.type = 'danger';
          this.msg.text = 'Falta dosis de ' + i.medicamento;
          this.msg.show = true;
          faltanDatos = true;
          return;
        }
        i.codigo_insumo = (insumo && insumo.cod) || 0;
      });
      if (faltanDatos) {
        return false;
      }
      this.$http.post(baseURL + 'indicacion', formData)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.formData = null;
          this.requestCabeceras()
            .then(() => {
              this.cabeceraActiva = this.cabeceras[0];
            });
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
        })
        .catch(res => {
          console.log(res);
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible guardar';
          this.msg.show = true;
        });
    },
    calcIndicacion(index, dia, desde, hasta) {
      let indicacion = this.formData.items[index];
      hasta = hasta || 24;
      desde = desde || 0;
      if (!indicacion.frecuencia) {
        this.formData.items[index][dia] = '';
        return this.formData.items[index][dia];
      }
      if (!indicacion.usarDia[dia]) {
        this.formData.items[index][dia] = '';
        return this.formData.items[index][dia];
      }
      if (indicacion.frecuencia === 48) {
        let si = ['lun', 'mie', 'vie', 'dom']
        if (si.indexOf(dia) !== -1) {
          this.formData.items[index][dia] = indicacion.hora_inicio;
          return this.formData.items[index][dia];
        }
        this.formData.items[index][dia] = '';
        return this.formData.items[index][dia];
      }
      if (indicacion.frecuencia === 72) {
        let si = ['lun', 'jue', 'dom']
        if (si.indexOf(dia) !== -1) {
          this.formData.items[index][dia] = indicacion.hora_inicio;
          return this.formData.items[index][dia];
        }
        this.formData.items[index][dia] = '';
        return this.formData.items[index][dia];
      }
      if (indicacion.frecuencia === 168) {
        let si = ['lun']
        if (si.indexOf(dia) !== -1) {
          this.formData.items[index][dia] = indicacion.hora_inicio;
          return this.formData.items[index][dia];
        }
        this.formData.items[index][dia] = '';
        return this.formData.items[index][dia];
      }
      let inicio = indicacion.hora_inicio;
      let salida = [];
      if (diaAnterior(dia) && indicacion.nocturno) {
        inicio = String(this.formData.items[index][diaAnterior(dia)]).trim().length ? String(this.formData.items[index][diaAnterior(dia)]).split(',').pop() - 24 : indicacion.hora_inicio;
      }

      for (let i = inicio; i <= hasta; i += indicacion.frecuencia) {
        if (i > 0) {
          salida.push(i);
        }
      }
      this.formData.items[index][dia] = salida.join(', ');
      return this.formData.items[index][dia];
    },
    calcIndicacionUceDesde(index) {
      let dia = this.dia;
      let nDia = dias.indexOf(dia);
      let desde = nDia === 6 ? 1 : 0;
      this.formData.items[index].nocturno = true;
      for (let i = desde; i < nDia; i++) {
        let noDia = dias[i];
        this.formData.items[index].usarDia[noDia] = false;
        this.calcIndicacion(index, noDia);
      }
      this.formData.items[index].usarDia[dia] = true;
      let horasS = this.calcIndicacion(index, dia, 12);
      return String(horasS).split(',').map(i => i.trim());
    },
    calcIndicacionUceHasta(index, dia) {
      dia = this.diaSiguiente;
      let nDia = dias.indexOf(dia);
      let hasta = nDia === 0 ? 6 : 7
      this.formData.items[index].usarDia[dia] = true;
      let salida = this.calcIndicacion(index, dia, 0, 12);
      for (let i = nDia + 1; i < hasta; i++) {
        let noDia = dias[i];
        this.formData.items[index].usarDia[noDia] = false;
        this.calcIndicacion(index, noDia);
      }
      return salida;
    },
    copiar() {
      let indicacion = Object.assign({}, this.cabeceraActiva);
      delete(indicacion.id);
      indicacion.fecha = this.fechaActual;
      indicacion.desde = this.tipo === 'uce' ? this.fechaActual : this.desde();
      indicacion.hasta = this.tipo === 'uce' ? this.mañana() : this.hasta();
      indicacion.items = this.indicaciones.map(i => {
        let ind = Object.assign({}, i);
        delete(ind.id);
        delete(ind.cabecera_id);
        delete(ind.desde);
        delete(ind.hasta);
        if (!this.options.unidades.some(j => j.value === i.unidad)){
          this.options.unidades.push({
            label: i.unidad, value: i.unidad,
          })
        }
        return ind;
      });
      this.formData = indicacion;
    },
    nuevo() {
      let indicacion = {
        alimentacion: '',
        antiequino: false,
        arco: false,
        bucal_tm: false,
        bucal_tn: false,
        bucal_tt: false,
        csv: '',
        fecha: this.fechaActual,
        desde: this.tipo === 'uce' ? this.fechaActual : this.desde(),
        desde: '',
        especiales: '',
        guia_a: '',
        guia_b: '',
        guia_c: '',
        guia_d: '',
        guia_e: '',
        hasta: this.tipo === 'uce' ? this.mañana() : this.hasta(),
        numero: '',
        obs_farma: '',
        obs_ind: '',
        paciente_id: this.paciente.id,
        receta: '',
        items: [],
      };
      this.formData = indicacion;
      this.agregarInsumo();
    },
    quitarInsumo(index) {
      this.formData.items.splice(index, 1);
    },
    requestCabeceras() {
      this.wait = true;
      this.formData = null;
      this.cabeceras = [];
      this.indicaciones = [];
      if (!this.paciente.id || !this.fechaActual) {
        return;
      }
      return this.$http.get(baseURL + 'api/indicacion_cabecera/?sort=-fecha,-id&paciente_id=' + this.paciente.id)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.cabeceras = json;
        });
    },
    requestIndicaciones() {
      this.wait = true;
      this.formData = null;
      if (!this.pacienteId || !this.fechaActual) {
        return;
      }
      this.$http.get(baseURL + 'indicacion/?sort=medicamento&cabecera_id=' + this.cabeceraActiva.id)
        .then(res => res.json())
        .then(json => {
          this.wait = false;
          this.indicaciones = json.map(i => {
            i.nocturno = false;
            i.usarDia = {};
            dias.forEach(d => {
              i.nocturno = i.nocturno || String(i[d]).split(',').shift() < 8;
              i.usarDia[d] = !!String(i[d]).trim().length;
            })
            return i;
          });
        });
    },
    getMonday(fecha) {
      let d = fecha ? fecha : new Date();
      let day = d.getDay();
      let dif = d.getDate() - day + (day === 0 ? -6 : 1);
      return dateToString(new Date(d.setDate(dif)));
    },
    getPdf(idCabecera) {
      window.open(baseURL + 'indicacion/pdf/' + idCabecera);
    },
    hasta(fecha) {
      let hasta = new Date(this.desde());
      hasta.setDate(hasta.getDate() + 8)
      return dateToString(hasta);
    },
    desde(fecha) {
      let desde = new Date(fecha);
      return this.getMonday(fecha);
    },
    existe(medicamento) {
      return this.insumos.some(i => i.value === medicamento);
    },
    mañana() {
      let date = new Date(this.fechaActual + ' 12:00:00')
      date.setDate(date.getDate() + 1)
      return dateToString(date);
    },
  },
  watch: {
    fechaActual() {
      this.formData.fecha = this.fechaActual;
    },
    pacienteId() {
      this.requestCabeceras();
    },
    cabeceraActiva() {
      this.requestIndicaciones();
    },
    formDesde() {
      if (this.formData) {
        this.formData.hasta = this.formData.tipo === 'uce' ? this.mañana() : this.hasta();
      }
    }
  }
}
</script>
