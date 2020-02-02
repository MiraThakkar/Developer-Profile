const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const util = require("util");
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const readFile = util.promisify(fs.readFile);
var html = "";
var pdfname = "";
var gitStars = 0;

const writeFileAsync = util.promisify(fs.writeFile);

//function  prompts user to enter github username and favorite color

function promptUser (){

return inquirer
  .prompt([
    {
        message: "Enter your GitHub username",
        name: "username"
    },

    {
        message: "Enter your favorite color",
        name: "color"
    }
  ]);

} 

//axios calls user's github profile
async function getUser (answers){
   try{
        const queryUrl =  `https://api.github.com/users/${answers.username}`;
        const starURL= `https://api.github.com/users/${answers.username}/starred`;
        const response = await axios.get(queryUrl);
        const userStars = await axios.get(starURL);
        gitStars = userStars.data.length;
        return  response.data;


    }catch (err){
        console.log("Github username was not found. Please try again!", err);

    }
   
}
  
//generateHTML generates html user profile template 

function generateHTML(userinfo, answers) {

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        
        <title>Profile Generator</title>
    </head>
    <body>

    
    
    <div class="container-fluid mt-2" style="background-color: ${answers.color};">
        <div class = "row">
            <div class= "col-md-12 mt-3 my-4" style= "background-color: #404554; color: white; box-shadow: 5px 10px 18px #888888; padding: 0px 15px;">  
                <h2 class="display-4 text-center mt-3">Name: ${userinfo.name}</h2>
                <hr class="my-4">
            </div>
        </div> 
        <div class="row">
            <div class="col-md-12">
            <div class="card card-inverse" style= "border-color: white">
                <div class="card-block mt-2">
                    <div class="row">
                        <div class="col-md-4 col-sm-6 text-center" style = "color:gray">
                            <img src= ${userinfo.avatar_url} alt="" class="btn-md" style = "border-radius: 50%; height: 40%">
                            <br>
                            <br>
                            <h3 class="card-title">Username: ${userinfo.login}</h3>
                        
                            <p class="card-text">
                                <a href = 'https://www.google.com/maps/place/${userinfo.location}'><i class="fa fa-map-marker" aria-hidden="true"><span> <strong>Location: </strong>${userinfo.location}</span></i></a> <br>
                                <a href = '${userinfo.html_url}'>                 <i class="fa fa-github" aria-hidden="false">    <span> Github   </span></i></a> <br>
                                <a href = 'https://github.blog/${userinfo.login}'><i class="fa fa-newspaper-o"  aria-hidden="false">    <span> Blog     </span></i></a>
                            </p>
                                
                        </div>         
                        <div class="col-md-8 col-sm-6 text-center">
                            <br>
                            <p class="lead text-center">${userinfo.bio}!</p>
                            <br>
                            <br>
                            <div class = "row">
                                <div class= "col-md-6"> 
                                    <div class="card card-inverse card-info mb-3 text-center" style="background-color:  #404554; color:  white;  border-radius: 10px; box-shadow: 5px 10px 18px #888888;">
                                        <div class="card-block">
                                            <h2 id = "git-repo"><strong> ${userinfo.public_repos} </strong></h2>                    
                                            <p><small>Public Repository</small></p>
                                            <!-- <button class="btn btn-primary btn-block btn-md"><span class="fa fa-facebook-square"></span> Like  </button> -->
                                        </div>
                                    </div>
                                    <div class="card card-inverse card-warning mb-3 text-center" style="background-color: #404554; color:  white;  border-radius: 10px; box-shadow: 5px 10px 18px #888888;">
                                        <div class="card-block">
                                            <h2 id = "git-follow"><strong>${userinfo.following}</strong></h2>                    
                                            <p><small>Following</small></p>
                                            <!-- <button class="btn btn-success btn-block btn-md"><span class="fa fa-twitter-square"></span> Tweet </button> -->
                                        </div>
                                    </div>
                                </div>
    
                                <div class = "col-md-6"> 
                                    <div class="card card-inverse card-info mb-3 text-center" style="background-color: #404554; color:  white;  border-radius: 10px; box-shadow: 5px 10px 18px #888888;">
                                        <div class="card-block">
                                            <h2 id = "git-stars"><strong> ${gitStars} </strong></h2>                    
                                            <p><small>Git Stars</small></p>
                                            <!-- <button class="btn btn-primary btn-block btn-md"><span class="fa fa-facebook-square"></span> Like  </button> -->
                                        </div>
                                    </div>
                                    <div class="card card-inverse card-warning mb-3 text-center"style="background-color: #404554; color:  white;  border-radius: 10px; box-shadow: 5px 10px 18px #888888;">
                                        <div class="card-block">
                                            <h2 id = "git-follower"><strong>${userinfo.followers}</strong></h2>                    
                                            <p><small>Followers</small></p>
                                            <!-- <button class="btn btn-success btn-block btn-md"><span class="fa fa-twitter-square"></span> Tweet </button> -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</div>
              
</body>
</html>`;
}

//init function synchronize the function to generate html page.
  
async function init() {
    try {
        const answers = await promptUser();
        const userinfo =  await getUser(answers);
        if (userinfo.bio == null){
            userinfo.bio = "Welcome to my page!!";
        }
        html =  await generateHTML(userinfo, answers);
        pdfname = answers.username;
        pdf();
        await writeFileAsync("Devprofile.html", html);
        console.log("Generated pdf successfully.");
    } catch(err) {
      console.log("Error from init: ", err);
    }
}

init();

//function converts html to pdf and saves as username.pdf
  
async function pdf() {

    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html);
        await page.emulateMedia('screen');
        console.log("Saved pdf successfully.");
        await page.pdf({
            path: pdfname + '.pdf', 
            format: 'A4',
            printBackground: true,
        });
        console.log('done');
        await browser.close();
        process.exit();

    } catch (e) {
        console.log("Please try closing the pdf file if it is open.");
        console.log("This is the error from generate pdf function:", e);
    }

}

