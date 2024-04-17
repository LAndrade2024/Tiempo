<template>
<nav>
  <ul class="pagination" v-if="pages < 11">
    <li class="page-item" @click.prevent="previo()"> <a class="page-link" href="#"><i class="fa fa-angle-left"></i></a></li>
    <li class="page-item" @click.prevent="changePage(page)" v-for="page in pages" :class="{active: page == currentPage}"><a class="page-link" href="#">{{page}}</a></li>
    <li class="page-item" @click.prevent="next()"><a class="page-link" href="#"><i class="fa fa-angle-right"></i></a></li>
  </ul>
  <template v-if="pages >= 11">
      <button class="btn btn-default" @click.prevent="previo()"><i class="fa fa-angle-left"></i> </button>
      <v-select :options="pagesSelect"  v-model="paginaActual" :search="true" @input="selectPage()"></v-select>
      <button class="btn btn-default" @click.prevent="next()"><i class="fa fa-angle-right"></i> </button>
    </template>
</nav>
</template>
<script>
import {
  select
} from 'vue-strap';
export default {
  props: {
    offset: {
      type: Number,
      default () {
        return 0;
      },
    },
    limit: {
      type: Number,
      default () {
        return 20;
      },
    },
    total: {
      type: Number,
      default () {
        return 80;
      },
    },
  },
  data() {
    return {
      paginaActual: 1,
    }
  },
  components: {
    'v-select': select,
  },
  computed: {
    pages: function () {
      return Math.ceil(this.total / this.limit);
    },
    currentPage: function () {
      return Math.floor(this.offset / this.limit) + 1;
    },
    pagesSelect: function () {
      let salida = [];
      for (let i = 1; i <= this.pages; i++) {
        salida.push({
          label: 'Página ' + i,
          value: i
        });
      }
      return salida;
    }
  },

  methods: {
    changePage(page) {
      this.paginaActual = page;
      if (this.currentPage == this.paginaActual) {
        return;
      }
      this.$emit('changepage', page);
    },
    selectPage() {
      this.changePage(this.paginaActual);
    },
    previo() {
      let page = this.currentPage > 1 ? this.currentPage - 1 : 1;
      this.changePage(page);
    },
    next() {
      let page = this.currentPage < this.pages ? this.currentPage + 1 : this.pages;
      this.changePage(page);
    }
  },

}
</script>
