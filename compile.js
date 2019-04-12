const { compile } = require('@waves/ride-js');

const cmpl = (code) => {
  const r = compile(code);

  if (r.error) {
    throw new Error(r.error);
  }

  return r.result.base64;
}

module.exports = cmpl

