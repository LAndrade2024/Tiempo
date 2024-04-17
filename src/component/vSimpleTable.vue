<style>
tr.active {
  border-left: solid blue 3px;
}
</style>
<template>
<table class="v-table table table-compact table-striped table-bordered">
  <tfoot v-if="sumColumns && sumColumns.length">
    <tr>
      <th v-for="column in columns" style="cursor:pointer" @click="sortBy(column.key)" :class="column.sClass">
        {{sumatoria[column.key]}}
      </th>
    </tr>
  </tfoot>
  <thead>
    <tr>
      <th v-for="column in columns" style="cursor:pointer" @click="sortBy(column.key)" :class="column.sClass">
        <span v-html="column.label"></span>
        <i class="fa" :class="{'fa-arrow-up' : sortKey == column.key && sortOrders > 0,  'fa-arrow-down' : sortKey == column.key && sortOrders < 0}"></i>
      </th>
      <th v-if="actions && actions.length"></th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in filteredData" @dblclick="selectRow(entry)" :class="{active: active.item === entry}">
      <td v-for="column in columns" :class="column.sClass">
        {{entry[column.key]}}
      </td>
      <td v-if="actions && actions.length" class="table-actions">
        <i v-for="action in actions" :class="action.icon" @click="trigger(action.event, entry)" v-if="!action.fieldCondition || entry[action.fieldCondition]"></i>
      </td>
    </tr>
  </tbody>
</table>
</template>
<script>
import {
  tooltip,
} from 'vue-strap';
export default {
  props: {
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
    filterKey: '',
    hearKeys: null,
    sumColumns: Array,
  },
  data() {
    return {
      sortKey: '',
      sortOrders: 1,
      active: {
        item: null,
        index: null,
      },
    }
  },
  components: {
    tooltip
  },
  created() {
    let nv = this;

    //let head = this.$el.querySelector('thead');
    var keysController = function (e) {
      if (e.key === 'ArrowDown') {

        if (nv.filteredData.length <= nv.active.index + 1) {
          return;
        }
        nv.active.index += 1;
        nv.active.item = nv.filteredData[nv.active.index];
      }
      if (e.key === 'ArrowUp') {
        if (nv.active.index === 0) {
          return;
        }
        nv.active.index -= 1;
        nv.active.item = nv.filteredData[nv.active.index];
      }
      if (e.key === 'Home') {
        nv.active.index = 0;
        nv.active.item = nv.filteredData[0];
      }
      if (e.key === 'End') {
        let end = nv.filteredData.length - 1
        nv.active.index = end;
        nv.active.item = nv.filteredData[end];
      }
      //let headRect= head.getBoundingClientRect();
      //let trRect = nv.$el.querySelector('tr.active').getBoundingClientRect()
      //setTimeout(()=>{window.scrollTo(0,  trRect.top + document.body.scrollTop - headRect.bottom)},0);
    };
    if (this.hearKeys) {
      window.onkeyup = keysController;
    }
  },
  computed: {
    filteredData: function () {
      let sortKey = this.sortKey;
      let order = this.sortOrders || 1;
      let data = this.filtrar();
      if (sortKey) {
        data = data.slice().sort(function (rowA, rowB) {
          let a = rowA[sortKey];
          let b = rowB[sortKey];
          return (a === b ? 0 : (a > b ? 1 : -1)) * order;
        });
      }
      if (!data.some((item) => item === this.active.item)) {
        this.active.item = data[0];
        this.active.index = 0;
      }
      this.trigger('filtrado', {
        total: data.length
      })
      return data;
    },
    sumable() {
      if (!this.sumColumns) {
        return {};
      }
      return this.sumColumns.reduce((s, i) => {
        s[i] = true;
        return s;
      }, {});
    },
    sumatoria() {
      return this.columns.reduce((sofar, column) => {
        if (!this.sumable[column.key]) {
          sofar[column.key] = '';
          return sofar;
        }
        let suma = this.filteredData.reduce((s, row) => s += (row[column.key] || 0), 0);
        sofar[column.key] = parseFloat(Math.round(suma * 100) / 100).toFixed(2);
        return sofar;
      }, {});
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortOrders = this.sortKey === key ? this.sortOrders * -1 : 1;
      this.sortKey = key;
    },
    filtrar() {
      if (!this.filterKey) {
        return this.data;
      }
      if (typeof this.filterKey !== 'object') {
        let filterKey = this.filterKey.toLowerCase();
        return this.data.filter(row => Object.keys(row).some(key => String(row[key]).toLowerCase().indexOf(filterKey) > -1))
      }
      let filterKey = this.filterKey;
      if (!Object.keys(filterKey).some(key => filterKey[key])) {
        return this.data;
      }
      let keys = Object.keys(filterKey).filter((key) => filterKey[key]);
      return this.data.filter(row => keys.some(key => String(row[key]).toLowerCase().indexOf(String(filterKey[key]).toLowerCase()) > -1))
    },
    selectRow(row) {
      this.trigger('doubleclick', row);
      this.active.item = row;
      this.filteredData.some((item, index) => {
        if (item === this.active.item) {
          this.active.index = index;
          return true;
        }
        return false;
      });
    },
    trigger(event, row) {
      let trigger = {
        trigger: event,
        data: row
      }
      this.$emit('trigger', trigger);
      this.$emit(event, row);
    }
  },

}
</script>
