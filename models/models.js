const {Model, DataTypes, Sequelize} = require('sequelize');

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "../temp.db"
})

class User extends Model {}
User.init({
    role: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
}, {sequelize})


class Message extends Model{}
Message.init({
    content: DataTypes.STRING,
    time: DataTypes.TIME,
}, {sequelize})

class Upvote extends Model{}
Upvote.init({
    score:DataTypes.INTEGER,
    text: DataTypes.STRING
},{sequelize})

Upvote.hasOne(Message)                   //create one to one association so that each "like"/"upvote" will be uniqu to one message 
Message.belongsTo(Upvote, {foreignKey:"likeId"}) // rename the foreign key to likeId, this is also to make the relationship mandatory

User.hasMany(Message)
Message.belongsTo(User);

(async()=>{
    sequelize.sync({force:true})
})()

module.exports = {
    User, 
    Message,
    Upvote, 
    sequelize
}

