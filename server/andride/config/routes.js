/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/
    '/': {
        view: 'homepage'
    },
    //Controllers Comunes.
    'get /config': 'IndexController.getConfig',
    'get /direccion': 'IndexController.getDireccion',
    'get /distancia': 'IndexController.getMatrix',
    'post /monto/estimado': 'IndexController.montoEstimado',
    //Cliente
//    'get /cliente': 'ClienteController.registroCliente',
    'post /clientes/login': 'ClienteController.login',
    'post /clientes/validate': 'ClienteController.validateToken',
    'post /clientes/suscribe': 'ClienteController.suscribe',
    'post /clientes/solicitud': 'ClienteController.solicitud',
    'get /cliente/choferes': 'ClienteController.getChoferes',
    //Chofer
    'post /chofer': 'ChoferController.create',
    'post /choferes/login': 'ChoferController.login',
    'post /choferes/logout': 'ChoferController.logout',
    'post /choferes/suscribe': 'ChoferController.suscribe',
    'post /choferes/posicion': 'ChoferController.trackChofer',
    'post /choferes/validate': 'ChoferController.validateToken',
//    'get /choferes/solicitud_prueba': 'ChoferController.solicitud',
    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

    'get /admin/clientes': 'AdminController.indexCliente',
    'get /admin/clientes/new': 'AdminController.newCliente',
    'get /admin/solicitudes': 'AdminController.indexSolicitudes',
    'get /admin/servicios': 'AdminController.indexServicios',
    'get /admin/choferes': 'AdminController.indexChoferes',
    'get /admin/autos': 'AdminController.indexAutos',
    'get /admin/pagos': 'AdminController.indexPagos',
    'get /admin/configuracion': 'AdminController.indexConfiguracion',
};