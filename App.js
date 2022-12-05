// const mongoose = require('mongoose')
const express = require("express");
const bodyParser = require("body-parser");
const getModels = require("./models/models.js");
const schema = require("./schema/schema.js")();``
const fs     = require("fs")
const cors   = require('cors');

const Sequelize = require("sequelize");
const sequelize = new Sequelize("hipstagram", "root", "314314314", {
  dialect: "mysql",
  host: "localhost",
  port: 3306,
  define: {
    timestamps: false,
  },
});

sequelize.authenticate().then(() => {
  console.log("THE DATABASE HAS CONNECTED");
});

const upload = require('./upload')


const { graphqlHTTP } = require("express-graphql");

const {sign, verify} = require('jsonwebtoken');

const {hash, compare} = require('bcrypt');

const { where,  } = require("sequelize");

const { Op } = Sequelize

const JWT_SALT       = 'SupErСесуритИ'

function jwtCheck(req){
  if (req.headers.authorization){
      const token = req.headers.authorization.slice(7)
      try {
          return verify(token, JWT_SALT)
      }
      catch(e){
      }
  }
}


class VisibleUser extends Sequelize.Model {
  // get age(){
  //     return ((new Date).getTime() - this.dateOfBirth.getTime())/(365 * 24 * 60 * 60 * 1000)
  // }

  get posts() {
    return this.getPosts();
  }
}

VisibleUser.init({
  user_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  user_login: Sequelize.STRING,
  user_pass: Sequelize.STRING, 
  user_createAt: Sequelize.DATE,
  user_nick: Sequelize.STRING,
}, {sequelize, modelName: 'user',
  hooks: {
    beforeCreate: async ({user_login}, User) => {
      const result = await User.User.count({where:{user_login}})
      result > 0 && (() => {throw new Error("User with same data already exist!")})()
    },
  }
})


async function updateOrCreate(model, where, newItem) {
  // First try to find the record
  const foundItem = where !== null ? await model.findOne({ where }): null
  console.log('foundItem',where,foundItem)
  if (where !== null || !foundItem) {
    console.log('Item not found, create a new one',newItem)
    const item = await model.create(newItem);
    return item;
  }
  console.log("Found an item, update it")
  await model.update(newItem, { where });
  const item = await model.findOne({where})
  return item;
}

const rootValue = {
  async getUser({ user_id },{models: {User}}) {
    return await User.findByPk(user_id);
    
  },

  async getUsers({query}, {models: {User}}) {
    const {byWhat, value, how} = query
    console.log('byWhat, value, how',byWhat, value, how)
    return await User.findAll({
      where:{
        [byWhat]:{
          [Op[how]]: (!isNaN(value)? Number(value) :value)
        }    
      }
    });
  },

  async getPost({ post_id }, {models: Post}) {
    return await Post.findByPk(post_id);
  },
  async getPosts({query:{SortObj,SortInput}}, {models: {Post}}) {
    const {byWhat, value, how} = SortObj
    const {limit,skip,sort:{key, type}} = SortInput
    
    return await Post.findAll({
      limit,
      offset:skip,
      order: [[key, type]],
      where:{
        [byWhat]:{
          [Op[how]]: (!isNaN(value)? Number(value) :value)
        }    
      }
    });

  },
  
  async getPostLike({ post_id }) {
    return await PostLikes.findByPk(post_id);
  },
  async getPostLikes(skip, {models: {PostLikes}, dialog}) {
    return await PostLikes.findAll();
  },
  
  async getMessage({ message_id }, {models: {Message}}) {
    return await Message.findByPk(message_id);
  },
  async getMessages(skip, {models: {Message}, dialog}){
    return await Message.scope('defaultScope').findAll()
  },

  async getDialog({ dialog_id }, {models: {Dialog}}) {
    return await Dialog.findByPk(dialog_id);
  },
  async getDialogs(skip, {models: {Dialog}}){
    return await Dialog.findAll({})
  },

  async getCollection({ collection_id }, {models: {Collection}}) {
    return await Collection.findByPk(collection_id);
  },
  async getCollections(skip, {models: {Collection}}){
    return await Collection.findAll({})
  },

  async getMessageLike({ message_id }, {models: {MessageLike}}) {
    return await MessageLike.findByPk(message_id);
  },
  async getMessageLikes(skip, {models: {MessageLike}}) {
    return await MessageLike.findAll();
  },
  
  async getPostsCollection({ collection }, {models: {PostsCollection}}) {
    return await PostsCollection.findOne({where:{[Op.or]: [{post_id: collection.post_id ? collection.post_id: ''}, {collection_id: collection.collection_id? collection.collection_id: ''}]}});
  },
  async getPostsCollections(skip, {models: {PostsCollection}}) {
    return await PostsCollection.findAll();
  },

  
  async getFollowing({ _id }, {models: {Followings}}) {
    return await Followings.findByPk(_id);
  },
  
  async getFollowings(skip, {models: {Followings}}) {
    return await Followings.findAll();
  },
  
  async getPostLike({ post_id }, {models: {PostLikes}}) {
    return await PostLikes.findByPk(post_id);
  },
  async getPostLikes(skip, {models: {PostLikes}}){
    return await PostLikes.findAll({})
  },

  async getPostImage({ post_image_id }, {models: {PostImages}}) {
    return await PostImages.findByPk(post_image_id);
  },
  async getPostImages(skip, {models: {PostImages}}){
    return await PostImages.findAll({})
  },


 
  async getCommentLike({ comment_id }, {models: {CommentLikes}}) {
    return await CommentLikes.findByPk(comment_id);
  },
  
  async getCommentsLikes(skip, {models: {CommentLikes}}) {
    return await CommentLikes.findAll();
  },
  
  
  async addCommentLike({ commentLike }, {models: {CommentLikes}}) {
    return await updateOrCreate(CommentLikes, { ...commentLike }, commentLike);
  },

  async addPosts({ posts }, {thisUser, models: {Post}}) {
    console.log('thisUser',thisUser)
    console.log('thisUser.user_id',{user_id: thisUser.user_id, ...posts})
    return await updateOrCreate(Post, null, {user_id: thisUser.user_id,...posts, post_createAt:new Date().toJSON().slice(0,10)});
  },

  async updatePosts({ posts }, {models: {Post}}) {
    return await updateOrCreate(Post, { ...posts }, posts);
  },

  async addMessage({ message }, {thisUser, models: {Message}}) {
    // console.log('thisUser',thisUser.user_id)
    if(!!thisUser){
      return await updateOrCreate(Message, (message.message_id? {message_id: message.message_id} : null), {...message, user_id: thisUser.user_id});
    }
  },

  async addMessageLike({ messageLike }, {thisUser, models: {MessageLike}}) {
    if(!!thisUser){
      return await updateOrCreate(MessageLike, (messageLike? { message_id: messageLike.message_id, user_id: messageLike.user_id}: null), {...messageLike, user_id: messageLike.user_id});
    }
  },

  async addCollection({ collection }, {thisUser, models: {Collection}}) {
    if(!!thisUser){
      return await updateOrCreate(Collection, (collection? { collection_id: collection.collection_id, user_id: collection.user_id}: null), {...collection, user_id: collection.user_id});
    }
  },
  
  async addPostLike({ postLike }, {models: {PostLikes}}) {
    return await updateOrCreate(PostLikes, { ...postLike }, postLike);
  },
  
  async addPostImage({ postImage }, {models: {PostImages}}) {
    return await updateOrCreate(PostImages, { ...postImage }, postImage);
  },

  async addPostsCollections({ collection }, {thisUser, models: {PostsCollection}}) {
    if(!!thisUser){
      return await updateOrCreate(PostsCollection, (collection? { collection_id: collection.collection_id, post_id: collection.post_id}: null), {...collection, collection_id: collection.collection_id});
    }
  },

  async login({login, password}){
    if (!login || !password) return null
    const user = await VisibleUser.findOne({where: {user_login: login}})
    if (!user) return null
    if (await compare(password, user.user_pass)){
      return sign({id: user.user_id, login: user.user_login}, JWT_SALT)
    }
    return null
  },


  async register({login, password, nick}, {models:User}){
    // if (!thisUser && login && password && !(await VisibleUser.findOne({where: {user_login: login}}))){  
      return await VisibleUser.create({user_login: login, user_nick: nick, user_pass: await hash(password, 10)}, User)
    // }
  }
};


const app = express();
app.use(express.static("frontend"));
app.use(express.static("public"));
app.use(cors({
  origin: ['http://localhost:3000',],
}));
app.use(bodyParser.json());

app.use( "/graphql", graphqlHTTP(async (req, res) => {
  const jwtInf = jwtCheck(req)

  if (jwtInf){
    console.log("REGISTERED",jwtInf)
    const models = await getModels(jwtInf)
    const thisUser = await models.User.findByPk(jwtInf.id)
    console.log('thisUser ',thisUser)
    return {
      schema,
      rootValue,
      graphiql: true,
      context: {thisUser, models}
    }
  }
  console.log("UNREGISTERED")
  return {
    schema,
    rootValue,
    graphiql: true,
    context: {models: await getModels({id: -1}), params: {}}
  }
  
})
);


// app.get("/messages", async (req, res) => {
  // const jwtInf = jwtCheck(req)
  // console.log('jwtCheck(req)',jwtCheck(req))

  // const models = await getModels({id:1})
  // const thisUser = await models.User.findByPk(1)

  // res.send(await rootValue.getMessages({}, {thisUser, models: models}));
// });

// app.post("/messages", async (req, res) => {
//   console.log('req',req.headers.authorization)
//   const jwtInf = jwtCheck(req)
//   const models = await getModels(jwtInf)
//   const thisUser = await models.User.findByPk(jwtInf.id)

//   res.send(await rootValue.getMessages(skip, {thisUser, models: models.Message}));
// });

// app.get("/user", async (req, res) => {
//   res.send(
//     await User.findAll({ where: { user_id: { [Sequelize.Op.gte]: 1 } } })
//   );
// });


// app.get("/post", async (req, res) => {
//   res.send(
//     await Post.findAll({ where: { post_id: { [Sequelize.Op.gte]: 1 } } })
//   );
// });

// app.get("/post/:id", async (req, res) => {
//   const id = req.params.id;
//   console.log("id", id);
//   res.send(await Post.findByPk(id));
// });

// app.post("/messages", async (req, res) => {
//   let newMessage = new Message(req.body);
//   console.log("newMessage", newMessage);
//   await newMessage.save();
//   res.status(201).send(newMessage);
// });

// app.post("/post", async (req, res) => {
//   let newPost = new Post(req.body);
//   await newPost.save();
//   res.send(newPost);
// });

// app.post("/followings", async (req, res) => {
//   let newFollow = new Followings(req.body);
//   await newFollow.save();
//   res.send(newFollow);
// });

// app.post("/dialogs", async (req, res) => {
//   let newDialog = new Dialog(req.body);
//   await newDialog.save();
//   res.status(201).send(newDialog);
// });


app.get("/images/:image_originalname", async (req, res) => {
  console.log("IMAGE!!!!")
  var stat = fs.statSync(`./public/upload/${req.params.image_originalname}`);

    res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Content-Length': stat.size
    });
    
  fs.readFile(`./public/upload/${req.params.image_originalname}`,
    function (err, content) {
        res.end(content);
    });
});

app.get("/images", async (req, res) => {
  console.log("IMAGE!!!!")
  
    const readStream = fs.createReadStream(`./public/upload/photo_2022-11-29_23-49-56.jpg`);
    readStream.pipe(res);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const decoded = jwtCheck(req)
    if (decoded){
        const {originalname, mimetype, filename, size} = req.file
        const {Image} = await getModels(decoded)
        const result = await Image.create({image_originalname:originalname, image_mimetype:mimetype, image_filename:filename, image_size:size})
        res.status(201).end(JSON.stringify(result))
    }
    else {
        res.status(403).end('Unauthorized file upload prohibited')
    }
})

app.listen(4000, () => {
  console.log("Я встал");
});
