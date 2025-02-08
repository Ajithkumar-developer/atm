const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function serveFile(filePath, type, res){
    fs.readFile(filePath, 'utf-8', (err, data)=>{
        if(err){
            res.statusCode = 400;
            res.setHeader('content-type', 'text/plain');
            res.end("Error loading file");
        }else{
            res.statusCode = 200;
            res.setHeader('content-type', type);
            res.end(data);
        }
    });
}

const server = http.createServer((req, res)=>{
    console.log(req.url);
    if(req.method==='GET'){
        switch(req.url){
            case '/':
                serveFile('front end/index.html', 'text/html',  res);
                break;
            case '/styles.css':
                serveFile('front end/styles.css', 'text/css',  res);
                break;
            case '/register':
                serveFile('front end/register_account.html', 'text/html',  res);
                break;
            case '/login':
                serveFile('front end/login_account.html', 'text/html',  res);
                break;
            default:
                console.log("URL not found");
        }
    }else if(req.method==='POST'){
        if(req.url==='/register-form'){
            let data = '';
            req.on('data', chunk=>{
                data += chunk;
            });
            req.on('end', ()=>{ 
                console.log(data);
                let parsedData = querystring.parse(data);
                let name = parsedData['name'];
                let email = parsedData['email'];
                let pwd = parsedData['pwd'];
                let userData = `${name},${email},${pwd}\n`;
                fs.appendFile('user.txt', userData, 'utf-8',(err)=>{
                    if(err){
                        console.log(err);
                        res.statusCode = 400;
                        res.setHeader('content-type', 'text/plain');
                        res.end("Error on writing.");
                    }
                });
            });
            
            res.statusCode = 200;
            res.setHeader('content-type', 'text/plain');
            res.end("data succefully writed.");
        }else if(req.url==='/login-form'){
            let body = '';
        
            req.on('data', chunk => {
                body += chunk;  // Collect data chunks
            });
        
            req.on('end', () => {
                const parsedData = querystring.parse(body);
        
                let email = parsedData['email'];
                let pwd = parsedData['pwd'];
        
                console.log(`Email: ${email}, PWD: ${pwd}`);
        
                // Read the user data file to verify credentials
                fs.readFile('user.txt', 'utf8', (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Error reading user file');
                        return;
                    }
        
                    const users = data.split('\n');
        
                    let userFound = false;
                    for (let user of users) {
                        // Extract email and password from each line in the file
                        const [storedName, storedEmail, storedPwd] = user.split(',');
                        
                        // Verify if the entered email and password match a user in the file
                        if (storedEmail === email && storedPwd === pwd) {
                            userFound = true;
                            break;
                        }
                    }
        
                    // If user found, respond with success, else failure
                    if (userFound) {
                        fs.readFile('front end/atm.html', 'utf-8', (err, data)=>{
                            if(err){
                                res.statusCode = 400;
                                res.setHeader('content-type', 'text/plain');
                                res.end("Error loading file");
                            }else{
                                res.statusCode = 200;
                                res.setHeader('content-type', 'text/html');
                                res.end(data);
                            }
                        });
                    } else {
                        res.writeHead(401, { 'Location': '/login' });
                        res.end();
                    }
                });
            });
        }

    }
});

server.listen(3000, ()=>{
    console.log("Server running on http://localhost:3000");
});


