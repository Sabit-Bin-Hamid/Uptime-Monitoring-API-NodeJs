// dependencies
const fs = require('fs');
const path = require('path');


// lib module scaffold
const lib={} 


// get base directory
lib.basedir = path.join(__dirname, '/../.data/')

// write to file
lib.create = (dir, file, data, callback) => {
     fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err,filedescriptor) => {
          if (!err && filedescriptor) {
               // convert data to string
               let stringData = JSON.stringify(data);
               fs.writeFile(filedescriptor, stringData, (err) => {
                    if (!err) {
                         fs.close(filedescriptor, (err) => {
                              if (!err) {
                                   callback(false);
                              }else{callback('Error to close file!')}
                         })
                    }else{callback('Error to write file!')}
               })
          }else{callback('Error to open file! File may already exist.')}
     })
};

// read file
lib.read = (dir, file, callback) => {
     fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
          callback(err, data);;
     })
};

//update existing file
lib.update = (dir, file, data, callback) => {
     fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, filedescriptor) => {
          if (!err && filedescriptor) {
               // convert data to string
               const stringData = JSON.stringify(data);
               // ftruncate the file
               fs.ftruncate(filedescriptor, (err) => {
                    if (!err) {
                         // write the file and close it
                         fs.writeFile(filedescriptor, stringData, (err) => {
                              if (!err) {
                                   fs.close(filedescriptor, (err) => {
                                        if (!err) {
                                             callback(false);
                                        } else { callback('Error to close file!') }
                                   })
                              } else { callback('Error to write file!') }
                         })
                    } else { callback('Error to truncate the file ') }
               })
          } else { callback('Error to update! File may not exist.') }
     })
};

// delete existing file
lib.delete = (dir, file, callback) => {
     fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
          if (!err) {
               callback(false);
          }else{callback('Error deleting file!')}
     })
}

lib.list = (dir,callback) => {
     fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
          if (!err && fileNames && fileNames.length > 0) {
               let trimmedFileNames = [];
               fileNames.forEach((fileName) => {
                    trimmedFileNames.push(fileName.replace('.json', ""))
               });
               callback(false, trimmedFileNames);
          } else { callback('Directory Not Found!'); }
     })
};

// export module
module.exports = lib;