const { User, Message, Upvote } = require('../models/models.js')
const jwt = require('jsonwebtoken')
const { Router } = require('express')
const router = Router()


router.get('/', async function (req, res){
    let messages = await Message.findAll({include: Upvote}) //include upvote model in the search  so
    let data = { messages }                                 // corresponding upvote score of the message will be accessed

    res.render('index.ejs', data)
})

router.get('/createUser', async function(req, res){
    res.render('createUser.ejs')
})

router.post('/createUser', async function(req, res){
    let { username, password } = req.body

    try {
        await User.create({
            username,
            password,
            role: "user"
        })  
    } catch (e) {
        console.log(e)
    }

    res.redirect('/login')
})

router.get('/login', function(req, res) {
    res.render('login')
})

router.post('/login', async function(req, res) {
    let {username, password} = req.body


    try {
        let user = await User.findOne({  //the error is corrected here by simply moving the if statement and the 
            where: {username}           //into the scope of the try so it can be the user would not be undefined
        })        

    if (user && user.password === password) {
        let data = {
            username: username,
            role: user.role
        }

        let token = jwt.sign(data, "theSecret")
        res.cookie("token", token)
        res.redirect('/')
    } else {
        res.redirect('/error')
    }
} catch (e) {
    console.log(e)
}
})

router.get('/message', async function (req, res) {
    let token = req.cookies.token 

    if (token) {                                      // very bad, no verify, don't do this
        res.render('message')
    } else {
        res.render('login')
    }
})

router.post('/message', async function(req, res){
    let { token } = req.cookies
    let { content } = req.body

    if (token) {
        let payload = await jwt.verify(token, "theSecret")  
 
        let user = await User.findOne({
            where: {username: payload.username}
        })

        let upvote = await Upvote.create({  //create an upvote instance
            score:0,
            text:content
        })

        let msg = await Message.create({  //create a message instance wih the foreign keys added also
            content,
            userId: user.id,
            likeId: upvote.id
        })

        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})


router.get("/createLikes/:text/:likes", async function(req,res){  //as relating to the link in ejs file
                                                 // :text represent the message that is liked and
                                                 // :likes  is variable for current # of likes
    let countLike = parseInt(req.params.likes)  // convert the number of likes to integer    
    let nextCountLike = countLike + 1           //add one to it
    let likes = await Upvote.update({score:nextCountLike},{ // update the instance of upvote 
        where: {                                            // where score = current score displayed            
            score: countLike,
            text: req.params.text                           //where text column = the the concened message being liked
        }
    })

    res.redirect("/")                      //redirect to home


})
 

router.get('/error', function(req, res){
    res.render('error')
})

router.all('*', function(req, res){
    res.send('404 dude')
})

module.exports = router