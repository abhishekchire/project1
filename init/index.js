const mongoose=require('mongoose');
const initdata=require('./data.js');
const Listing=require('../models/listing.js');
const { MONGO_URL } = require('../config');

main().then(()=>{
    console.log('connected to db');
    
}).catch((err)=>{
    console.log(err);
    
});
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB=async ()=>{
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:'6982031b1b5d31831a4a5719'}));
   await Listing.insertMany(initdata.data);
   console.log("data wae saved");
};
initDB();