const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemRouter = express.Router({mergeParams: true});

menuItemRouter.param(`menuItemId`, (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`, {$menuItemId: menuItemId}, (error, menuItem) => {
        if (error) {
            return next(error);
        }
        if (!menuItem) {
            res.sendStatus(404);
        } else {
            req.menuItem = menuItem;
            next();
        }
    });
});



menuItemRouter.get('/', ( req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE  menu_id = $menuId`, {$menuId: req.params.menuId}, (error, menuItems ) => {
        if (error) {
            return next(error);
        }
        res.status(200).json({menuItems: menuItems});
    })
});

menuItemRouter.post('/', (req ,res, next) => {
    //const name = req.body.enuItem.name;
    //const description = req.body.MenuItem.description;
    //const inventory = req.body.MenuItem.inventory;
   // const price = req.body.MenuItem.price;
    //const menuId = req.params.menuId;
    const newMenuItems = req.body.menuItem;
    const menuId = req.params.menuId;
    if ( !newMenuItems.name ||  !newMenuItems.inventory || !newMenuItems.price || !menuId ) {
        return res.sendStatus(400);
    }

 db.run(`INSERT INTO MenuItem ( name, description, inventory, price, menu_id) VALUES ($names, $description, $inventory, $price, $menuId)`, {
        $names: newMenuItems.name,       
        $description : newMenuItems.description,
        $inventory: newMenuItems.inventory,
        $price: newMenuItems.price,
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

 menuItemRouter.put('/:menuItemId', (req, res, next) => {
     const updatedMenuItems = req.body.menuItem;
     const menuId = req.params.menuId;
     if ( !updatedMenuItems.name || !updatedMenuItems.inventory || !updatedMenuItems.price ) {
         return res.sendStatus(400);
     }
   db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price , menu_id = $menuId WHERE id = $menuItemId`, {
       $name : updatedMenuItems.name,
       $description: updatedMenuItems.description,
       $inventory: updatedMenuItems.inventory,
       $price: updatedMenuItems.price,
       $menuId: req.params.menuId,
       $menuItemId :req.params.menuItemId
   }, function (error) {
        if (error) {
            return next(error);
        } else {
            db.get (`SELECT * FROM MenuItem WHERE id = $menuItemId`, {
                $menuItemId : req.params.menuItemId
            }, (error, menuItem) => {
                res.status(200).json({menuItem: menuItem});
            })
        }

   })
 })




 menuItemRouter.delete(`/:menuItemId`, (req, res, next) => {
     db.run(`DELETE FROM  MenuItem WHERE id = $menuItemId`, {$menuItemId: req.params.menuItemId},(error, menuItem) => {
         if (error) {
             next(error);
         } else {
             res.status(204).json({menuItem: menuItem});
         }
     })
 })

module.exports = menuItemRouter;