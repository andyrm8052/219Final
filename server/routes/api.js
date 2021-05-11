const express = require('express');
const mysql = require('../config/db.config');
const router = express.Router();


router.get("/cities", (req, res) => {
    const db = "SELECT * FROM tblCitiesImport";
    mysql.query(db, (err, data) => {
        if (err) throw err;
        res.json(data);
    });
});

router.post("/addNew", (req, res) => {
    const db = "INSERT INTO tblCitiesImport (id, fldName, fldLat, fldLong, fldCountry, fldAbbreviation, fldCapitalStatus, fldPopulation) VALUES (?)";
    const val = [
        req.body.id,
        req.body.fldName,
        req.body.fldLat,
        req.body.fldLong,
        req.body.fldCountry,
        req.body.fldAbbreviation,
        req.body.fldCapitalStatus,
        req.body.fldPopulation,
    ];
    mysql.query(db, [val], (err) => {
        if (err) throw err;
        const alert = require('alert');
        alert("City Added Successfully!");
        res.statusCode = 302;
        res.setHeader("Location", "http://localhost:3000/citiesTable");
        res.end();
    });
});

router.put("/edit/:id", (req, res) => {
    const val = [
        req.body.id,
        req.body.fldName,
        req.body.fldLat,
        req.body.fldLong,
        req.body.fldCountry,
        req.body.fldAbbreviation,
        req.body.fldCapitalStatus,
        req.body.fldPopulation,
    ];
    const db = "UPDATE tblCitiesImport SET id=?, fldName=?, fldLat=?, fldLong=?, fldCountry=?, fldAbbreviation=?, fldCapitalStatus=?, fldPopulation=? WHERE id=?";
    mysql.query(db, [val[0], val[1], val[2], val[3], val[4], val[5], val[6], val[7], req.params.id], (err) => {
        if (err) throw err;
        const alert = require('alert');
        alert("City Edited Successfully!");
        res.statusCode = 302;
        res.setHeader("Location", "http://localhost:3000/citiesTable");
        res.end();
    });
});

router.post("/edit/:id", (req, res) => {
    const val = [
        req.body.id,
        req.body.fldName,
        req.body.fldLat,
        req.body.fldLong,
        req.body.fldCountry,
        req.body.fldAbbreviation,
        req.body.fldCapitalStatus,
        req.body.fldPopulation,
    ];
    const db = "UPDATE tblCitiesImport SET id=?, fldName=?, fldLat=?, fldLong=?, fldCountry=?, fldAbbreviation=?, fldCapitalStatus=?, fldPopulation=? WHERE id=?";
    mysql.query(db, [val[0], val[1], val[2], val[3], val[4], val[5], val[6], val[7], req.params.id], (err) => {
        if (err) throw err;
        const alert = require('alert');
        alert("City Edited Successfully!");
        res.statusCode = 302;
        res.redirect('http://localhost:3000/citiesTable');
        res.end();
    });
});

router.get('/delete/:id', (req, res) => {
    const sql = "DELETE FROM tblCitiesImport WHERE id=?";
    mysql.query(sql, req.params.id, (err) => {
        if (err) throw err;
        const alert = require('alert');
        alert("City Deleted Successfully!");
        res.statusCode = 302;
        res.redirect('http://localhost:3000/citiesTable');
        res.end();
    });
});


module.exports = router;
