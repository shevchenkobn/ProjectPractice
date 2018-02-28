import Hapi from "hapi";

const server = new Hapi.Server({
  port: 3000,
  host: "127.0.0.1"
});
server.start().then(() => {
  console.log(server.info.uri);
});
server.route({
  method: 'GET',
  path: '/{name}',
  handler: (request, reply) => {
    reply.response(`Hello, ${encodeURIComponent(request.params.name)}`);
  }
});