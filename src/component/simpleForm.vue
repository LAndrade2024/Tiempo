<template>
  <modal v-model="modal.show" :title="formData.id ? 'Editar': 'Nuevo'">
    <v-input :key="field.name" v-for="field in formFields" :label="field.label" v-model="formData[field.name]" type="formField.type"></v-input>
    <div slot="modal-footer" class="modal-footer">
      <button v-if="formData.id" type="button" class="btn btn-primary" @click="doPut()">Modificar</button>
      <button v-if="!formData.id" type="button" class="btn btn-primary" @click="doPost()">Guardar</button>
      <button type="button" class="btn btn-default" @click="modal.show = false">Cancelar</button>
    </div>
  </modal>
</template>
<script>
import {
  input,
} from 'vue-strap';



export default {
  components: {
    vInput: input,
  },
  computed: {

  },
  mounted() {

  },
  props: {
    allowd:{},
    fields:{},
    formData:{},
    url: '',
  },
  methods: {
    
  },
  watch: {

  }
}
</script>
