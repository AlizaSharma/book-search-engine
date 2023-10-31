const { AuthenticationError } = require('apollo-server');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          return context.user;
        } else {
          throw new Error('User not authenticated');
        }
      },
    },
  
    Mutation: {
        login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
    
          if (!user) {
            throw new AuthenticationError('Incorrect email or password');
          }
    
          const correctPassword = await user.isCorrectPassword(password);
    
          if (!correctPassword) {
            throw new AuthenticationError('Incorrect email or password');
          }
    
          const token = signToken(user);
          return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
          const user = await User.create({ username, email, password });
    
          if (!user) {
            throw new Error('Something went wrong with user creation');
          }
    
          const token = signToken(user);
          return { token, user };
        },
        saveBook: async (parent, { bookInput }, context) => {
          if (context.user) {
            const user = await User.findByIdAndUpdate(
              context.user._id,
              { $push: { savedBooks: bookInput } },
              { new: true }
            );
    
            return user;
          } else {
            throw new AuthenticationError('User not authenticated');
          }
        },
        removeBook: async (parent, { bookId }, context) => {
          if (context.user) {
            const user = await User.findByIdAndUpdate(
              context.user._id,
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            );
    
            return user;
          } else {
            throw new AuthenticationError('User not authenticated');
          }
        },
      },
};

module.exports = resolvers;