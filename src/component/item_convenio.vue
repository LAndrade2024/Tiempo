<template>
<tr>
  <template v-if="editar">
      <td><input type="text" v-model="item.modulo" placeholder="Módulo"></td>
      <td>{{item.practica_cod.split('-')[0]}}</td>
      <td><strong >{{item.practica_cod.split('-')[1]}}</strong></td>
      <td><v-select v-model="item.especialidad_id" options="options.especialidades"><v-se></td>
      <td><input v-model="item.practica_cod" options="options.practicas" required ><input></td>
      <td><input v-model="item.cargo" @required="!item.por_presupuesto" placeholder="A Cargo O.S"></input></td>
      <td><input type="number" v-model="item.dias" placeholder="Días incl."></td>
      <td><input type="checkbox"  v-model="item.por_presupuesto" placeholder="Días incl."></td>
      <td>
        <button type="button" class="btn btn-xs" @click.prevent="update(index)"><i class="fa fa-save" ></i></button>
        <button type="button" class="btn btn-xs btn-danter" @click.prevent="borrar(index)"><i class="fa fa-remove" ></i></button>
      </td>
    </template>
  <template v-if="!editar">
      <td>{{item.modulo}}</td>
      <td>{{item.practica_cod.split('-')[0]}}</td>
      <td><strong>{{item.practica_cod.split('-')[1]}}</strong></td>
      <td>{{item.especialidad_id}}</div>
      <td>{{item.descripcion}}</div>
      <td style="text-align: right">{{item.por_presupuesto ? 'P/P' : item.cargo}}</td>
      <td>{{item.dias}}</td>
      <td>{{item.por_presupuesto ? 'Si' : ''}}</td>
      <td>
        <button type="button" class="btn btn-xs" @click.prevent="editar=true"><i class="fa fa-edit" ></i></button>
        <button type="button" class="btn btn-xs btn-danger" @click.prevent="borrar(index)"><i class="fa fa-remove" ></i></button>
      </td>
    </template>
</tr>
</template>
<script>
export default {
  data() {
    return {
      editar: false
    }
  },
  methods: {
    edit() {

      this.editar = true;
    },
    borrar(index) {
      this.$emit('delete-item', index)
    },
    update(data) {
      this.$emit('update-item', data)
    },
  },
  props: {
    item: {
      type: Object
    },
    index: {
      type: Number
    }
  },

}
</script>
