const bodyParser = require("body-parser");
const express=require("express");
const mongoose=require("mongoose");


const app=express();
//set ejs
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});

const itemsSchema=mongoose.Schema({
  name:String,
});

const Item=mongoose.model("Item",itemsSchema);


const i1=new Item({
   name:"Internship"
});

const i2=new Item({
   name:"Computer Problem"
}); 

const i3=new Item({
   name:"abhoshek"
});

const defaultItems=[i1,i2,i3];

const listSchema={
  name:String,
  items:[itemsSchema]

};

const List =mongoose.model("List",listSchema);


app.get("/",function(req,res)
{
  
  Item.find({}, function(err,items)
  {
    res.render("list",{listTitle:"Today",newitems:items});
  });
   
  
  
});

app.post("/",function(req,res)
{
   const itemname =req.body.newItem;
   const listName=req.body.list;

   const item=new Item({
    name:itemname
  });


   if(listName==="Today")
   {

    item.save();
 
    res.redirect("/");
 
   }
   else{
     List.findOne({name:listName},function(err,foundlist)
     {
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
     });
   }

   

});

app.post("/delete",function(req,res)
{
  const checkid=req.body.checkbox;
  const listname=req.body.listname;

  if(listname === "Today")
  {
    Item.findByIdAndRemove(checkid,function(err)
    {
         if(!err)
         {
           console.log("removed task");
         }
    });
  
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkid}}},function(err,foundlist)
    {
       if(!err)
       {
         res.redirect("/"+listname);
       }
    });
  }
  
  
});


app.get("/:customListName",function(req,res)
{
  const customListName=req.params.customListName;

  List.findOne({name:customListName},function(err,foundlist)
  {
      if(!err)
      {
        if(!foundlist)
        {
          const list=new List({
            name:customListName,
            items:defaultItems
          })
        
          list.save();
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle:foundlist.name,newitems:foundlist.items})
        }
      }
  });
  
 

});



app.get("/about",function(req,res){

  res.render("about");
});

app.listen(3000,function()
{
  console.log("Server is running");
});