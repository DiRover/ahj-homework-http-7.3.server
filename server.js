
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


//посредник обработки options запроса
app.use(async (ctx, next) => {
    //проверяем, есть ли options запрос, если нет, то переходим к другому посреднику
    const origin = ctx.request.get('Origin');

    if (!origin) {
        return await next();
    };

    const headers = { 'Access-Control-Allow-Origin': '*' };

    //добавил чтобы сервер работал на herocu
    if (ctx.request.method === 'OPTIONS') {
        ctx.response.set({...headers});
    }

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
    console.log(reqType)
    //каталог файлов на всякий случай
    let catalog = fs.readdirSync(public).filter((o) => {
        if (o !== '.gitkeep') { //убираем .gitkeep из массива
            return o;
        }
    }); //fs.readdirSync возвращает массив имен файлов директории

    if (reqType === 'GET') {
        ctx.response.body = catalog; //отправляем на фронт
    }
    
  
    if (reqType === 'POST') {
        const { file } = ctx.request.files; //получаем сам файл
        const notes = file.path; //получаем путь файла
        const fileName = path.basename(notes); //получаем имя файла
        const img = { elem: fileName }; //отправляем объект для обработки json
        ctx.response.body = img; //отправляем на фронт
        return
    };

    if (reqType === 'DELETE') { 
        const { href } = ctx.request.URL;
        /*const { src } = ctx.request.body.id;
        const { id } = ctx.request.body;
        console.log(src);*/
        const fileName = path.basename(href); //получаем имя файла
        console.log(fileName);
        fs.unlinkSync(`${public}\\${fileName}`, (err) => { //удаляем файл в директории хранения
            if (err) throw err; //если не ок
            console.log('file was deleted'); //если ок
        });
        //получаем новый список файлов в папке хранения
        const fileList = fs.readdirSync(public).filter((o) => {
            if (o !== '.gitkeep') { //убираем .gitkeep из массива
                return o;
            }
        });
        const str = fileList.join();
        ctx.response.body = str; 
         
    }
  });


const server = http.createServer(app.callback()).listen(port);