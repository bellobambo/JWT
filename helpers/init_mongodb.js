const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
})
    .then(() => {
        console.log("DB Connected");
    }).catch(err => {
        console.error('DB Connection Error:', err.message);
    });

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB')
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected')
})

process.on('SIGINT', async ()=>{
    await mongoose.connection.close();
    process.exit(0)
})