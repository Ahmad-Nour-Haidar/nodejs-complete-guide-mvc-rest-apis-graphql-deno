const path = require('path');
const fs = require('fs');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    const exists = fs.existsSync(filePath);
    console.log('exists = ', exists);
    if (exists) {
        fs.unlink(filePath, err => console.log(err));
    }
};

exports.clearImage = clearImage;