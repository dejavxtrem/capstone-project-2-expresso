const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemRouter = express.Router({mergeParams: true});


menuItemRouter.get('/', ( req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE  menu_id = $menuId`, {$menuId: req.params.menuId}, (error, menuItems ) => {
        if (error) {
            return next(error);
        }
        res.status(200).json({menuItems: menuItems});
    })
});

menuItemRouter.post('/', (req ,res, next) => {
    const name = req.body.MenuItem.name;
    //const description = req.body.MenuItem.description;
    const inventory = req.body.MenuItem.inventory;
    const price = req.body.MenuItem.price;
    const menuId = req.params.menuId;
    if ( !name || !description || !inventory || !price ) {
        return res.sendStatus(400);
    }
 db.run(`INSERT INTO MenuItem ( name, description, inventory, price, menu_id) VALUES ($names, $description, $inventory, $price, $menuId)`, {
        $names: name,       
        $description : description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    },  function (error, menuItem) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`, {$menuItemId : this.lastID}, (error, menuItem) => {
                 res.status(201).json({menuItem: menuItem});
            })
        }
    })
});

     



module.exports = menuItemRouter;