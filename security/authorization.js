module.exports = {
    autenticado: function(req,res,next){
        if(req.isAuthenticated()){
            return next()
        }
        //req.flash("error_msg","Você precisa realizar login!")
        //res.redirect("/form-login")
        res.status(401).render("pages/error",{error: "Você precisa realizar login!"})
    },
    admin: function(req,res,next){
        if(req.isAuthenticated() && req.user.role == "admin"){
            return next()
        }else if(!req.isAuthenticated()){
            //req.flash("error_msg","Você precisa realizar login!")
            res.status(401).render("pages/error",{error: "Você precisa realizar login!"})
        }else{
            //req.flash("error_msg","Você precisa ser um administrador!")
            res.status(401).render("pages/error",{error: "Você precisa ser um administrador!"})
        }
    },
    acessarProprioRecurso: function(req,res,next){
        if (req.isAuthenticated() && req.user.id == req.params.pessoaId){
            return next()
        } else if(req.isAuthenticated() && req.user.id != req.params.pessoaId){
            res.status(401).render("pages/error",{error:"Ops você não tem acesso a esse usuário"})
        }else{
            res.status(401).render("pages/errorRedLogin",{error:"Você precisa fazer login"})
        }

       
    }
}