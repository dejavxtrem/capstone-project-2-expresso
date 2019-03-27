const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timeSheetRouter = express.Router({mergeParams: true});

timeSheetRouter.param('timesheetId', ( req, res, next, timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE id = $timesheetId `, {$timesheetId : timesheetId}, (error, timesheet) => {
        if (error) {
            return next(error);
        } 
        if (!timesheet) {
            res.sendStatus(404);
            
        } else  {
        req.timesheet = timesheet;
        next();
        }
        
    })
})



timeSheetRouter.get('/', ( req, res, next) => { 
    db.all(`SELECT * FROM Timesheet WHERE  employee_id = $employeeId`, { $employeeId: req.params.employeeId},  (error, timesheets) => {
        if(error) {
            return next(error);
        } 
       res.status(200).json({timesheets: timesheets});
    
    });
});



timeSheetRouter.post(`/`, (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date ) {
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO Timesheet (hours,  rate , date ,  employee_id) VALUES ( $hours, $rate, $date, $employeeId)`, {
        $hours : hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    }, function (error, timesheets) {
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) => {
                res.status(201).json({timesheet: timesheet});
            })
        }
    })
});

timeSheetRouter.put(`/:timesheetId`, (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date ) {
        return res.sendStatus(400);
    }
    db.run(`UPDATE Timesheet SET hours = $hour, rate = $rate, date =$date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId `, {
        $hour: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId:req.params.timesheetId
    },  function  (error, timesheet){
        if (error) {
            return next(error);
        } else {
            db.get(`SELECT * FROM  Timesheet WHERE timesheet.id = ${req.params.timesheetId}`, ( error, timesheet) => {
                res.status(200).json({timesheet: timesheet});
            })
        }
    })
})


timeSheetRouter.delete(`/:timesheetId`, (req, res, next) => {
    db.run(`DELETE FROM  Timesheet WHERE TImesheet.id = $timesheetId `, { $timesheetId : req.params.timesheetId}, (error, timesheet) => {
        if (error) {
            return next(error)
        }  else {
            res.sendStatus(204);
        }
    })
})





module.exports = timeSheetRouter;



