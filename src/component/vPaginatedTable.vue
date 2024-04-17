<style>
tr.active {
  border-left: solid blue 3px;
}
</style>
<template>
<div >
  <pagination :limit="limit" :offset="offset" :total="total" @changepage="changeOffset($event)"></pagination>
  <table class="v-table table table-compact table-striped table-bordered">
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
      <tr v-for="entry in data" @click="selectRow(entry)" :class="{active: active.item === entry}">
        <td v-for="column in columns" :class="column.sClass">
          {{entry[column.key]}}
        </td>
        <td v-if="actions && actions.length" class="table-actions">
          <i v-for="action in actions" :class="action.icon" @click="trigger(action.event, entry)" v-if="!action.fieldCondition || entry[action.fieldCondition]"></i>
        </td>
      </tr>
    </tbody>
  </table>
  <pagination :limit="limit" :offset="offset" :total="total" @changepage="changeOffset($event)"></pagination>
</div>
</template>
<script>
import pagination from './vPagination.vue';
export default {
  props: {
    actions: {
      type: Array,
      default () {
        return [];
      },
    },
    columns: Array,
    data: Array,
    hearKeys: null,
    filterKey: '',
    limit: {
      type: Number,
      default () {
        return 20;
      },
    },
    offset: {
      type: Number,
      default () {
        return 0;
      },
    },
    total: {
      type: Number,
      default () {
        return 10;
      },
    },
    url: String,
  },
  data() {
    return {
      active: {
        item: null,
        index: null,
      },
      sortKey: '',
      sortOrders: 1,
    }
  },
  created() {

  },
  computed: {},
  components: {
    pagination
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortOrders = this.sortKey === key ? (this.sortOrders * -1) : 1;
      this.sortKey = key;
      this.$emit('sort', (this.sortOrders > 0 ? '' : '-') + key);
    },
    selectRow(row) {
      this.trigger('rowclick', row);
    },
    trigger(event, row) {
      let trigger = {
        trigger: event,
        data: row
      }
      this.$emit('trigger', trigger);
      this.$emit(event, row);
    },
    changeOffset(page) {
      let offset = (page - 1) * this.limit;
      this.$emit('changeoffset', offset);
    }
  },

}
</script>
