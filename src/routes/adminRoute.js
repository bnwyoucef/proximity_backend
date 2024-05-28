const router = require('express').Router();
router.get('/admin/:id', verifyToken, CategoryController.getCategoryByStoreCategoryId);
router.post('/admin/', verifyToken, CategoryController.getCategoryByStoreCategoryIds);