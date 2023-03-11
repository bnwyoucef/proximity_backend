const { Schema, model } = require('mongoose');

exports.policySchema = new Schema(
	{
        pickup: { 
            timeLimit : { type: Number  , required : true} , 
        },
        delivery: {
            zone : {
                centerPoint : {
                    latitude : { type : Number , required : true } , 
                    longitude : { type : Number , required : true } , 
                } , 
                raduis : { type : Number , required : true } , 
            } ,
            pricing : {
                fixe : {type : Number , required : true , default : null} ,
                km : {type : Number , required : true , default : null} ,
            } ,
        },
        reservation : {
            duration : {type : Number , required : true , default : null} ,
            payment : {
                free : {type : Boolean , required : true , default : null} ,
                partial : { 
                    fixe : {type : Number , required : true , default : null} ,
                    percentage : {type : Number , required : true , default : null} ,
                } ,
                total : {type : Boolean , required : true , default : null} ,
            } ,
            cancelation : {
                restrictions : {
                    fixe : {type : Number , required : true , default : null} ,
                    percentage : {type : Number , required : true , default : null} ,
                }
            } ,
        } , 
        return : {
            duration : {type : Number , required : true , default : null} ,
            productStatus : {type : String , required : true , default : ""} ,
            returnMethod : {type : String , required : true , default : ""} ,
            refund : {
                order : {
                    fixe : {type : Number , required : true , default : null} ,
                    percentage : {type : Number , required : true , default : null} ,
                } , 
                shipping : {
                    fixe : {type : Number , required : true , default : null} ,
                    percentage : {type : Number , required : true , default : null} ,
                },
            } , 

        } , 
        order : {
            validation : {
                auto :{type : Boolean , required : true , default : null} , 
                manual :{type : Boolean , required : true , default : null} , 
            } ,
            notification : {
                realtime :{type : Boolean , required : true , default : null} , 
                time :{type : Number , required : true , default : null} , 
                perOrdersNbr :{type : Number , required : true , default : null} , 
                sendMode : {
                    mail :{type : Boolean , required : true , default : null} , 
                    sms :{type : Boolean , required : true , default : null} , 
                    popup :{type : Boolean , required : true , default : null} , 
                    vibration :{type : Boolean , required : true , default : null} , 
                    ringing :{type : Boolean , required : true , default : null} , 
                } ,
            } 

        } ,
    },
	{
        
	}
);
