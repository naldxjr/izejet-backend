const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull
} = require("graphql");

const Catalogo = require("../models/Catalogo");

const CatalogoType = new GraphQLObjectType({
  name: "Catalogo",
  fields: () => ({
    id: { type: GraphQLID },
    produto: { type: GraphQLString },
    descricao: { type: GraphQLString },
    preco: { type: GraphQLFloat },
    imagem: { type: GraphQLString },
    local: { type: GraphQLString },
    tag: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    catalogos: {
      type: new GraphQLList(CatalogoType),
      resolve() {
        return Catalogo.find().sort({ produto: 1 });
      }
    },
    catalogo: {
      type: CatalogoType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Catalogo.findById(args.id);
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addCatalogo: {
      type: CatalogoType,
      args: {
        produto: { type: new GraphQLNonNull(GraphQLString) },
        descricao: { type: new GraphQLNonNull(GraphQLString) },
        preco: { type: new GraphQLNonNull(GraphQLFloat) },
        imagem: { type: new GraphQLNonNull(GraphQLString) },
        local: { type: GraphQLString },
        tag: { type: GraphQLString }
      },
      resolve(parent, args, context) {
        if (!context.user || context.user.cargo !== "admin") {
          throw new Error("Acesso negado. Autenticação administrativa requerida.");
        }

        const catalogo = new Catalogo({
          produto: String(args.produto).trim(),
          descricao: String(args.descricao).trim(),
          preco: Number(args.preco),
          imagem: String(args.imagem).trim(),
          local: args.local ? String(args.local).trim() : undefined,
          tag: args.tag ? String(args.tag).trim() : undefined
        });
        
        return catalogo.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});