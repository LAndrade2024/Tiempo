<template>
  <div :class="{wait: wait}">
    <button v-if="allowed.post" class="btn btn-primary" @click.stop="nuevo()"><i class="fa fa-file"></i> Nuevo</button>
    <br>
    <v-paginated-table v-if="ctotal > limit"
      :actions="actionsR"
      :columns="columns"
      :data="cdata"
      :limit="limit"
      :offset="offset"
      :sum-columns="sumColumns"
      :total="ctotal"
      @sort="doSort($event)"
      @changeoffset="changeOffset($event)"
      @trigger="trigger($event)"
      ></v-paginated-table>
  <v-simple-table  v-if="ctotal <= limit"
    :actions="actionsR"
    :sum-columns="sumColumns"
    :data="cdata"
    :columns="columns"
    @trigger="trigger($event)"
    ></v-simple-table>
    <modal v-if="modal.show">
      <div slot="modal-footer" class="modal-footer">
        <button v-if="formData.id" type="button" class="btn btn-primary" @click="doPut()">Modificar</button>
        <button v-if="!formData.id" type="button" class="btn btn-primary" @click="doPost()">Guardar</button>
        <button type="button" class="btn btn-default" @click="modal.show = false">Cancelar</button>
      </div>
    </modal>
  </div>
</template>
<script>
import vSimpleTable from './vSimpleTable.vue';
import vPaginatedTable from './vPaginatedTable.vue';
import options from '../modules/options.js';
export default {
  props: {
    actions: null,
    afterResponse: Function,
    filterKey: '',
    filter: {
      type: Object,
      default () {
        return {};
      },
    },
    formData:{

    },
    limit: {
      type: Number,
      default() {return 50;},
    },

    requestNow: {
      type: Boolean,
      default() {return false;},
    },
    showControlls: true,
    showForm: true,
    sumColumns: Array,
    url: {
      type: String,
      default () {
        return '';
      },
    },
    waitTime: 200,
  },
  data() {
    return {
      actionsO: [],
      allowed: {},
      columns: [],
      data: [],
      modal:{
        show: false,
      },
      offset: 0,
      pdata: [],
      ptotal: 10,
      requestTimeout: 0,
      sortKey: '',
      sortOrders: 1,
      wait: false,
    }
  },
  components: {
    vSimpleTable,
    vPaginatedTable,
  },
  created(){
    options.getOptions(this.url)
      .then(options => {
        this.allowed = options.allowed;
        if (this.allowed.put) {
          this.actionsO.push({title: 'Editar', event: 'put', icon: 'fa fa-edit'});
        }
        if (this.allowed.delete) {
            this.actionsO.push({title: 'Borrar', event: 'delete', icon: 'fa fa-remove'});
        }
        this.columns = Object.entries(options.fields).map(i => {
            let j = i[1];
            j.key = i[0];
            return j;
          }).filter(i => i.listable);
      });
      if (this.requestNow) {
        this.request();
      }

  },
  computed: {
    cdata(){
      return this.url ? this.pdata : this.data;
    },
    ctotal(){
      return this.url ? this.ptotal : this.total;
    },
    actionsR() {
      return this.actions ? this.actions : this.actionsO;
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    doSort(key) {
      this.sort = key;
      this.request();
    },
    changeOffset(offset) {
      this.offset = offset;
      this.request();
    },
    nuevo(){
      this.$emit('new');
    },
    request() {
      let t = this;
      clearTimeout(t.requestTimeout);
      this.requestTimeout = setTimeout(() => {
        let timeout = t.requestTimeout;
        t.wait = true;
        t.$http.get(t.url + '?' + t.uri())
          .then(r => {
            if (t.requestTimeout !== timeout) {
              return;
            }
            t.ptotal = parseInt(r.headers.get('X-Total-Count'), 10);
            t.wait = false;
            return r.json();
          })
          .then(json => {
            if (t.requestTimeout !== timeout) {
              return;
            }
            if (isNaN(t.ptotal)) {
              t.ptotal = json.length;
            }
            this.$emit('requested');
            if (this.afterResponse) {
              this.afterResponse(json);
            }
            t.pdata = json;
            this.$emit('response', json);
          })
          .catch(res => {
            console.error(res);
            this.wait = false;
          });
      }, t.waitTime);
    },
    trigger(event) {
      this.$emit(event.trigger, event.data);
    },
    uri() {
      let t = this;
      let parts = Object.assign({}, t.filter);
      parts.sort = t.sort || '';
      parts.offset = t.offset || 0;
      parts.limit = t.limit;
      return Object.keys(parts)
        .filter(i => parts[i] || parts[i] === 0)
        .map(i => i + '=' + parts[i])
        .join('&');
    },
  },
  watch: {
    requestNow() {
      if (this.requestNow) {
        this.request();
      }
    },
    filterKey: {
      handler(){
        this.request();
      },
      deep: true,
    },
    url(){
      this.request();
    },
    filter: {
      handler() {
        this.offset = 0;
        this.request();
      },
      deep: true,
    },
  }
}
</script>
