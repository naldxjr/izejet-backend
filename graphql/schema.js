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
        preco: { type: GraphQLFloat }
    })
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        catalogos: {
            type: new GraphQLList(CatalogoType),
            resolve() {
                return Catalogo.find();
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
                preco: { type: new GraphQLNonNull(GraphQLFloat) }
            },
            resolve(parent, args) {
                const catalogo = new Catalogo({
                    produto: args.produto,
                    descricao: args.descricao,
                    preco: args.preco
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