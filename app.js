const express = require("express")
const path = require('path')
const bodyParser = require("body-parser")
const nodemailer = require("nodemailer")
const { check, validationResult } = require('express-validator/check');

const app = express()

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, '/app/views'))

app.use(express.static(path.join(__dirname, '/app/public')))
app.use(bodyParser.urlencoded({extended: true}))

const port = process.env.PORT || 3000

const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
        user: 'carloswiebbelling@outlook.com',
        pass: 'The Password Here'               // Use another SNS
    }
})

var mailOptions = {
    from: 'carloswiebbelling@outlook.com',
    to: 'carloswiebbelling@outlook.com',
    subject: 'Portifolio message',
    text: 'null'
}

app.get("/", (req, res) => res.status(200).render("index", {result: 200, message: {}}))

app.get("*", (req, res) => res.render("index", {result: 404}))

app.post("/", [    
    check("name").isLength({min: 4}).withMessage("Seu nome precisa ter no mínimo 4 caracteres"),
    check("name").not().isEmpty().withMessage("É necessário especificar seu nome"),
    check('email').isEmail().withMessage("Expecifique um e-mail válido"),
    check("message").isLength({min: 15}).withMessage("Sua mensagem precisa conter no mínimo 15 caracteres!")
    ], (req, res) => {
        let errors = validationResult(req)

        let data = req.body

        if(!errors.isEmpty())
            return res.render("index", {result: {status: 400, message: errors.array(), data}});

        mailOptions.text = `Heey! Me chamo ${data.name}, meu e-mail é ${data.email}!\n\n${data.message}`

        transporter.sendMail(mailOptions, (error, info) => {
            if (error)
                res.render("index", {result: {status: 400, message: "Houveram erros no processamento da mensagem! Tente novamente"}})
            
            else 
                res.render("index", {result: {status: 201, message: "Mensagem enviada com sucesso!"}})
        })
})

app.listen(port, () => console.log(`Server On on port ${port}`))

/*
    200: Ok;
    201: Sucessfuly request and an new recourse has been created;
    400: Bad request;
    404: Not found;
*/