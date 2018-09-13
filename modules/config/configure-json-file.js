exports.setup = function (loadJson) {
  // TODO: Redo this with Joi
  var errorArray = [];

  // Check for port
  if (!loadJson.port) {
    loadJson.port = 3000;
  }

  // Check for UI
  if (!loadJson.userinterface) {
    loadJson.userinterface = 'public';
  }

  if (!loadJson.database) {
    loadJson.database = fog.db;
  }

  if (!loadJson.media) {
    loadJson.media = process.cwd();
  }

  if (loadJson.users && typeof loadJson.users !== 'object') {
    errorArray.push('Users need to be an object');
    loadJson.error = errorArray;
    return loadJson;
  }

  if (errorArray.length > 0) {
    loadJson.error = errorArray;
  }

  // Export JSON
  return loadJson;
}
