const sanitizeHtml = require('sanitize-html');

const sanitizers = (req, res, next) => {
  if (req.method == "GET") {        
    //const properties = ['query', 'params', 'body'];
    const properties = ["query", "params"];
    properties.forEach((prop) => {
      if (req[prop]) {
        Object.keys(req[prop]).forEach((key) => {
          req[prop][key] = sanitizeHtml(req[prop][key]).trim();          
        });
      }
    });
  }
  next();
};

module.exports = sanitizers;
