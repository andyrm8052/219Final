const express = require('express');
const got = require('got');
const router = express.Router();

router.get('/', async (req, res) => {
    if (req.query.id == null) {
        res.render('add', { title: 'Add City' });
    }
    else {
        const body = await got.get(`http://localhost:3000/api/v1/cities?id=${req.query.id}`);
        const data = JSON.parse(body.body);
        res.render('edit', { title: 'Edit City', cities: data });
    }
});

module.exports = router;
