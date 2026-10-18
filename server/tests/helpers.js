// Captures the same status and JSON methods used by Express controllers.
function createResponse() {
  return { statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

export { createResponse };
