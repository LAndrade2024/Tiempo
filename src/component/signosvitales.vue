<style>
.input {
  padding: 0 !important;
}

.input .form-group {
  margin: 0 !important;
}

.input .form-group input {
  padding: 6px !important;
}

.nombre-vitales {
  white-space: nowrap;
  overflow: hidden;
}

.table-vitales button.btn-xs {
  width: 21px;
}
</style>
<template>
<div class="row" :class="{wait: wait}">
  <alert :type="msg.type" v-model="msg.show" placement="top-right" duration="10000" dismissable v-cloak>
    {{msg.text}}
  </alert>
  <table class="table table-compact table-striped table-bordered table-vitales" style="table-layout: fixed;" v-if="fecha && pacienteId">
    <thead>
      <tr>
        <td colspan="2"></td>
        <th :colspan="noche.length + 1" class="turnos">Noche</th>
        <th :colspan="mañana.length + 1" class="turnos">Mañana</th>
        <th :colspan="tarde.length + 1" class="turnos">Tarde</th>
        <th v-if="pacienteId"></th>
      </tr>
      <tr>
        <td colspan="2"></td>
        <th v-for="lectura in noche">
          <div style="display: inline-block; vertical-align: middle">{{lectura.tiempo|hora}}hs <br> {{lectura.usunom}}</div>
          <div style="display: inline-block; vertical-align: middle; float:right;text-align: right;">
            <button v-if="permisoEditar(lectura)" @click.prevent="editar(lectura)" class="btn btn-xs btn-primary"><i class="fa fa-edit" ></i></button><br>
            <button v-if="permisoBorrar(lectura)" @click.prevent="borrar(lectura.id)" class="btn btn-xs btn-danger"><i class="fa fa-remove" ></i></button>
          </div>
        </th>
        <th>
          <div><span>Total</span></div>
        </th>
        <th v-for="lectura in mañana">
          <div style="display: inline-block; vertical-align: middle">{{lectura.tiempo|hora}}hs <br> {{lectura.usunom}}</div>
          <div style="display: inline-block; vertical-align: middle; float:right;text-align: right;">
            <button v-if="permisoEditar(lectura)" @click.prevent="editar(lectura)" class="btn btn-xs btn-primary"><i class="fa fa-edit" ></i></button><br>
            <button v-if="permisoBorrar(lectura)" @click.prevent="borrar(lectura.id)" class="btn btn-xs btn-danger"><i class="fa fa-remove" ></i></button>
          </div>
        </th>
        <th>
          <div><span>Total</span></div>
        </th>
        <th v-for="lectura in tarde">
          <div style="display: inline-block; vertical-align: middle">{{lectura.tiempo|hora}}hs <br> {{lectura.usunom}}</div>
          <div style="display: inline-block; vertical-align: middle; float:right;text-align: right;">
            <button v-if="permisoEditar(lectura)" @click.prevent="editar(lectura)" class="btn btn-xs btn-primary"><i class="fa fa-edit" ></i></button><br>
            <button v-if="permisoBorrar(lectura)" @click.prevent="borrar(lectura.id)" class="btn btn-xs btn-danger"><i class="fa fa-remove" ></i></button>
          </div>
        </th>
        <th>
          <div><span>Total</span></div>
        </th>
        <th>
          <v-select :options="horas" v-model="formData.hora" placeholder="Hora"></v-select>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr is="row" :headerspan="7" header="Signos" label="Temperatura" placeholder="T" :items="items" :value.sync="formData" clave="temperatura"></tr>
      <tr is="row" label="Frecuenia Cardiaca" type="number" placeholder="FC" :items="items" :value.sync="formData" clave="pulso">
      </tr>
      <tr is="row" label="Tension Arterial" placeholder="TA" :items="items" :value.sync="formData" clave="presion_arterial">
      </tr>
      <tr is="row" label="Frecuenia respiratoria" type="number" placeholder="FR" :items="items" :value.sync="formData" clave="frecuencia_respiratoria">
      </tr>
      <tr is="row" label="Saturación parcial de Oxígeno" type="number" placeholder="SPO2" :items="items" :value.sync="formData" clave="saturacion_parcial_oxigeno">
      </tr>
      <tr is="row" label="Presión venosa central" type="number" placeholder="PVC" :items="items" :value.sync="formData" clave="presion_venosa_central">
      </tr>
      <tr is="row" label="Glucenmia" type="number" placeholder="HGT" :items="items" :value.sync="formData" clave="glucemia">
      </tr>
      <tr is="row" :headerspan="7" header="Egresos" :total="true" label="Diuresis" placeholder="DIU" :items="items" :value.sync="formData" clave="diuresis">
      </tr>
      <tr is="row" :total="true" label="Sonda nasogastrica" placeholder="SNG" :items="items" :value.sync="formData" clave="sonda_nasogastrica">
      </tr>
      <tr is="row" :total="true" label="Vomitos" placeholder="VOM" :items="items" :value.sync="formData" clave="vomitos">
      </tr>
      <tr is="row" :total="true" label="Deposición" placeholder="DEP" :items="items" :value.sync="formData" clave="deposicion">
      </tr>
      <tr is="row" :total="true" label="Drenajes" placeholder="DREN" :items="items" :value.sync="formData" clave="drenajes">
      </tr>
      <tr is="row" :total="true" label="Hemorragias" placeholder="HEM" :items="items" :value.sync="formData" clave="hemorragia">
      </tr>
      <tr is="row" :total="true" label="Perdidas insensibles" placeholder="PINS" :items="items" :value.sync="formData" clave="perdidas_insensibles">
      </tr>
      <tr is="row" :headerspan="9" header="Ingresos" :total="true" label="Solucion A" placeholder="A" :items="items" :value.sync="formData" clave="solucion_a">
      </tr>
      <tr is="row" :total="true" label="Solucion B" placeholder="B" :items="items" :value.sync="formData" clave="solucion_b">
      </tr>
      <tr is="row" :total="true" label="Solucion C" placeholder="C" :items="items" :value.sync="formData" clave="solucion_c">
      </tr>
      <tr is="row" :total="true" label="Solucion D" placeholder="D" :items="items" :value.sync="formData" clave="solucion_d">
      </tr>
      <tr is="row" :total="true" label="Alimentacion enteral" placeholder="A/E" :items="items" :value.sync="formData" clave="alimentacion_enteral">
      </tr>
      <tr is="row" :total="true" label="Dieta" placeholder="DIET" :items="items" :value.sync="formData" clave="dieta">
      </tr>
      <tr is="row" :total="true" label="Liquidos" placeholder="LIQ" :items="items" :value.sync="formData" clave="liquidos">
      </tr>
      <tr is="row" :total="true" label="Colación" placeholder="COL" :items="items" :value.sync="formData" clave="colacion">
      </tr>
      <tr is="row" :total="true" label="Agua Metabolica" placeholder="AM" :items="items" :value.sync="formData" clave="agua_metabolica">
      </tr>
      <tr>
        <th colspan="2">Balance Total</th>
        <td v-for="item in items.noche">{{ balance(item) }}</td>
        <td><strong></strong></td>
        <td v-for="item in items.mañana">{{ balance(item) }}</td>
        <td><strong></strong></td>
        <td v-for="item in items.tarde">{{ balance(item) }}</td>
        <td><strong>0</strong></td>
        <td v-if="pacienteId">
          <button v-if="!formData.id" class="btn btn-primary" @click="guardar"><i class="fa fa-save"></i> Guardar</button>
          <button v-if="formData.id" class="btn btn-primary" @click="modificar"><i class="fa fa-save"></i> Modificar</button>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="!pacienteId">
    Seleccione paciente
  </div>
  <div v-if="!fecha">
    Selecione fecha
  </div>
</div>
</template>
<script>
import row from './vitalesRow';
import permisos from '../modules/permisos.js';
import {
  alert,
  select
} from 'vue-strap';
Vue.filter('hora', value => String(value).substr(11, 2));
const baseURL = SERVER.baseUrl;
const fechaAIso = (entrada) => String(entrada).split('/').reverse().join('-');
const horas = (() => {
  let salida = [],
    h = '',
    hh = '';
  for (let i = 0; i <= 24; i++) {
    h = String(i);
    hh = h.length > 1 ? h : '0' + h;
    salida.push({
      label: hh + ':00',
      value: i
    });
  }
  return salida;
})();
let blankForm = {};
let fecha = SERVER.date.split('-').reverse().join('/');
export default {
  components: {
    alert,
    row,
    vSelect: select,
  },
  computed: {
    balanceForm() {
      return this.balance(this.formData);
    },
    noche() {
      return this.signosVitales.filter(i => {
        let h = (new Date(i.tiempo)).getHours();
        return h < 7 || h >= 23;
      });
    },
    mañana() {
      return this.signosVitales.filter(i => {
        let h = (new Date(i.tiempo)).getHours();
        return h >= 7 && h < 15;
      });
    },
    tarde() {
      return this.signosVitales.filter(i => {
        let h = (new Date(i.tiempo)).getHours();
        return h >= 15 && h < 23;
      });
    },
    items() {
      return {
        noche: this.noche,
        mañana: this.mañana,
        tarde: this.tarde,
      };
    },
    listaPaciente() {
      return this.pacientes.map(i => {
        return {
          label: i.paciente,
          value: i.id
        };
      });
    },
    fechaActual() {
      return fechaAIso(this.fecha);
    }
  },
  mounted() {
    blankForm = Object.assign({}, this.formData);
    permisos.setTime(SERVER.date);
    permisos.getAllowed(baseURL + 'evolucion')
      .then(allowed => this.allowed = allowed);
    this.requestVitales(this.pacienteId);
  },
  props: {
    fecha: String,
    pacienteId: Number,
    user: {},
  },
  data() {
    return {
      allowed: {},
      horas: horas,
      formData: {
        'hora': '',
        'temperatura': '',
        'pulso': '',
        'tension_arterial': '',
        'tension_arteriald': '',
        'presion_arterial': '',
        'tad': '',
        'frecuencia_respiratoria': '',
        'saturacion_parcial_oxigeno': '',
        'presion_venosa_central': '',
        'glucemia': '',
        'diuresis': '',
        'sonda_nasogastrica': '',
        'vomitos': '',
        'deposicion': '',
        'drenajes': '',
        'hemorragia': '',
        'perdidas_insensibles': '',
        'solucion_a': '',
        'solucion_b': '',
        'solucion_c': '',
        'solucion_d': '',
        's': '',
        'p': '',
        'alimentacion_enteral': '',
        'dieta': '',
        'liquidos': '',
        'colacion': '',
        'agua_metabolica': '',
        'balant': '',
      },
      msg: {
        type: 'danger', //success info warning danger
        text: 'test',
        show: false,
      },
      signosVitales: [],
      vitales: [],
      wait: false,

    };
  },
  methods: {
    requestVitales() {
      this.wait = true;
      this.signosVitales = [];
      if (this.pacienteId) {
        this.$http.get(baseURL + 'signos_vitales/?sort=tiempo&tiempo>=' + this.fechaActual + ' 00:00:00&tiempo<=' + this.fechaActual + ' 23:59:59&paciente_id=' + this.pacienteId)
          .then(res => res.json())
          .then(json => {
            this.signosVitales = json.map(i => {
              i.presion_arterial = (i.tension_arterial || '') + '/' + (i.tension_arteriald || '')
              return i;
            });
            this.wait = false;
          });
      }
    },
    balance(item) {
      return this.ingresos(item) - this.egresos(item);
    },
    borrar(id) {
      if (!window.confirm('Seguro de borrar la entrada')) {
        return;
      }
      this.$http.delete(baseURL + 'signos_vitales/' + id)
        .then(json => {
          this.msg.type = 'success';
          this.msg.text = 'Borrado exitosamente';
          this.msg.show = true;
          this.requestVitales();
        })
        .catch(res => {
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible borrar. ' + (res.body.error || '');
          this.msg.show = true;
        });
    },
    ingresos(item) {
      return (parseFloat(item.solucion_a) || 0) +
        (parseFloat(item.solucion_b) || 0) +
        (parseFloat(item.solucion_c) || 0) +
        (parseFloat(item.solucion_d) || 0) +
        (parseFloat(item.alimentacion_enteral) || 0) +
        (parseFloat(item.dieta) || 0) +
        (parseFloat(item.liquidos) || 0) +
        (parseFloat(item.colacion) || 0) +
        (parseFloat(item.agua_metabolica) || 0);
    },
    editar(vitales) {
      let data = Object.assign({}, vitales);
      Object.keys(data).forEach(i => data[i] = String(data[i]).trim());
      this.formData = data;
      this.formData.presion_arterial = this.formData.tension_arterial + '/' + this.formData.tension_arteriald;
      this.formData.hora = parseFloat(String(this.formData.tiempo).substr(11, 2));
    },
    egresos(item) {
      return (parseFloat(item.diuresis) || 0) +
        (parseFloat(item.sonda_nasogastrica) || 0) +
        (parseFloat(item.vomitos) || 0) +
        (parseFloat(item.deposicion) || 0) +
        (parseFloat(item.drenajes) || 0) +
        (parseFloat(item.hemorragia) || 0) +
        (parseFloat(item.perdidas_insensibles) || 0);
    },
    guardar() {
      this.formData.paciente_id = this.pacienteId;
      if (this.formData.presion_arterial) {
        let tension = this.formData.presion_arterial.split('/');
        this.formData.tension_arterial = tension[0];
        this.formData.tension_arteriald = tension[1];
      }
      if (this.formData.hora) {
        let h = String(this.formData.hora);
        let hh = h.length === 1 ? '0' + h : h;
        this.formData.tiempo = this.fechaActual + 'T' + hh + ':00:00'
      }
      this.wait = true
      this.$http.post(baseURL + 'signos_vitales', this.formData)
        .then(res => res.json())
        .then(json => {
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
          this.formData = Object.assign({}, blankForm);
          json.presion_arterial = (json.tension_arterial || '') + '/' + (json.tension_arteriald || '')
          this.signosVitales.push(json);
          this.requestVitales();
        })
        .catch(res => {
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible guardar. ' + (res.body.error || '');
          if (res.body.error === 'carga futura') {
            this.msg.text = 'No se permiten fechas futuras, revise la fecha ingresada';
          }
          this.msg.show = true;
        });
    },
    modificar() {
      if (this.formData.presion_arterial) {
        let tension = this.formData.presion_arterial.split('/');
        this.formData.tension_arterial = tension[0];
        this.formData.tension_arteriald = tension[1];
      }
      if (this.formData.hora) {
        let h = String(this.formData.hora);
        let hh = h.length === 1 ? '0' + h : h;
        this.formData.tiempo = this.fechaActual + 'T' + hh + ':00:00'
      }
      this.wait = true
      this.$http.put(baseURL + 'signos_vitales/' + this.formData.id, this.formData)
        .then(res => res.json())
        .then(json => {
          this.msg.type = 'success';
          this.msg.text = 'Guardado exitosamente';
          this.msg.show = true;
          this.formData = Object.assign({}, blankForm);
          json.presion_arterial = (json.tension_arterial || '') + '/' + (json.tension_arteriald || '')
          this.requestVitales();
        })
        .catch(res => {
          this.wait = false;
          this.msg.type = 'danger';
          this.msg.text = 'No fue posible guardar. ' + (res.body.error || '');
          if (res.body.error === 'carga futura') {
            this.msg.text = 'No se permiten fechas futuras, revise la fecha ingresada';
          }
          this.msg.show = true;
        });
    },
    permisoBorrar(vital) {
      if (!vital) {
        return false;
      }
      if (!this.allowed.delete) {
        return false;
      }
      if (!this.user) {
        return false;
      }
      if (this.user.role === 'admin') {
        return true;
      }

      if (!permisos.isDateAllowed(vital.tiempo)) {
        return false;
      }
      if (this.user.user.trim() === vital.usunom.trim()) {
        return true;
      }
      return false;
    },
    permisoEditar(vital) {
      if (!this.allowed.put) {
        return false;
      }
      if (!this.user) {
        return false;
      }
      if (this.user.role === 'admin') {
        return true;
      }

      if (!permisos.isDateAllowed(vital.tiempo)) {
        return false;
      }
      if (this.user.user.trim() === vital.usunom.trim()) {
        return true;
      }
      return false; //this.allowed.put;
    },
    permisoNuevo() {
      return this.allowed.post;
    },
    suma(items, key) {
      return items.reduce((sofar, i) => {
        return sofar + parseFloat(i[key]);
      }, 0);
    },
  },
  watch: {
    fechaActual() {
      if (this.pacienteId) {
        this.requestVitales(this.pacienteId);
      }
    },
    pacienteId() {
      if (this.pacienteId) {
        this.requestVitales(this.pacienteId);
      }
    },
  }
}
</script>
