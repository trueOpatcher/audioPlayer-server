const express = require('express');
const multer = require('multer');
const mm = require('music-metadata');

const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Mp3 = require('../models/mp3');
const Img = require('../models/img');


const Readable = require('stream').Readable;


exports.download_img = (req, res) => {
    const db = mongoose.connection.db;
    const imageID = new mongoose.Types.ObjectId(req.query.id);



    db.collection('images').findOne({ '_id': imageID }).then(imgDoc => {
        const contentType = imgDoc.image.contentType;
    
        const buffer = imgDoc.image.data.toString('base64');
        const buff = Buffer.from(buffer, 'base64');

        res.setHeader('content-type', contentType);
        
        res.send(buff);

        

    }).catch(error => {
        console.log(error);
    })
}

exports.download_mp3 = (req, res) => {

    const db = mongoose.connection.db;
    const trackName = req.query.trackName;

    





    let bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'tracks',
        chunkSizeBytes: 255

    });
    
    db.collection('sharedmp3').findOne({ 'trackName': trackName }).then(fileDoc => {
        const fileID = fileDoc.trackID;

        db.collection('tracks.files').findOne({ '_id': fileID }).then(trackData => {
            const trackLength = trackData.length;

            // if (range !== undefined) {
            //     const readableRange = range.replace(/bytes=/, '').split('-');
        
            //     const start_range = readableRange[0];
            //     const end_range = readableRange[1];
        
            //     if((!start_range && start_range.length > 1) || (!end_range && end_range.length > 1)) {
            //         return res.status(500);
            //     }
            
        
            //     const start = parseInt( start_range, 10);
            //     const end = end_range ? parseInt(end_range, 10) : trackLength;

            //     const content_length = (end - start);
            //     console.log(content_length);
            //     console.log(trackLength);
            //     console.log(start + '  ' + end);

            //     res.setHeader("content-length", content_length);
            //     res.setHeader("content-type", "audio/mp3");
            //     res.setHeader('content-range', 'bytes ' + start + '-' + end + '/' + trackLength);
            //     res.setHeader("accept-ranges", "bytes");


            // let downloadStream = bucket.openDownloadStream(fileID, {start: start, end: end});
            // downloadStream.pipe(res);

            // downloadStream.on('error', error => {
            //     console.log(error);
            // });

            // downloadStream.on('end', () => {
            //     res.end();
                
            // });
        // } 
        

            res.setHeader("content-length", trackLength);
            res.setHeader("content-type", "audio/mp3");
            res.setHeader("accept-ranges", "bytes");


            let downloadStream = bucket.openDownloadStream(fileID);
            downloadStream.pipe(res);

            // downloadStream.on("data", (chunk) => {
            //     res.write(chunk);
            //   });
        
            //   downloadStream.on("error", (err) => {
            //     res.sendStatus(404);
            //   });
        
            //   downloadStream.on("end", () => {
            //     res.end();
            //   });

            downloadStream.on('error', error => {
                console.log(error);
            });

            downloadStream.on('end', () => {
                res.end();
                
            });

        }).catch(error => {
            res.status(400).send(error);
        })



    }).catch(error => {
        res.status(400).send(error);
    })

    // bucket.find({ 'trackName': trackName }).toArray().then(
    //     filesData => {
    //         console.log('fileData', filesData);
    //     }
    // ).then(trackData => {




    // }).then(() => {
    //     let downloadStream = bucket.openDownloadStream(trackID);
    //     downloadStream.pipe(res);

    //     downloadStream.on('end', () => {
    //         res.end();

    //     });
    // }).catch(error => {
    //     console.log(error);
    // });















};


exports.upload_mp3 = (req, res, next) => {
    const db = mongoose.connection.db;
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage, limits: { fields: 4, fileSize: 12000000, files: 1, parts: 5 } });
    upload.single('track')
        (req, res, (err) => {

            if (err) {
                return res.status(400).send({ message: "Upload Request Validation Failed" });
            } else if (!req.body.name) {
                return res.status(400).send({ message: "No track name in request body" });
            }
            else if (!req.session.userName) {
                return res.status(400).send({ message: "User is not authenticated" });
            }

            const trackName = req.file.originalname;
            const buffer = req.file.buffer;




            const readableTrackStream = new Readable();
            readableTrackStream.push(req.file.buffer);
            readableTrackStream.push(null);



            const bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'tracks'
            });

            const uploadStream = bucket.openUploadStream(trackName);



            readableTrackStream.pipe(uploadStream);

            const userName = req.session.userName;
            const trackID = uploadStream.id;

            uploadStream.on('pipe', () => {
                console.log('pipe');
            })
            uploadStream.on('data', () => {
                console.log('downloading');
            });

            uploadStream.on('error', () => {
                return res.status(500).json({ message: "Error uploading file" });
            });

            uploadStream.on('finish', () => {
                console.log('done');

                mm.parseBuffer(buffer, 'audio/mpeg').then(metadata => {

                    const title = metadata.common.title;
                    const artist = metadata.common.artist;
                    const album = metadata.common.album;
                    const genre = metadata.common.genre;
                    const year = metadata.common.year;
                    const format = metadata.format.bitrate;

                    const cover = mm.selectCover(metadata.common.picture);


                    const saveImageIfExists = new Promise((resolve, reject) => {
                        if (cover) {
                            console.log(cover);
                            const imageDescription = cover.description;
                            const data = cover.data;
                            const contentType = cover.format;

                            const image = {
                                description: imageDescription,
                                data: data,
                                contentType: contentType
                            };

                            imageModel = new Img({
                                image: image
                            });
                            imageModel.save().then(imageData => {
                                console.log('image is saved');
                                console.log('imageData', imageData._id);
                                resolve(imageData._id);
                            });
                        } else {
                            resolve(null);
                        }
                    })

                    saveImageIfExists.then(imageData => {
                        let imageID;
                        if(imageData) {
                            imageID = imageData.toString();
                            console.log(imageID);
                        } else {
                            imageID = null;
                        }

                        userPlaylist = new Mp3({
                            trackName: trackName,
                            title: title,
                            artist: artist,
                            album: album,
                            genre: genre,
                            year: year,
                            userName: userName,
                            trackID: trackID,
                            format: format,
                            imageID: imageID
                        });
                        userPlaylist.save().then(() => {
                            console.log('track is saved in db');
    
                        })
                    })







                    







                }).catch(error => console.log(error));




                return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + trackID });

            });





        });


};

exports.delete_mp3 = (req, res, next) => {
    const db = mongoose.connection.db;

    let bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'tracks'

    });



    if (!req.session.userName) {
        return res.status(400).send({ message: 'User is not authenticated' });
    }
    const sessionUser = req.session.userName;
    const id = req.query.id;
    const fileID = mongoose.Types.ObjectId(id);

    db.collection('sharedmp3').findOne({ 'trackID': fileID }).then(fileDoc => {

        if (fileDoc.userName != sessionUser) {
            return res.status(400).send({ message: 'invalid user' });
        }

        if(fileDoc.imageID) {
            const imageID = mongoose.Types.ObjectId(fileDoc.imageID);

            db.collection('images').deleteOne({ '_id': imageID }).then().catch(error => console.log(error));
        }

        bucket.delete(fileID).then(() => {

            db.collection('sharedmp3').deleteOne({ 'trackID': fileID }).then(() => {
                res.status(200).send({ message: 'deleted' });

            }).catch(error => {
                return res.status(400).send({ message: 'error delete fileDoc' });
            })


        }).catch(error => {
            return res.status(400).send({ message: 'error delete file in GridFS' });
        })

    }).catch(() => {
        return res.status(400).send({ message: 'error find file in Shared Storage' });
    })



    // db.collection('sharedStorage').findOne({})
}

