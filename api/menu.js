const express = require("express");
const menuRouter = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemRouter = require("./menuitems.js");

menuRouter.use('/:menuId/menu-items', menuItemRouter);


menuRouter.param(`menuId`, ( req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu WHERE menu.id = $menuId`, {$menuId:menuId},(error, menu) => {
        if(error) {
            return next(error);
        }
        if(!menu) {
            return res.sendStatus(404);
        } else {
            req.menu = menu;
            next();
        }
    })
})




menuRouter.get ('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
})






menuRouter.get ('/', (req, res, next) => {
    db.all (`SELECT * FROM Menu `, (error, menus) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({menus: menus});
        }
    })
});


menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, { $title: title}, function (error) {
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE menu.id = ${this.lastID}`, (error,menu) => {
                return res.status(201).json({menu: menu});
            });
        }
    })
})



menuRouter.put(`/:menuId`, (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    db.run(`UPDATE Menu SET  title = $title WHERE menu.id = $menuId`, { 
        $title: title,
        $menuId: req.params.menuId
    }, function (error, menu) {
        if (error) {
            return next(error)
        } else {
            db.get(`SELECT * FROM Menu WHERE menu.id = ${req.params.menuId}`,(error, menu) => {
                return res.status(200).json({menu: menu});
            })
        }
    })
})




menuRouter.delete(`/:menuId`, (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE menu_id = $menuId`, {$menuId: req.params.menuId}, ( error, menuItems)=> {
        if (error) {
            return next(error);
        }
        if (menuItems) {
            return res.sendStatus(400);
        }
        res.sendStatus(204);
    }) 
   
})

module.exports = menuRouter;