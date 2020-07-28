const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const path = require('path'); 
const session = require('express-session');
const flash = require('connect-flash');
const mysqlStore = require('express-mysql-session');
const {database} = require('./keys');
//inicializaciones

const app=express();

//configuraciones
app.set('port',process.env.PORT || 4000);
app.set('views',path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
    dafultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    recipesDir: path.join(app.get('views'), 'recetas'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')

}));
app.set('view engine', '.hbs');

//MIDDLEWARES
app.use(session({ 
    secret: 'nompopSession',
    resave: false,
    saveUninitialized:false,
    store: new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//global variables
app.use((req,res,next) =>{
    app.locals.success = req.flash('success');
    next();
})

//routes
app.use(require('./routes/index.js'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links'));
app.use('/recetas',require('./routes/recetas.js'));

//Public
app.use(express.static(path.join(__dirname,'public')));

//start server
app.listen(app.get('port'), () =>{
    console.log('server on port ',app.get('port'));
});
 