'use strict';

const fetch         = require( 'node-fetch' );
const http          = require( 'http' );
const https         = require( 'https' );
const { stringify } = require( 'querystring' )
const { resolve }   = require( 'url' );


/**
 * Take a url path part and attach a query string to it. If a query string is
 * already present on the path, the new query string will be appended to it.
 *
 * @param  {String} path
 * @param  {Object} queryData
 * @return {String}
 */
function attachQueryData( path, queryData )
{
    const queryString = stringify( queryData );

    if ( !queryString )
    {
        return path;
    }

    const joinChar = path.includes( '?' ) ? '&' : '?';

    return path + joinChar + queryString;
}

/**
 * A generic HTTP service with a managed keep-alive http connection pool.
 */
class Service
{
    constructor( rootUrl )
    {
        // Check which agent to use
        const { Agent } = rootUrl.substr(0, 6) === 'https:' ? https : http;

        /**
         * Agent instance that will manage a connection pool
         * to the service.
         *
         * @type {Agent}
         */
        this.agent = new Agent( {
            keepAlive       : true,
            maxFreeSockets  : 16,
        } );

        /**
         * Root url to the service to be prepended to all paths.
         * Has to include protocol.
         *
         * Example: http://foobar.com
         *
         * @type {String}
         */
        this.rootUrl = rootUrl;
    }

    /**
     * Make a request to the service, GET method by default.
     *
     * Options documentation: https://github.com/bitinn/node-fetch#options
     *
     * Response documentation: https://developer.mozilla.org/en-US/docs/Web/API/Response
     *
     * @param  {String} path
     * @param  {Object} queryData
     * @param  {Object} options
     *
     * @return {Promise} resolves to Response
     */
    request( path, queryData, options )
    {
        const pathWithData      = attachQueryData( path, queryData );
        const extendedOptions   = Object.assign( { agent: this.agent }, options );
        const url               = resolve( this.rootUrl, pathWithData );

        const method = ( options && options.method ) || 'GET';

        console.log( `🚚  Outgoing request: ${method} ${url}` );

        return fetch( url, extendedOptions );
    }

    /**
     * Make a POST request to the service with JSON payload.
     *
     * @param  {String} path
     * @param  {Object} queryData
     * @param  {Object} payload      JSON data
     *
     * @return {Promise} resolves to Response
     */
    postJSON( path, queryData, payload )
    {
        const options = {
            method  : 'POST',
            body    : JSON.stringify( payload ),
            headers : {
                'Content-Type'  : 'application/json',
            },
        };

        return this.request( path, queryData, options );
    }

    /**
     * Make a POST request to the service with form data payload.
     *
     * @param  {String} path
     * @param  {Object} queryData
     * @param  {Object} payload      form data
     *
     * @return {Promise} resolves to Response
     */
    postForm( path, queryData, payload )
    {
        const options = {
            method  : 'POST',
            body    : stringify( payload ),
            headers : {
                'Content-Type'  : 'application/x-www-form-urlencoded',
            },
        };

        return this.request( path, queryData, options );
    }
}


module.exports = Service;
