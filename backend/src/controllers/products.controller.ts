import { Request, Response, RequestHandler } from "express";
import { Producto } from "../models/products.model";

/**
 * Metodo getProducts
 * Devuelve lista de todos los productos
 */
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const list = await Producto.find();
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
export const getProductById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Producto.findById(id);
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
export const postProduct: RequestHandler = async (req, res) => {
  try {
    const { codigo, nombre, categoria, precio, stock, temporada, img } = req.body;

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
      return;
    }

    // Verificar unicidad de código
    const exists = await Producto.findOne({ codigo });
    if (exists) {
       res.status(400).json({
        msg: `El código ${codigo} ya está registrado`,
      });
      return;
    }

    const newProduct = new Producto({
      codigo,
      nombre,
      categoria,
      precio,
      stock,
      temporada,
      img,
      creado_en: new Date(),
    });

    await newProduct.save();

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
export const updateProduct: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, categoria, precio, stock, temporada, img } = req.body;

  try {
    const product = await Producto.findById(id);
    if (!product) {
       res.status(404).json({
        msg: `No existe un producto con id: ${id}`,
      });
      return;
    }

    // Si cambia el código, verificar que no choque con otro
    if (codigo && codigo !== product.codigo) {
      const codeExists = await Producto.findOne({ codigo });
      if (codeExists) {
         res.status(400).json({
          msg: `El código ${codigo} ya está registrado en otro producto`,
        });
        return;
      }
    }

    product.codigo = codigo ?? product.codigo;
    product.nombre = nombre ?? product.nombre;
    product.categoria = categoria ?? product.categoria;
    product.precio = precio ?? product.precio;
    product.stock = stock ?? product.stock;
    product.temporada = temporada ?? product.temporada;
    product.img = img ?? product.img;

    await product.save();

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
export const deleteProduct: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Producto.findByIdAndDelete(id);
    if (!deleted) {
     res.status(404).json({
        msg: `No existe un producto con id: ${id}`,
      });
      return;
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