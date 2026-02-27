const mongoose = require ('mongoose')
require("dotenv").config()

function connectToDataBase() {

    mongoose.connect(process.env.MONGODB_URI)

    mongoose.connection.on('connected' , () => {
        console.log('Connected to Database Successfully ')
    })

     mongoose.connection.on('error' , (err) => {
        console.log('Failed Connecting to your Database ', err)
    })
}

module.exports = {connectToDataBase}