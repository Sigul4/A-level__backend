const { buildSchema } = require("graphql");

module.exports = () => {
    return schema = buildSchema(`
    type Query {
        getUser(user_id: ID!): User
        getUsers(query: SortObj): [User]
        
        getPost(post_id: ID!): Posts
        getPosts(query: PostsQuery): [Posts]
      
        getPostLike(post_id: ID!): PostLikes
        getPostLikes: [PostLikes]
      
        getPostImage(post_image_id: ID!): PostImages
        getPostImages: [PostImages]
      
        getCommentLike(comment_id: ID!): CommentLike
        getCommentLikes: [CommentLike]
      
        getFollowing(_id: ID!): Followings
        getFollowings: [Followings]

        getMessage(message_id: ID!): Message
        getMessages: [Message]

        getDialog(dialog_id: ID!): Dialog
        getDialogs: [Dialog]

        getMessageLike(message_id: ID!): MessageLike
        getMessageLikes:[MessageLike]
        
        getCollection(collection_id: ID!): Collection
        getCollections:[Collection]

        getPostsCollection(collection: PostsCollectionInput): PostsCollection
        getPostsCollections:[PostsCollection]

        login(login: String, password:String): String
    }

    type Mutation {
        addPosts(posts: PostsInput): Posts
        updatePosts(posts: PostsInput): Posts
        addMessage(message: MessageInput): Message
        addMessageLike(messageLike: MessageLikeInput): MessageLike
        addCollection(collection: CollectionInput): Collection
        addPostsCollections(collection: PostsCollectionInput): PostsCollection
        addPostLike(postLike: PostLikesInput): PostLikes
        addPostImage(postImage: PostImagesInput): PostImages
        addCommentLike(commentLike: CommentLikeInput): CommentLike
        register(login: String!, password: String!, nick:String!): User
    }

    input PostsQuery{
      SortObj:SortObj
      SortInput:SortInput
    }

    input SortInput {
      limit: Int
      skip: Int
      sort: OrderParams
    }

    input OrderParams{
      key: String
      type: String
    }

    input SortObj{
      byWhat: String
      value: String
      how: String
    }

    type Posts {
        post_id: ID
        user_id: ID
        user: User
        postLikes: [PostLikes]
        post_title: String
        post_text:  String 
        post_createAt: String
        likesCount: Int
        collections:[PostsCollection]
        comments: [Comments]
        images: [PostImages]
    }
    input PostsInput {
        post_id: ID
        user_id: ID
        post_title: String
        post_text:  String
    }
    
    type User {
        user_id: ID
        posts: [Posts]
        postLikes: [PostLikes]
        user_nick: String
        user_login: String
        user_pass: String
        user_createAt: String
        followings: [User]
        followers: [Followings]
        comments: [Comments]
        commentLikes: [CommentLike]
        likesCount: Int
    }
    input UserInput {
        user_id: String
        user_login: String
        user_nick : String
    }

    type Message {
        message_id: ID 
        user_id: ID
        user: User 
        dialog_id: ID
        dialog: Dialog
        message_text: String 
        message_createAt: String
    }
    input MessageInput {
        message_id: ID
        user_id: ID
        dialog_id: ID
        message_text: String
    }

    type MessageLike {
        message_id: ID
        message: Message
        user_id: ID
        user: User
    }

    input MessageLikeInput {
        message_id: ID
        user_id: ID
    }

    type PostLikes { 
        post_id: ID
        posts: Posts
        user: User
        user_id: ID
    }
    
    input PostLikesInput {
        post_id: ID
        user_id: ID
    }

    type Dialog {
      dialog_id: ID
      dialog_createAt: String
      dialog_members:  [User]
      messages: [Message]
    }
    input DialogInput{
        dialog_id: ID
    }


    type Collection {
        collection_id: ID,
        user_id: ID
        collection_name: String
        posts: [Posts]
        owner: User
    }
    input CollectionInput{
        collection_id: ID
        collection_name: String
        user_id: ID
    }

    type Comments {
      comment_id: ID
      post_id: ID
      post: Posts
      user_id: ID
      user: User
      comment_text: String
      comment_createAt: String
      commentLikes: [CommentLike]
      likesCount: Int
    }

    input CommentsInput{
      comment_id: ID
      post_id: ID
      user_id: ID
      comment_text: String
    }

    type CommentLike {
      comment: Comments
      comment_id: ID
      user_id: ID
      user: User
    }
    
    input CommentLikeInput {
      comment_id: ID
      user_id: ID
    }

    type Followings {
      _id: ID
      user_id: String
      user_id_followee: String
      user: User
    }

    input FollowingsInput {
      _id: ID
      user_id: String
      user_id_followee: String
    }

    type PostImages {
      post_image_id: ID
      post_id: ID
      posts: Posts
      user_id: ID
      user: User
      image_id: ID
      image: Image
    }

    input PostImagesInput {
      post_image_id: ID
      image_id: ID
      post_id: ID
      user_id: ID
    }

    type PostsCollection {
      collection_id: ID
      collection: Collection
      post_id: ID
      post: Posts
    }
    
    input PostsCollectionInput{
      collection_id: ID
      post_id: ID   
    }

    type Image {
      image_id: ID
      image_originalname: String
      image_mimetype: String
      image_size: String
      images: [PostImages]
    }
    
    input ImageInput{
      image_id: ID
      image_originalname: String
      image_mimetype: String
      image_size: String
    }
`);
}
