Vue.component("Tabla_Camas", props:[Datos_camas]),
template:'
  <div>
    <b-table striped hover :items="items"></b-table>
  </div>
'
<script>
export default {
    data() {
      return {
        items: [
          { Index: Datos[i].id, Ubicacion: Datos[i].ubic_nombre, Sector: Datos[i].sec_nombre, "Camas Libres": Datos[i].camas_libres},
            ]
      }
    }
}
</script>
