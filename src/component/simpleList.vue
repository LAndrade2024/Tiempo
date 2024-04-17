<style>

</style>
<template>
<div>
  <div class="row">
    <div class="col-sm-3" v-for="input in formFilters">
      <div v-if="input.type === 'select'">
        <label>{{input.label}}</label>
        <v-select  v-model="filter[input.key]" :options="options[input.options]" ></v-select>
      </div>
      <div v-if="input.type === 'datepicker'">
        <label>{{input.label}}</label><br />
        <datepicker  v-model="filter[input.key]" :clear-button="true" ></datepicker>
      </div>
      <v-input v-else type="input.type" v-model="filter[input.key]" :label="input.label" :clear-button="true"></v-input>
    </div>
  </div>
  <div style="margin: auto">
    <url-to-table  :url="url"   :request-now="true" :filter="filter" @delete="doDelete($event)" @new="doNew()" @put="doEdit($event)" :after-response="afterResponse"></url-to-table>
  </div>
</div>
</template>
<script>
const controllerURL = SERVER.controllerUrl;
import {
  input,
  select,
} from 'vue-strap';
import urlToTable from '../components/urlToTable.vue';
import datepicker from '../components/datepicker.vue';

Vue.use(VueResource);

export default
{

  data(){
    return  {
      formFilters: [
        {
          label: 'Nombre',
          key: 'nombre'
        }
      ],
      filter: {},
      request: true,
      wait: false,
    };
  },
  components: {
    urlToTable,
    datepicker,
    vInput: input,
    vSelect: select,
  },
  computed: {


  },
  created() {

    this.requestOptions();
    this.requestFilters();

  },
  methods: {
    requestFilters() {
      this.$http.get(this.url + '/listado/filters')
        .then(res => res.json())
        .then(json => this.formFilters = json)
        .then(() =>{
          this.filter = this.formFilters.reduce((s,i) => {
            s[i.key] = i.default || '';
            return s;
          }, {});
        })
        .catch(console.error);;
    },
    requestOptions(){
      return this.$http.get(this.url + '/formOptions')
        .then(res => res.json())
        .then(json => this.options = json)
        .catch(console.error);
    },
    doEdit(row) {
      window.location = controllerURL +'/form/#id='+ row.id;
    },
    doDelete(row) {
        if (!window.confirm('Seguro que desea eliminarlo')) {
          return;
        }
        this.$http.delete(controllerURL + '/' + row.id)
          .then(() =>{
              let index = this.list.indexOf(row);
              this.list.splice(index,1);
          })
          .catch(res=>{
            res.json()
            .then(json =>{
              this.msg.show = true;

              this.msg.text = json.msg;
            });
          });
    },
    doNew() {
      window.location = controllerURL +'/form/';
    },
  },
  props:{
    url: {
      type: String,
      default: controllerURL,
    },
    afterResponse: null,
  },
  watch: {

  },

}
</script>
