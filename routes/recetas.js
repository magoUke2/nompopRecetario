const express = require('express');
const router=express.Router();

const pool = require('../database');
const { request } = require('express');

router.get('/add', async (req,res) =>{
    const links = await pool.query('SELECT * FROM materials');
    res.render('recetas/add',{links});
});


router.post('/add', async (req,res)=>{
    const {receta,descripcion,ingrediente,cantidad,obligatorio} =req.body;
    await pool.query('INSERT INTO recipes VALUES (null,?,?)',[receta,descripcion]);
    const recentID= await pool.query('SELECT MAX(recipe_id) as cnt FROM recipes')
    var reciente=recentID[0].cnt;
    contador=0;
    ingrediente.forEach(async function(thisIngredient,contador) {
        await pool.query('INSERT INTO jnc_recipematerial VALUES (null,?,?,?,?)',[thisIngredient,reciente,obligatorio[contador],cantidad[contador]]);
        contador=contador+1;
    });
    res.redirect('list')
});

router.get('/list', async (req,res)=>{
    const links = await pool.query('SELECT * FROM recipes');
    res.render('recetas/list',{links})
});


router.get('/profile/:id', async (req,res)=>{
    const{ id } =req.params;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    
    ingredients.forEach(async function(thisIngredient) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=Math.round(precioFinalTemp * 100) / 100
        finalPrice.push(precioFinalTemp);
        thisIngredient['precioFinal']=preciofinal;
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['porcentaje']=0;
    res.render('recetas/profile',{links: links[0],ingredients})
}); 

router.get('/edit/:id', async (req,res)=>{
    const{ id } =req.params;
    const links = await pool.query('SELECT * FROM materials');
    const recipes= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    res.render('recetas/edit',{recipes: recipes[0],ingredients,links})
}); 

router.post('/edit/:id', async (req,res)=>{
    const { id } =req.params;
    const { receta,descripcion,ingrediente,cantidad,obligatorio } =req.body;
    
    await pool.query('UPDATE recipes SET recipename=?,description=? WHERE recipe_id = ?',[receta,descripcion,id]);

    await pool.query('DELETE FROM jnc_recipematerial WHERE recipe_idFK = ?',[id]);

    contador=0;
    ingrediente.forEach(async function(thisIngredient,contador) {
        await pool.query('INSERT INTO jnc_recipematerial VALUES (null,?,?,?,?)',[thisIngredient,id,obligatorio[contador],cantidad[contador]]);
        contador=contador+1;
    });

    req.flash('success','Receta editada exitosamente');
    res.redirect('/recetas/list');
});

router.get('/delete', async (req,res)=>{
    const links = await pool.query('SELECT * FROM recipes');
    res.render('recetas/delete',{links})
});

router.get('/delete/:id', async (req,res) => {
    const {id} = req.params;
    await pool.query('DELETE FROM jnc_recipematerial WHERE recipe_idFK = ?', [id]);
    await pool.query('DELETE FROM recipes WHERE recipe_id = ?', [id]);
    req.flash('success','Material borrado exitosamente');
    res.redirect('/recetas/list');
});


router.post('/duplicar/:id', async (req,res)=>{
    const{ id } =req.params;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    
    ingredients.forEach(async function(thisIngredient) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=(Math.round(precioFinalTemp * 100) / 100)*2
        finalPrice.push(preciofinal);
        thisIngredient['precioFinal']=preciofinal; 
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['porcentaje']=0;
    res.render('recetas/duplicar',{links: links[0],ingredients})
}); 

router.post('/mitad/:id', async (req,res)=>{
    const{ id } =req.params;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    
    ingredients.forEach(async function(thisIngredient) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=(Math.round(precioFinalTemp * 100) / 100)/2
        finalPrice.push(preciofinal);
        thisIngredient['precioFinal']=preciofinal; 
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['porcentaje']=0;
    res.render('recetas/mitad',{links: links[0],ingredients})
}); 

router.post('/ganancia/:id', async (req,res)=>{
    const{ id } =req.params;
    const { ganancia,ingredienteObligatorio } =req.body;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    
    contador=0;
    ingredients.forEach(async function(thisIngredient,contador) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=(Math.round(precioFinalTemp * 100) / 100)
        if (ingredienteObligatorio[contador] == '1') {
            
            finalPrice.push(preciofinal);
            thisIngredient['precioFinal']=preciofinal; 
          } else {
            finalPrice.push(0);
            thisIngredient['precioFinal']='No incluido'; 
          }
        contador=contador+1;
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['estaGanancia']=ganancia;
    links[0]['porcentaje']=((ganancia/100)*sum)+sum;
    res.render('recetas/profile',{links: links[0],ingredients})
}); 

router.post('/dganancia/:id', async (req,res)=>{
    const{ id } =req.params;
    const { ganancia,ingredienteObligatorio } =req.body;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    contador=0;
    ingredients.forEach(async function(thisIngredient,contador) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=(Math.round(precioFinalTemp * 100) / 100)*2
        if (ingredienteObligatorio[contador] == '1') {
            
            finalPrice.push(preciofinal);
            thisIngredient['precioFinal']=preciofinal; 
          } else {
            finalPrice.push(0);
            thisIngredient['precioFinal']='No incluido'; 
          }
        contador=contador+1;
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['estaGanancia']=ganancia;
    links[0]['porcentaje']=((ganancia/100)*sum)+sum;
    res.render('recetas/duplicar',{links: links[0],ingredients})
}); 

router.post('/mganancia/:id', async (req,res)=>{
    const{ id } =req.params;
    const { ganancia,ingredienteObligatorio } =req.body;
    const links= await pool.query('SELECT * FROM recipes WHERE recipe_id = ?',[id])
    const ingredients=await pool.query('SELECT materials.id,materials.medida,ingrediente,jnc_recipematerial.cantidad,jnc_recipematerial.Opcional,precio as precioTotal,materials.cantidad as cantidadTotal FROM jnc_recipematerial JOIN materials ON materials.id = jnc_recipematerial.material_idFK JOIN recipes ON recipes.recipe_id = jnc_recipematerial.recipe_idFK Where recipes.recipe_id=?',[id]);
    const finalPrice=[];
    contador=0;
    ingredients.forEach(async function(thisIngredient,contador) {
        var precioFinalTemp=(thisIngredient.precioTotal/thisIngredient.cantidadTotal)*thisIngredient.cantidad;
        var preciofinal=(Math.round(precioFinalTemp * 100) / 100)/2
        if (ingredienteObligatorio[contador] == '1') {
            
            finalPrice.push(preciofinal);
            thisIngredient['precioFinal']=preciofinal; 
          } else {
            finalPrice.push(0);
            thisIngredient['precioFinal']='No incluido'; 
          }
        contador=contador+1;
    });

    var sum = finalPrice.reduce(function(a, b){
        return a + b;
    }, 0);
    sum=Math.round(sum * 100) / 100
    links[0]['sumatoria']=sum;
    links[0]['estaGanancia']=ganancia;
    links[0]['porcentaje']=((ganancia/100)*sum)+sum;
    res.render('recetas/mitad',{links: links[0],ingredients})
}); 



  
module.exports = router;