const { Product, Category } = require("../models");

module.exports = {
  addProduct: async (req, res, next) => {
    try {
      const { name, description, categoryId, price, imageUrl, tag } = req.body;

      if (!name || !description || !categoryId || !price || !imageUrl || !tag) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "All fields must be filled",
        });
      }

      const categoryExist = await Category.findOne({
        where: {
          id: categoryId,
        },
      });

      if (!categoryExist) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Category not found",
        });
      }

      const productExist = await Product.findOne({
        where: {
          name,
        },
      });

      if (productExist) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Product already exist",
        });
      }

      const imageExtension = imageUrl.split(".").pop();
      const allowedExtension = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
      const isExtensionAllowed = allowedExtension.includes(imageExtension);

      if (!isExtensionAllowed) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Image extension must be jpg, jpeg, or png",
        });
      }

      const product = await Product.create({
        name,
        description,
        categoryId,
        price,
        imageUrl,
        tag,
      });

      res.status(200).json({
        code: 200,
        success: true,
        message: "Product has been added",
        data: {
          product,
        },
      });
    } catch (err) {
      next(err);
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const products = await Product.findAll({
        include: {
          model: Category,
          as: "category",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "categoryId"],
        },
      });

      res.status(200).json({
        code: 200,
        success: true,
        message: "Successfully get all products",
        data: {
          products,
        },
      });
    } catch (err) {
      next(err);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;

      const productExist = await Product.findOne({
        where: {
          id,
        },
      });

      if (!productExist) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Product not found",
        });
      }

      await Product.destroy({
        where: {
          id,
        },
      });

      res.status(200).json({
        code: 200,
        success: true,
        message: "Product has been deleted",
      });
    } catch (err) {
      next(err);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, categoryId, price, imageUrl } = req.body;

      if (!name || !description || !categoryId || !price || !imageUrl) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "All fields must be filled",
        });
      }

      const categoryExist = await Category.findOne({
        where: {
          id: categoryId,
        },
      });

      if (!categoryExist) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Category not found",
        });
      }

      const productExist = await Product.findOne({
        where: {
          id,
        },
      });

      if (!productExist) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Product not found",
        });
      }

      const imageExtension = imageUrl.split(".").pop();
      const allowedExtension = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
      const isExtensionAllowed = allowedExtension.includes(imageExtension);

      if (!isExtensionAllowed) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Image extension must be jpg, jpeg, or png",
        });
      }

      const product = await Product.update(
        {
          name,
          description,
          categoryId,
          price,
          imageUrl,
        },
        {
          where: {
            id,
          },
        }
      );

      const getProduct = await Product.findOne({
        where: {
          id,
        },
        include: {
          model: Category,
          as: "category",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "categoryId"],
        },
      });

      res.status(200).json({
        code: 200,
        success: true,
        message: "Product has been updated",
        data: {
          getProduct,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
