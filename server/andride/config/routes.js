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
'/': 'AdminController.home',
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
        'post /clientes/suscribe/chofer': 'ClienteController.suscribeChofer',
        'post /clientes/servicio/cancel': 'ClienteController.cancelarServicio',
        'get /cliente/choferes': 'ClienteController.getChoferes',
        'get /cliente/viajes': 'ClienteController.getViajes',
        'get /cliente/servicio/pendiente': 'ClienteController.getServicioPendiente',
        'get /cliente/servicio/status': 'ClienteController.getServicioStatus',
        'get /cliente/solicitud': 'ClienteController.getSolicitud',
        'get /cliente/mensajes': 'ClienteController.getQueueMsg',
        'post /cliente/mensaje/confirma': 'ClienteController.confirmaMsg',
        'post /cliente/registro/validar': 'ClienteController.validarEmail',
        'post /cliente/registro': 'ClienteController.create',
        'post /cliente/pay/add': 'ClienteController.addPayment',
        //Chofer
        'post /chofer': 'ChoferController.create',
        'get /chofer': 'ChoferController.getChofer',
        'post /choferes/login': 'ChoferController.login',
        'post /choferes/logout': 'ChoferController.logout',
        'post /choferes/suscribe': 'ChoferController.suscribe',
        'post /choferes/posicion': 'ChoferController.trackChofer',
        'post /choferes/validate': 'ChoferController.validateToken',
        'post /choferes/servicio': 'ChoferController.servicio',
        'post /choferes/place': 'ChoferController.onPlace',
        'post /choferes/servicio/inicio': 'ChoferController.empiezaViaje',
        'post /choferes/servicio/final': 'ChoferController.terminaViaje',
        'get /choferes/servicio': 'ChoferController.getServicio',
        'get /choferes/solicitud/pendiente': 'ChoferController.getServicioPendiente',
        'get /choferes/solicitud': 'ChoferController.getSolicitud',
        'post /choferes/servicio/cancelo/cliente': 'ChoferController.canceloCliente',
        'post /choferes/estatus': 'ChoferController.cambiarStatus',
        'post /choferes/servicio/cancel': 'ChoferController.cancelarServicio',
        'post /choferes/servicio/track': 'ChoferController.trackRecorridoServicio',
        'get /chofer/autos': 'ChoferController.getAutos',
        'post /chofer/auto/activar': 'ChoferController.setAutoActivo',
        'post /chofer/registro/validar': 'ChoferController.validarEmail',
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
        'get /login': {view:'login'},
        'get /signup': {view:'signup'},
        'post /login': 'AdminController.login',
        'post /user': 'AdminController.user',
        '/logout': 'AdminController.logout',
        'get /admin/clientes': 'AdminController.indexCliente',
        'get /admin/clientes/new': 'AdminController.newCliente',
        'get /admin/clientes/edit/:cliente': 'AdminController.editCliente',
        'get /admin/clientes/servicios/:clienteId': 'AdminController.getClienteServicios',
        'post /admin/clientes/new': 'AdminController.saveCliente',
        'post /admin/clientes/edit/:clienteId': 'AdminController.updateCliente',
        'get /admin/solicitudes': 'AdminController.indexSolicitudes',
        'get /admin/servicios': 'AdminController.indexServicios',
        'get /admin/choferes': 'AdminController.indexChoferes',
        'get /admin/choferes/new': 'AdminController.newChofer',
        'post /admin/choferes/new': 'AdminController.saveChofer',
        'get /admin/choferes/delete/:choferId': 'AdminController.deleteChofer',
        'get /admin/choferes/mapa': 'AdminController.getChoferes',
        'get /admin/choferes/edit/:choferId': 'AdminController.editChofer',
        'post /admin/choferes/edit/:choferId': 'AdminController.updateChofer',
        'get /admin/autos/:chofer': 'AdminController.indexAutos',
        'get /admin/autos/new/:chofer': 'AdminController.newAuto',
        'post /admin/autos/new/:chofer': 'AdminController.saveAuto',
        'get /admin/pagos': 'AdminController.indexPagos',
        'get /admin/configuracion': 'AdminController.indexConfiguracion',
        'post /admin/configuracion': 'AdminController.saveConfiguracion',
        'post /admin/servicio': 'AdminController.suscribe',
        'get /admin/delegados': 'AdminController.indexDelegados',
        'get /admin/delegados/new': 'AdminController.newDelegado',
        'post /admin/delegados': 'AdminController.saveDelegado',
        
};