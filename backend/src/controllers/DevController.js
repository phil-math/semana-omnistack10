const axios = require('axios')

const parseStringAsArray = require('../utils/parseStringAsArray')
const Dev = require('../models/Dev')
const {findConnections,sendMessage} = require('../websocket')

// Metodos do Controller
//index, show, store, update, destroy

module.exports = {
    async index(req,res){
        const devs = await Dev.find()
        return res.json(devs)
    },
    async store(request, response){
        const {github_username, techs="", latitude, longitude} = request.body
        let dev = await Dev.findOne({github_username})
        if(!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)      
            const {name=login , avatar_url, bio}=apiResponse.data
            const techsArray = parseStringAsArray(techs)
            const location = {
                type: 'Point',
                coordinates:[longitude,latitude]
            }
            dev = await Dev.create({
                github_username, name,
                avatar_url, bio,
                techs:techsArray,
                location
            })
            const sendSocketmessageTo=findConnections(
                {latitude,longitude},
                techsArray
            )
            sendMessage(sendSocketmessageTo,'new_dev',dev)
        }
        return response.json(dev)
    },
    
    async show(req,res){
        const {gitName} = req.params   
        let dev = await Dev.findOne({
            github_username:{$eq:gitName}
        })
        return res.json(dev)
    },

    async update(req,res){
        const {gitName} = req.params
        const {name,bio,avatar_url,techsString,location} = req.body
        const techs =parseStringAsArray(techsString)
                
        await Dev.updateOne({
            github_username:{$eq:gitName}
        },{
            name,bio,avatar_url,
            techs,location
        })
        let dev = await Dev.findOne({
            github_username:{$eq:gitName}
        })
        return res.json(dev)
    },
    async destroy(req,res){
        const {gitName} = req.hea
        let dev = await Dev.deleteOne({
            github_username:{$eq:gitName}
        })
        return res.json(dev)
    }
}