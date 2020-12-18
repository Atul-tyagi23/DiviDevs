const express = require('express');
const mongoose = require('mongoose')
require('dotenv').config()


const app = express();


// Connect database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongodbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify:false,           
        })
        console.log(`mongoDB database connected`)
    } catch (err) {
        console.log(err);
        // Exit process
        process.exit(1);
    }
}
connectDB();

// Init Middleware

app.use(express.json({extended: false}))


app.get('/', (req, res) => {
    res.send('Welcome to DiviDevs')
})

// Define routes
app.use('/api/user', require('./routes/api/user'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/auth', require('./routes/api/auth'))


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
