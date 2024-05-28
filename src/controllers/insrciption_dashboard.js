// POUR LE DASHBOARD

const express =require ('express')
var dashboardService = require('../services/dashboardService');
exports.inscription = async (req, res) => {

// RECUPERER LES DONNEES
const {body}=req
console.log(body)
res.json(body)

	
};
