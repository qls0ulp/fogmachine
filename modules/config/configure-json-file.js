exports.setup = function (loadJson) {
  // TODO: Redo this with Joi
  var errorArray = [];

  if (loadJson.users && typeof loadJson.users !== 'object') {
    errorArray.push('Users need to be an object');
    loadJson.error = errorArray;
    return loadJson;
  }

  if (errorArray.length > 0) {
    loadJson.error = errorArray;
  }

  return loadJson;
}
