const {Router} = require('express')
const DevController = require('./controllers/DevController')
const SearchController = require('./controllers/SearchController')

const routes = Router();

routes.post('/devs',DevController.store)

routes.put('/devs/:gitName',DevController.update)

routes.get('/devs/:gitName',DevController.show)
routes.get('/devs',DevController.index)
routes.get('/search',SearchController.index)

module.exports =routes;