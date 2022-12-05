const { where } = require("sequelize");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("hipstagram", "root", "314314314", {
  dialect: "mysql",
  host: "localhost",
  port: 3306,
  define: {
    timestamps: false,
  },
});
const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };
  

const { Op } = Sequelize

module.exports = async function getModels(inputUserId){
    
    console.log('inputUserId',inputUserId)
    
    class User extends Sequelize.Model {
        get posts() {
          return this.getPosts();
        }
        get followers(){
          return User.findAll({
            include: {model: Followings, as:'Follow'}, 
            where:{'$Follow.user_id_followee$': this.dataValues.user_id}
          })
        }
        
        get followings(){
          return Followings.findAll({
            include: {model: User, as:'Liker',  attributes: ['user_login'] }, 
            // where:{user_id: this.dataValues.user_id}
            where:{'$Liker.user_id$': this.dataValues.user_id}
          })
        }
        
        get likesCount(){
          return (async () => {
            const likes = await PostLikes.findAndCountAll({
              where:{
                user_id: {
                  [Op.eq] : this.dataValues.user_id
                }
              }
            })
            return likes.count
          })
        }

        get commentLikes(){
          return this.getCommentLikes();
        }
      } 

      User.init(
        {
          user_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
          },
          user_nick: Sequelize.STRING,
          user_login: Sequelize.STRING,
          user_pass: Sequelize.STRING,
          user_createAt: Sequelize.DATE,
          // likesCount: {
          //   type: Sequelize.STRING,
          //   get () {
          //     console.log(this)
          //     return 'aw'
          //   }
          // },
        },
        { sequelize, modelName: "users", hooks:{
          beforeValidate:{
            
          }
        } }
      );
      
            
      class DialogsUsers extends Sequelize.Model {
      }
      
      DialogsUsers.init(
        {
          dialog_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
        },
        { sequelize, modelName: "dialogsusers",
          defaultScope: {
            where: {
              user_id: inputUserId.id
             },
          },
        }
      );


      class Dialog extends Sequelize.Model {
        get messages() {
          return this.getMessages();
        }
      }
      
      Dialog.init(
        {
          dialog_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          dialog_createAt: {
            type: Sequelize.STRING(10),
            defaultValue: getCurrentDate(),
          },
        },
        { sequelize, modelName: "dialog",
          defaultScope: {
            where: {
              dialog_id: {
                [Op.in]:await (async () => {

                const result = await DialogsUsers.findAll({})
                
                return result.map((el)=>{return el.dialog_id}).filter(function(item, pos, arr) {
                  return arr.indexOf(item) == pos;
                })
                })()
              }
            },
          },
        }
      );
     
      
      
      
      Dialog.hasMany(DialogsUsers, {
        foreignKey: "dialog_id",
        sourceKey: "dialog_id",
      });
      User.hasMany(DialogsUsers, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      DialogsUsers.belongsTo(Dialog, {
        foreignKey: "dialog_id",
        sourceKey: "dialog_id",
      });
      DialogsUsers.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      
      class Message extends Sequelize.Model {
        get user() {
          return this.getUser();
        }

        get dialog() {
          return this.getDialog();
        }
      } 
      
      Message.init(
        {
          message_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
          dialog_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            required: true,
            references: {
              model: "dialog",
              key: "dialog_id",
            },
          },
          message_text: Sequelize.STRING,
          message_createAt: {
            type: Sequelize.STRING,
            defaultValue: getCurrentDate(),
          },
        },
        { 
          sequelize, 
          modelName: "message",
          defaultScope: {
            where: {
              dialog_id: {
                [Op.in]:await (async () => {

                const result = await DialogsUsers.findAll({
                  where:{user_id: inputUserId.id}
                })
                
                return result.map((el)=>{return el.dialog_id}).filter(function(item, pos, arr) {
                  return arr.indexOf(item) == pos;
                })
                })()}
            }
          },
          hooks: {
            beforeValidate: (msg) => {
              if (!!msg.user_id || msg.user_id != inputUserId.id){
                throw new Error(`PERMISSION DENIED`)
              }
            }
          }
        }
      )

      Dialog.hasMany(Message, {
        foreignKey: "dialog_id",
        sourceKey: "dialog_id",
      });
      Message.belongsTo(Dialog, {
        foreignKey: "dialog_id",
        sourceKey: "dialog_id",
      });

      User.hasMany(Message, {
        foreignKey: "user_id",
      sourceKey: "user_id",
      });
      Message.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      class MessageLike extends Sequelize.Model {
        get user() {
          return this.getUser();
        }

        get message() {
          return this.getMessage();
        }
      } 
      
      MessageLike.init(
        {
          message_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
        },
        { sequelize, modelName: "messagelikes",
          hooks: {
            beforeValidate: (msglike) => {
              if (!!msglike.user_id || msglike.user_id != inputUserId.id){
                throw new Error(`PERMISSION DENIED`)
              }
            }
          } 
        }
      );
      
      Message.hasMany(MessageLike, {
        foreignKey: "message_id",
        sourceKey: "message_id",
      });
      MessageLike.belongsTo(Message, {
        foreignKey: "message_id",
        sourceKey: "message_id",
      });


      User.hasMany(MessageLike, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      MessageLike.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      class Post extends Sequelize.Model {
        get user() {
          return this.getUser();
        }
        
        get postLikes() {
          return this.getPostLikes();
        }

        get comments() {
          return this.getComments()
        }

        get likesCount(){
          return (async () => {
            const likes = await PostLikes.findAndCountAll({
              where:{
                post_id: {
                  [Op.eq] : this.dataValues.post_id
                }
              }
            })
            return likes.count
          })
        }

        get images(){
          return this.getPostImages();
        }

      }
      
      Post.init(
        {
          post_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
          post_title: Sequelize.STRING,
          post_text: Sequelize.STRING,
          post_createAt: {
            type: Sequelize.STRING,
            defaultValue: getCurrentDate(),
          },
        },
        { sequelize, modelName: "posts",
        // hooks: {
        //   beforeValidate: (post) => {
        //     if (!!post.user_id && post.user_id != inputUserId.id  ){
        //       throw new Error(`PERMISSION DENIED`)
        //     }
        //   }
        // } 
       }
      );
      
      User.hasMany(Post, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      Post.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      
      
      class Collection extends Sequelize.Model {}
      
      Collection.init(
        {
          collection_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
          collection_name: { type: Sequelize.STRING },
          collection_createAt: {
            type: Sequelize.STRING,
            defaultValue: getCurrentDate(),
          },
        },
        { sequelize, modelName: "collection",
        // defaultScope: {
        //   where: {
        //     user_id: inputUserId.id
        //   }
        // },
        // hooks: {
        //   beforeValidate: (collection) => {
        //     if (!!collection.user_id || collection.user_id != inputUserId.id){
        //       throw new Error(`PERMISSION DENIED`)
        //     }
        //   }
        // } 
       }
      );
      
      User.hasMany(Collection, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      
      class PostsCollection extends Sequelize.Model {
        get post(){
          return this.getPost();
        }

        get collection(){
          return this.getCollection();
        }
      }
      
      PostsCollection.init(
        {
          collection_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          post_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
          },
        },
        { sequelize, modelName: "postscollection",
          defaultScope:{
            where:{
              collection_id: {
                [Op.in]:await (async () => {
                  const result = await Collection.findAll({
                    where: {user_id: inputUserId.id}
                  })
                  
                  return result.map((el)=>{return el.collection_id}).filter(function(item, pos, arr) {
                    return arr.indexOf(item) == pos;
                  })
                })()
              }
            },
          },
          hooks: {
            beforeValidate: async (postscollection) => {
              const res = await Collection.findByPk(postscollection.collection_id)
              const res2 = await Collection.findAll({where:{collection_id: postscollection.collection_id}})
              
              if (res && !res2){
                throw new Error(`PERMISSION DENIED`)
              }
            }
          }
        }
      );
      
      Collection.hasMany(PostsCollection, {
        foreignKey: "collection_id",
        sourceKey: "collection_id",
      });

      
      Post.hasMany(PostsCollection, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });
      PostsCollection.belongsTo(Post, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });

      Collection.hasMany(PostsCollection, {
        foreignKey: "collection_id",
        sourceKey: "collection_id",
      });
      PostsCollection.belongsTo(Collection, {
        foreignKey: "collection_id",
        sourceKey: "collection_id",
      });


      
      class Followings extends Sequelize.Model { 
        get user() {
          console.log('this',this)
          return User.findByPk(this.dataValues.user_id_followee);
        }

      }
      
      Followings.init(
        {
          _id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
          user_id_followee: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
        },
        { sequelize, modelName: "followings" }
      );
      
      User.hasMany(Followings, {
        as: 'Follow',
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      
      Followings.belongsTo(User, {
        as:'Liker',
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      

      class PostLikes extends Sequelize.Model {
        get posts() {
          return this.getPost()
        }
      
        get user() {
          return this.getUser();
        }


      }
      
      PostLikes.init(
        {
          post_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "Posts",
              key: "post_id",
            },
          },
          user_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
        },
        { sequelize, modelName: "postLikes", 
        // defaultScope:{
        //   where: {
        //     post_id: {
        //       [Op.in]:await (async () => {

        //       const result = await PostLikes.findAll({})
                
        //       return result.map((el)=>{return el.post_id}).filter(function(item, pos, arr) {
        //         return arr.indexOf(item) == pos;
        //       })
        //       })()
        //     }
        //   },
        // },
        hooks:{
          beforeValidate: (postLike) => {
            if (!!postLike.user_id || postLike.user_id != inputUserId.id){
              throw new Error(`PERMISSION DENIED`)
            }
          }
        } 
      }
      );
      User.hasMany(PostLikes, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      PostLikes.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      
      Post.hasMany(PostLikes, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });
      PostLikes.belongsTo(Post, {
        foreignKey: "post_id",
        sourceKey: "post_id ",
      });


      class Comment extends Sequelize.Model {
        get user() {
          return this.getUser();
        }
        
        get commentLikes() {
          return this.getCommentLikes();// ! comment comments????
        }

        get likesCount() {
          return (async () => {
            console.log('this.dataValues',this.dataValues, await CommentLikes.findAll())
            // const likes = await CommentLikes.findAndCountAll({
            //   where:{
            //     comment_id: {
            //       [Op.eq] : this.dataValues.comment_id
            //     }
            //   }
            // })
            // return likes.count
            return 5
          })
        }
      }
      
      Comment.init(
        {
          comment_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          post_id: {
            type: Sequelize.INTEGER,
            references: {
              model: "posts",
              key: "post_id",
            },
            allowNull: false,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
          comment_text: Sequelize.STRING,
          comment_createAt: {
            type: Sequelize.STRING,
            defaultValue: getCurrentDate(),
          },
        },
        { sequelize, modelName: "comments",
        hooks: {
          beforeValidate: (comment) => {
            if (!!comment.user_id && comment.user_id != inputUserId.id){
              throw new Error(`PERMISSION DENIED`)
            }
          }
        } 
       }
      );
      
      Post.hasMany(Comment, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });
      Comment.belongsTo(Post, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });
      
      User.hasMany(Comment, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      Comment.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      class CommentLikes extends Sequelize.Model {
        get comments() {
          return this.getComments()
        }
      
        get user() {
          return this.getUser();
        }
      }
      
      CommentLikes.init(
        {
          comment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "comments",
              key: "comment_id",
            },
          },
          user_id: {
            type: Sequelize.INTEGER,
            foreignKey: true,
            allowNull: false,
            required: true,
            references: {
              model: "users",
              key: "user_id",
            },
          },
        },
        { sequelize, modelName: 'CommentLikes', 
        hooks:{
          beforeValidate: (commentLike) => {
            console.log('commentLike.user_id',commentLike.user_id,inputUserId.id)
            if (!!commentLike.user_id && commentLike.user_id != inputUserId.id){
              throw new Error(`PERMISSION DENIED`)
            }
          }
        } 
      }
      );
      User.hasMany(CommentLikes, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      CommentLikes.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });

      Comment.hasMany(CommentLikes, {
        foreignKey: "comment_id",
        sourceKey: "comment_id",
      });
      CommentLikes.belongsTo(Comment, {
        foreignKey: "comment_id",
        sourceKey: "comment_id",
      });


      class Image extends Sequelize.Model {
        get PostImages(){
          return this.getPostImages();
        }
      }
      
      Image.init(
        {
          image_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          image_originalname: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          image_mimetype: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          image_size: {
            type: Sequelize.STRING,
            allowNull: false,
          },
        },
        { sequelize, modelName: "Images"}
      );


      class PostImages extends Sequelize.Model {
        get posts(){
          return this.getPost();
        }
        get image(){
          return this.getImage()
        }
      }
      
      PostImages.init(
        {
          post_image_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          post_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "Posts",
              key: "post_id",
            },
          },
          user_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "Users",
              key: "user_id",
            },
          },
          image_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "Images",
              key: "image_id",
            },
          },
        },
        { sequelize, modelName: "PostImages"}
      );

      Post.hasMany(PostImages, {
        foreignKey: "post_id",
        sourceKey: "post_id",
      });
      PostImages.belongsTo(Post, {
        foreignKey: "post_id",
        sourceKey: "post_id ",
      });

      User.hasMany(PostImages, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
      PostImages.belongsTo(User, {
        foreignKey: "user_id",
        sourceKey: "user_id ",
      });

      Image.hasMany(PostImages, {
        foreignKey: "image_id",
        sourceKey: "image_id",
      });
      PostImages.belongsTo(Image, {
        foreignKey: "image_id",
        sourceKey: "image_id ",
      });


    return {User, Message,MessageLike, Post, Image, Collection, Dialog, Followings, PostLikes, PostImages,PostsCollection,Comment,CommentLikes}
}
