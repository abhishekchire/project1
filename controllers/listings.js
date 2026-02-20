const Listing=require('../models/listing');

module.exports.index=async (req, res) => {
    let alllistings = await Listing.find();
    res.render("listings/index.ejs", { alllistings });
}

//filters
module.exports.lowlistingfunk=async(req, res) => {
    let lowListing=await Listing.find().sort({price:1});
    res.render("filters/lowpriceListings.ejs",{lowListing});
};

module.exports.highlistingfunk=async(req, res) => {
    let highListing=await Listing.find().sort({price:-1});
    res.render("filters/highpriceListing.ejs",{highListing});
};

//new route
module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
};

//show route
module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

//creat route
module.exports.creatListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New listing created");
    res.redirect("/listings");
}

//edit route
module.exports.renderEdit=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    // let originalImageUrl=listing.image.url;
    // originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing});
};

//update route
module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect(`/listings`);
};