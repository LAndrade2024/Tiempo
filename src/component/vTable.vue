<template>
<div :class="{wait: wait}">
  <v-paginated-table v-if="ctotal > limit" :actions="actions" :columns="columns" :data="cdata" :limit="limit" :offset="offset" :total="ctotal" @sort="doSort($event)" @changeoffset="changeOffset($event)" @trigger="trigger($event)"></v-paginated-table>
  <v-simple-table v-if="ctotal <= limit" :actions="actions" :filter-key="filterKey" :data="cdata" :columns="columns" @trigger="trigger($event)"></v-simple-table>
</div>
</template>
<script>
import vSimpleTable from './vSimpleTable.vue';
import vPaginatedTable from './vPaginatedTable.vue';
export default {
  props: {
    afterResponse: Function,
    actions: {
      type: Array,
      default () {
        return [];
      },
    },
    columns: Array,
    data: {
      type: Array,
      default () {
        return [];
      },
    },
    defaultSort: {
      type: String,
      default () {
        return '';
      },
    },
    filterKey: '',
    filter: {
      type: Object,
      default () {
        return {};
      },
    },
    hearKeys: null,
    limit: {
      type: Number,
      default() {
        return 50;
      },
    },
    requestNow: {
      type: Boolean,
      default () {
        return false;
      },
    },
    total: {
      type: Number,
      default () {
        return 10;
      },
    },
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
      active: {
        item: null,
        index: null,
      },
      offset: 0,
      pdata: [],
      ptotal: 10,
      requestTimeout: 50,
      sort: '',
      sortOrders: 1,
      wait: false,
    }
  },
  components: {
    vSimpleTable,
    vPaginatedTable,
  },
  created() {
    if (this.url) {
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
      parts.sort = t.sort || this.defaultSort;
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
