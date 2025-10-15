module.exports = {
  method: "GET",
  path: "/non-ai",
  handler: async (request, h) => {
    //placeholder for aws logging testing
    return h.response("Hello World").code(200);
  },
};