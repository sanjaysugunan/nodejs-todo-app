//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect('mongodb://0.0.0.0:27017/todolistDB');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema ={
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});
const item2 = new Item({
  name: "Hit the + button to Add Item"
});
const item3 = new Item({
  name: "<-- Hit this to delete Item"
});

const defaultItems =[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
  Item.find({}).then((foundItems)=>{
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(()=>{
        console.log("default items added");
      });
      res.redirect("/");
    }else{
      const day = date.getDate();

      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  })



});

app.post("/", function(req, res){

  const newtem = new Item({
    name: req.body.newItem
  });
  
  
  const listName = req.body.list;
  const day = date.getDate();

  if (listName === day) {
    newtem.save();
    console.log("new Item added");
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundList)=>{
       foundList.items.push(newtem);
       foundList.save();
       res.redirect("/"+listName);
    });
  }
});


app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;
  const day = date.getDate();
  if(listName===day){
  Item.findByIdAndRemove({_id: checkedItem}).then(()=>{
    console.log("checked item deleted");
  });
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItem}}}).then(()=>{
      res.redirect("/"+listName);
    })
  }
});


app.get("/:customListName", function(req,res){
  const customName = _.capitalize(req.params.customListName);
  List.findOne({name: customName}).then((foundList)=>{
    if(!foundList){
      const list = new List({
        name: customName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customName);
    }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  });
  

});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
