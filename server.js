const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const app = new Koa();
const port = process.env.PORT || 7070;
const public = path.join(__dirname, '/public')
const arr = [];

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

app.use(koaStatic(public));


//посредник обработки options запроса
app.use(async (ctx, next) => {
    //проверяем, есть ли options запрос, если нет, то переходим к другому посреднику
    const origin = ctx.request.get('Origin');

    if (!origin) {
        return await next();
    };

    const headers = { 'Access-Control-Allow-Origin': '*' };

    if (ctx.request.method !== 'OPTIONS') {
        //ctx.response.body = '';
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
    const { method } = ctx.request.query;
    const reqType = ctx.request.method;
  
    if (reqType === 'POST') {
      ctx.response.body = ctx.request.body;
      console.log(ctx.request.files);
      console.log(ctx.response.body);
      return
    }

    /*if (reqType === 'GET') {
      ctx.response.body = {name: 'ok'};
      console.log(ctx.request.body);
      console.log(ctx.response.body);
      return
    }*/

  });
  

const server = http.createServer(app.callback()).listen(port);