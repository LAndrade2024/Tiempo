"use strict";

const api = require( "./api" );
//const auth = require( "./auth" );

module.exports.register = async server => {
   // register api routes
   await api.register( server );

   // register authentication routes
   //await auth.register( server );

   // home page route
   server.route( {
       method: "GET",
       path: "/",
       config: {
       handler : async ( request, h ) => {
               return h.view( "login", {title: __dirname,} )} //"Clinica"

            } });
      
   // Serve static files in the /dist folder
   server.route( {
       method: "GET",
       path: "/{param*}",
       handler: {
           directory: {
               path: "dist"
           }
       }
   } );
};