const User = require("../models/users");

exports.updateUser = (req , res )=>{
    const {name , address , email} = req.body
    User.findById(req.userId).then(userDoc=>{
        userDoc.updateOne({name: name, email: email , address : address}).then(result=>{
            res.status(200).json({
                message : 'user updated successfully',
                user :  {
                    id : req.userId,
                    name : name,
                    email : email,
                    address : address , 
                }
            })
        })
    })
}

exports.getAllUsers = (req,res)=>{
    User.find().then(usersDoc=>{
        res.status(200).json({
            users : usersDoc.map(user=> ({
                id : user.id,
                name  : user.name,
                email : user.email,
                address : user.address, 
                role : user.role || 'customer',
                invoices : user.invoices
            }) )
        })

    })
}