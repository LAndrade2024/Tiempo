"use strict";

const utils = require( "../utils" );

const register = async ( { sql, getConnection } ) => {
   // read in all the .sql files for this folder
   const sqlQueries = await utils.loadSqlQueries( "events" );

   const getEvents = async userId => {
       // get a connection to SQL Server
       const cnx = await getConnection();

       // create a new request
       const request = await cnx.request();

       // configure sql query parameters
       request.input( "userId", sql.VarChar( 50 ), userId );

       // return the executed query
       return request.query( sqlQueries.getEvents );
   };
   //************************************************************************ */
   const loginEvent = async ( {userName,userPws } ) => {
    const pool = await getConnection();
    const request = await pool.request();
    request.input( "userName", sql.VarChar( 80 ), userName );
    request.input( "userPws", sql.VarChar( 80 ),userPws );
    return request.query( sqlQueries.LoginEvent );
   };
   //************************************************************************ */
   return {
       getEvents,
       loginEvent
   };
};

module.exports = { register };