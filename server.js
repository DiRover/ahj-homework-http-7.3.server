
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const app = new Koa();
const port = process.env.PORT || 7070;
const public = path.join(__dirname, '/public');


app.use(koaBody({
    formidable:{uploadDir: public, //директория хранения файлов
                keepExtensions: true //сохраняем разрешение файла
    }, 
    urlencoded: true,
    multipart: true,
}));

//эта штука не работает
app.use(koaStatic(public));
//каталог файлов на всякий случай
let catalog = fs.readdirSync(public); //fs.readdirSync возвращает массив имен файлов директории

//посредник обработки options запроса
app.use(async (ctx, next) => {
    //проверяем, есть ли options запрос, если нет, то переходим к другому посреднику
    const origin = ctx.request.get('Origin');

    if (!origin) {
        return await next();
    };

    const headers = { 'Access-Control-Allow-Origin': '*' };

    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    };

    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
    };

    ctx.response.status = 204; // No content

    };
});

app.use(async (ctx) => { 
    const reqType = ctx.request.method; //получаем метод хапроса
    
  
    if (reqType === 'POST') {
        const { file } = ctx.request.files; //получаем сам файл
        const notes = file.path; //получаем путь файла
        const fileName = path.basename(notes); //получаем имя файла
        const img = { elem: fileName };
        ctx.response.body = img; //отправляем на фронт
        return
    };

    if (reqType === 'PATCH') { //метод DELETE не работает 
        const { src } = ctx.request.body;
        const fileName = path.basename(src); //получаем имя файла
        console.log(fileName);
        fs.unlink(`${public}\\${fileName}`, (err) => { //удаляем файл в директории хранения
            if (err) throw err; //если не ок
            console.log('file was deleted'); //если ок
          });
    }
  });


const server = http.createServer(app.callback()).listen(port);