// src/controllers/product.controller.ts

import { Request, Response, RequestHandler } from "express";
import { ProductoModel } from "../models/products.model";
import { Op } from "sequelize";

/**
 * Metodo getProducts
 * Devuelve lista de todos los productos
 */
export const getProducts: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const list = await ProductoModel.findAll();
    if (list.length > 0) {
      res.json(list);
    } else {
      res.status(404).json({
        msg: "No se ha encontrado ningún producto",
      });
    }
  } catch (error) {
    console.error("Error al obtener lista de productos:", error);
    res.status(500).json({
      msg: "Error al obtener lista de productos",
    });
  }
};

/**
 * Metodo getProductById
 * Devuelve un producto por su ID
 */
export const getProductById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const product = await ProductoModel.findByPk(id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({
        msg: `No existe un producto con el id: ${id}`,
      });
    }
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    res.status(500).json({
      msg: "Error al obtener el producto",
    });
  }
};

/**
 * Metodo postProduct
 * Crea un nuevo producto
 */
export const postProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { codigo, nombre, categoria, precio, stock, temporada, img } =
      req.body;

    // Validar campos obligatorios
    if (
      !codigo ||
      !nombre ||
      !categoria ||
      precio == null ||
      stock == null ||
      !temporada
    ) {
      res.status(400).json({
        msg: "Faltan datos obligatorios: código, nombre, categoría, precio, stock o temporada",
      });
    }

    // Verificar unicidad de código
    const exists = await ProductoModel.findOne({ where: { codigo } });
    if (exists) {
      res.status(400).json({
        msg: `El código ${codigo} ya está registrado`,
      });
    }

    const newProduct = await ProductoModel.create({
      codigo,
      nombre,
      categoria,
      precio,
      stock,
      temporada,
      img,
    });

    res.status(201).json({
      msg: "Producto creado correctamente",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error al registrar producto:", error);
    res.status(500).json({
      msg: "Error al registrar producto",
    });
  }
};

/**
 * Metodo updateProduct
 * Actualiza un producto existente
 */
export const updateProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { codigo, nombre, categoria, precio, stock, temporada, img } = req.body;

  try {
    const product = await ProductoModel.findByPk(id);
    if (!product) {
      res.status(404).json({
        msg: `No existe un producto con id: ${id}`,
      });
      return;
    }

    // Si cambia el código, verificar que no choque con otro
    if (codigo && codigo !== product.get("codigo")) {
      const codeExists = await ProductoModel.findOne({ where: { codigo } });
      if (codeExists) {
        res.status(400).json({
          msg: `El código ${codigo} ya está registrado en otro producto`,
        });
      }
    }

    await product.update({
      codigo: codigo ?? product.get("codigo"),
      nombre: nombre ?? product.get("nombre"),
      categoria: categoria ?? product.get("categoria"),
      precio: precio ?? product.get("precio"),
      stock: stock ?? product.get("stock"),
      temporada: temporada ?? product.get("temporada"),
      img: img ?? product.get("img"),
      // creado_en no lo tocamos
    });

    res.json({
      msg: "Producto actualizado correctamente",
      product,
    });
  } catch (error) {
    console.error(`Error al actualizar producto ${id}:`, error);
    res.status(500).json({
      msg: "Error al actualizar producto",
    });
  }
};

/**
 * Metodo deleteProduct
 * Elimina físicamente un producto
 */
export const deleteProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const deletedCount = await ProductoModel.destroy({
      where: { id_producto: id },
    });
    if (deletedCount === 0) {
      res.status(404).json({
        msg: `No existe un producto con id: ${id}`,
      });
    }
    res.json({
      msg: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(`Error al eliminar producto ${id}:`, error);
    res.status(500).json({
      msg: "Error al eliminar producto",
    });
  }
};
