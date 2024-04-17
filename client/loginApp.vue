<template>
 <div id="app">
   <h1>{{ msg }}</h1>
   <div class="row" id="eventEdit">
       <h2>Login de Usuarios</h2>
       <form class="col s12" @submit.prevent="loginApp">
           <div class="row">
               <div class="input-field col s12">
                   <input v-model="description" ref="username" placeholder="username" id="username" type="text" class="validate">
                   <label for="username">Nombre de usuario</label>
               </div>
               <div class="row">
               <div class="input-field col s12">
                   <input v-model="description" ref="pwd" placeholder="pwd" id="pwd" type="password"  class="validate">
                   <label for="username">Clave de usuario</label>
               </div>
           </div>
           <button id="eventEditSubmit" class="btn" type="submit"><i class="material-icons right">send</i>Submit</button>
       </form>
   </div>
   </div>
</template>

<script>
import axios from "axios";
import * as M from "materialize-css";
import moment from "moment";

export default {
 name: "app",
 computed: {
   hasEvents() {
     return this.isLoading === false && this.events.length > 0;
   },
   noEvents() {
     return this.isLoading === false && this.events.length === 0;
   }
 },
 data() {
   return {
     id: 0,
     username: "",
     pwd: "",
   };
 },
 methods: {
   LoginEvent() {
     const event = {
       username: this.username,
       pwd: this.pwd,
     };
     axios
       .post( "/api/events", event )
       .then( () => {
         this.username = "";
         this.pwd = "";
         this.loadEvents();
       } )
       .catch( err => {
         this.msg = err.message;
         console.log( err );
       } );
   },
   confirmDeleteEvent( id ) {
     const event = this.events.find( e => e.id === id );
     this.selectedEvent = `'${ event.title }' on ${ event.startDate }${ event.startTime ? ` at ${ event.startTime }` : "" }`;
     this.selectedEventId = event.id;
     const dc = this.$refs.deleteConfirm;
     const modal = M.Modal.init( dc );
     modal.open();
   },
   formatDate( d ) {
     return d ? moment.utc( d ).format( "MMM D, YYYY" ) : "";
   },
   formatTime( t ) {
     return t ? moment( t ).format( "h:mm a" ) : "";
   },
   formatEvents( events ) {
     return events.map( event => {
       return {
         id: event.id,
         username: event.username,
         pwd: event.pwd,
       };
     } );
   },
   loadEvents() {
     axios
       .get( "/api/events" )
       .then( res => {
         this.isLoading = false;
         this.events = this.formatEvents( res.data );
       } )
       .catch( err => {
         this.msg = err.message;
         console.log( err );
       } );
   }
 },
 mounted() {
   return this.loadEvents();
 }
};
</script>

<style lang="css">
#app h2 {
 font-size: 2rem;
}
.datetime-label {
 color: #9e9e9e;
 font-size: .8rem;
}
</style>