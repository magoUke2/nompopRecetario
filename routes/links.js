const express = require('express');
const router=express.Router();

const pool = require('../database');
const { request } = require('express');

router.get('/add',(req,res) =>{
    res.render('links/add');
});

router.post('/add', async (req,res)=>{
    const {ingrediente,medida,cantidad,precio} =req.body;
    const newLink ={
        ingrediente,
        medida,
        cantidad,
        precio
    };
    await pool.query('INSERT INTO materials set ?',[newLink]);
    req.flash('success','Agregado exitosamente');
    res.redirect('/links');
});

router.get('/', async (req,res)=>{
    const links = await pool.query('SELECT * FROM materials');
    res.render('links/list',{links})
});

router.get('/delete', async (req,res)=>{
    const links = await pool.query('SELECT * FROM materials');
    res.render('links/delete',{links})
});

router.get('/edit/:id', async (req,res)=>{
    const{ id } =req.params;
    const links= await pool.query('SELECT * FROM materials WHERE id = ?',[id])
    res.render('links/edit',{links: links[0]})
}); 

router.post('/edit/:id', async (req,res)=>{
    const { id } =req.params;
    const { ingrediente,medida,cantidad,precio } =req.body;
    const newLink ={
        ingrediente, 
        medida,
        cantidad,
        precio
    }
    await pool.query('UPDATE materials set ? WHERE id = ?',[newLink,id]);
    req.flash('success','Material editado exitosamente');
    res.redirect('/links');
});

router.get('/delete/:id', async (req,res) => {
    const {id} = req.params;
    await pool.query('DELETE FROM materials where id = ?', [id]);
    req.flash('success','Material borrado exitosamente');
    res.redirect('/links/delete');
});
  

module.exports = router;