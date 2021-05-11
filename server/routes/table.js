const express = require('express');
const got = require('got');

const router = express.Router();

router.get('/', async (req, res) => {
    if (req.query.id == null) {
        const body = await got.get('http://localhost:3000/api/v1/cities');
        const data = JSON.parse(body.body);
        res.render('citiesTable', { title: 'Cities Table', list: data });
    }
});

module.exports = router;
