<template>
  <table class="table table-compact table-bordered table-striped table-condensed">
    <thead>
      <tr>
          <th></th>
          <th v-for="columna in columnas" style="text-align: center">{{columna}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="fila in filas">
          <th>{{fila}}</th>
          <td v-for="columna in columnas"><input  class="form-control" type="text" v-model="input[fila][columna]"/></td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import vSimpleTable from './vSimpleTable.vue';
import vPaginatedTable from './vPaginatedTable.vue';
export default {
  props: {
    columns: String,
    rows: String,
    value: {
      type: Object,
      default() {
        if (!this.filas) {
          return {};
        }
        return this.filas.reduce((s,i) => {
          s[i] = {};
          return s;
        }, {});
      }
    }
  },
  data() {
    return {
      input(){return {};}
    }
  },
  components: {

  },
  created(){
    this.setInput()
  },
  mounted(){

  },
  computed: {
    filas: function(){
      return this.rows.split(',');
    },
    columnas: function(){
      return this.columns.split(',');
    },

  },
  filters: {

  },
  methods: {
    setInput(){
      let input = Object.assign({}, this.value);
      this.filas.forEach(i => {
        if (!input[i]) {
          input[i] = {};
          this.columnas.forEach(j => input[i][j] = '');
        }
      });
      this.input = input;
    }
  },
  watch: {
    input: {
      handler() {
        this.$emit('input', this.input);
      },
      deep: true,
    },

  },
}
</script>
