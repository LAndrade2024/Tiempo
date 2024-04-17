<style>
pre {
  white-space: pre-line;
}
</style>
<template>
<div :class="{wait: wait}" v-if="pacienteId">
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <button @click="guardar" class="btn btn-primary" :disabled="wait"><i class="fa fa-save"></i> Guardar</button>
  <h4>Medicamentos por suministrar</h4>
  <table class="table table-compact table-striped table-bordered">
    <thead>
      <tr>
        <th>Medicamento</th>
        <th>Via</th>
        <th>Dosis</th>
        <th>Indicación</th>
        <th>Horas</th>
        <th>Observacion</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="indicacion in indicaciones">
        <td>{{indicacion.medicamento}}</td>
        <td>{{indicacion.via}}</td>
        <td>{{indicacion.dosis + ' ' + indicacion.unidad}}</td>
        <td>{{indicacion.observaciones}}</td>
        <td>
          <div v-for="hora in indicacion.dia" v-if="!tomaData[indicacion.medicamento][hora]" style="min-height: 80px">
            <checkbox v-model="formData[indicacion.medicamento][hora]" :true-value="hora">{{hora}}Hs</checkbox>
          </div>
        </td>
        <td>
          <div v-for="hora in indicacion.dia" v-if="!tomaData[indicacion.medicamento][hora]">
            <v-input type="textarea" v-model="obsData[indicacion.medicamento][hora]"></v-input>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="cabecera.observaciones">
    <strong>Observaciones</strong>
    <pre>{{cabecera.observaciones}}</pre>
  </div>
  <div class="row comentarios" v-if="cabecera">
    <div class="col-sm-4">
      <label>Alimentacion</label><pre>{{cabecera.alimentacion| mostrarSaltos }}</pre>
    </div>
    <div class="col-sm-4">
      <label>Indicaciones especiales</label><pre>{{cabecera.especiales| mostrarSaltos }}</pre>
    </div>
    <div class="col-sm-4">
      <label>Guia A</label><pre>{{cabecera.guia_a}}</pre>
      <label>Guia B</label><pre>{{cabecera.guia_b}}</pre>
      <label>Guia C</label><pre>{{cabecera.guia_c}}</pre>
      <label>Guia D</label><pre>{{cabecera.guia_d}}</pre>
      <label>Guia E</label><pre>{{cabecera.guia_e}}</pre>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4">
      <label>Higiene bucal</label><br>
      <span><strong>TM</strong> {{ cabecera.bucal_tm?'Si': 'No' }}</span>
      <span><strong>TT:</strong> {{ cabecera.bucal_tt?'Si': 'No' }}</span>
      <span><strong>TN:</strong> {{ cabecera.bucal_tn?'Si': 'No' }}</span>
    </div>
    <div class="col-sm-4">
      <span><strong>Arco Metalico</strong> {{ cabecera.arco?'Si': 'No' }}</span><br>
      <span><strong>Cajón antiequino</strong> {{ cabecera.antiequino?'Si': 'No' }}</span>
    </div>
    <div class="col-sm-4">
      <label>CSV</label><pre>{{cabecera.csv}}</pre>
    </div>
  </div>
  <h4>Medicamentos ya suministrados</h4>
  <table class="table table-compact table-striped table-bordered">
    <thead>
      <tr>
        <th>Medicamento</th>
        <th>Via</th>
        <th>Hora</th>
        <th>Observacion</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in toma">
        <td>{{item.nombre}}</td>
        <td>{{item.via}}</td>
        <td>
          {{item.hora}}:00Hs
        </td>
        <td>
          {{item.observaciones}}
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>
<script>
const baseURL = SERVER.baseUrl;
let fechaToIso = (entrada) => String(entrada).split('/').reverse().join('-');
Vue.filter('mostrarSaltos', entrada => String(entrada).replace(/[\r\n]/gm, '\n\n'));
import {
  alert,
  checkbox,
  input
} from 'vue-strap';
export default {
  props: {
    pacienteId: Number,
    fecha: String,
    hora: undefined,
  },
  components: {
    alert,
    checkbox,
    vInput: input,
  },
  computed: {
    fechaIso() {
      return fechaToIso(this.fecha);
    },
    indicaciones() {
      let dia = this.getDia();
      let indicaciones = this.indicacionesRaw.map(i => {
        i.dia = String(i[dia]).split(',').map(i => i.trim());
        if (this.hora) {
          let hora = String(this.hora);
          i.dia = i.dia.indexOf(hora) !== -1 ? [hora] : [];
        }
        if (!this.tomaData[i.medicamento]) {
          this.tomaData[i.medicamento] = {};
        }
        if (!this.formData[i.medicamento]) {
          this.formData[i.medicamento] = {};
        }
        if (!this.obsData[i.medicamento]) {
          this.obsData[i.medicamento] = {};
        }
        return i;
      })
      this.toma.forEach(toma => {
        let indicacion = indicaciones.find(i => i['medicamento'] == toma['nombre']);
        if (!indicacion) {
          return;
        }
        let index = indicacion.dia.findIndex(i => i === String(toma.hora))
        if (index !== -1) {
          indicacion.dia.splice(index, 1);
        }
      });
      return indicaciones.filter(i => !i.dia.length || i.dia.length && i.dia[0] !== '');;
    }
  },
  data() {
    return {
      formData: {},
      cabecera: {},
      indicacionesRaw: [],
      general: {
        observaciones: ''
      },
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      obsData: {},
      toma: [],
      tomaData: {},
      wait: false,
    }
  },
  methods: {
    formToData() {
      return Object.entries(this.formData)
        .map(i => {
          return {
            m: i[0],
            d: Object.entries(i[1]).filter(i => i[1]).map(i => i[0]),

          }
        })
        .filter(i => i.d.length)
        .reduce((s, i) => {
          let indicacion = this.indicaciones.find(ind => ind.medicamento === i.m) || {};
          i.d.forEach(hora => s.push({
            fecha: this.fechaIso,
            hora: hora,
            nombre: i.m,
            paciente_id: this.pacienteId,
            tomado: true,
            indicacion_id: indicacion.id,
            via: indicacion.via,
            idcab: indicacion.cabecera_id,
            conc: indicacion.unidad,
            dosis: indicacion.dosis,
            observaciones: (this.obsData[i.m] && this.obsData[i.m][hora]) || '',
          }));
          return s;
        }, []);
    },
    guardar() {
      this.wait = true;
      let data = this.formToData();
      this.$http.post(baseURL + 'toma_medicamento/grouped', data)
        .then(() => {
          this.requestIndicaciones();
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
        })
        .catch(res => {
          this.msg.text = 'No fue posible guardar';
          if (res.body.error === 'Nueva version') {
            this.msg.text = 'Hay una nueva indicación médica, por favor vuelva a ingesar la toma';
          }
          if (res.body.error === 'carga futura') {
            this.msg.text = 'No se permiten fechas futuras, revise la fecha ingresada';
          }
          this.requestIndicaciones();
          this.msg.type = 'danger';
          this.msg.show = true;
        });
    },
    requestIndicaciones() {
      this.wait = true;
      this.$http.get(baseURL + 'api/indicacion?sort=medicamento&paciente_id=' + this.pacienteId + '&dia=' + this.fechaIso)
        .then(res => res.json())
        .then(json => {
          this.requestToma();
          let cabaceraId = json.length ? json[0].cabecera_id : false;
          if (!cabaceraId) {
            return;
          }
          this.$http.get(baseURL + 'api/indicacion_cabecera?id=' + cabaceraId)
            .then(res => res.json())
            .then(json => {
              this.cabecera = json[0];
            });
          this.indicacionesRaw = json;
        });

    },
    requestToma() {
      this.$http.get(baseURL + 'toma_medicamento?tomado=true&paciente_id=' + this.pacienteId + '&fecha=' + this.fechaIso)
        .then(res => res.json())
        .then(json => {
          this.formData = {};
          this.obsData = {};
          this.tomaData = [];
          json.forEach(i => {
            if (!this.formData[i.nombre]) {
              this.formData[i.nombre] = {};
            }
            if (!this.obsData[i.nombre]) {
              this.obsData[i.nombre] = {};
            }
            if (!this.tomaData[i.nombre]) {
              this.tomaData[i.nombre] = {};
            }
            this.tomaData[i.nombre][i.hora] = String(i.hora);
          })
          this.wait = false;
          this.toma = json;
          this.$forceUpdate();
        });
    },
    getDia() {
      let dia = new Date(fechaToIso(this.fecha));
      let week = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', ];
      return week[dia.getDay()];
    }
  },
  watch: {
    pacienteId() {
      this.requestIndicaciones();
    },
    fecha() {
      this.requestIndicaciones();

    }
  }
}
</script>
