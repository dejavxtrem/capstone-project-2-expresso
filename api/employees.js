const express = require("express");
const employeeRouter = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const timeSheetRouter = require("./timesheets.js");

employeeRouter.use('/:employeeId/timesheets', timeSheetRouter);



employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id = $employeeId`,{
        $employeeId: employeeId
    }, (error, employee) => {
        if (error) {
            return next(error);
        }
        if (!employee) {
            return res.sendStatus(404);
            
        }
        req.employee = employee;
        next();
    })
})


employeeRouter.get('/:employeeId', (req, res, next) => {
       res.status(200).json({employee: req.employee});
})




employeeRouter.get(`/`, (req, res, next) => {
    db.all(`SELECT * FROM  Employee WHERE is_current_employee = 1`, (error, employees) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({employees: employees});
        }
    })
});




employeeRouter.post('/', (req , res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO Employee (name, position, wage ) VALUES ( $name, $position, $wage)`,{
           $name : name,
           $position: position,
           $wage: wage
    },  function (error) {
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) => {
                return res.status(201).json({employee: employee});
            });
        }
    })
})



employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    if(!name || !position|| !wage) {
        return res.sendStatus(400);
    }

    db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $employeeId`, {
        $name :name,
        $position : position,
        $wage:  wage,
        $employeeId: req.params.employeeId
    }, function (error, employee) {
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE  id = ${req.params.employeeId}`, (error, employee) => {
                res.status(200).json({employee: employee});
            })
        }
    })
})


employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 `, (error, employee) => {
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
                if (error) {
                    return next(error);
                }
                if (!employee) {
                    res.sendStatus(404);
                }
                res.status(200).json({employee: employee});
            })
        }
    })
})



module.exports = employeeRouter;