import { RequestHandler } from "express";
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
    const { codigo, nombre, categoria, precio, stock, temporada } = req.body;

    if (!codigo || !nombre || !categoria || precio == null || stock == null || !temporada) {
      res.status(400).json({
        msg: "Faltan datos obligatorios",
      });
      return;
    }

    const exists = await Producto.findOne({ codigo });
    if (exists) {
      res.status(400).json({ msg: `El código ${codigo} ya está registrado` });
      return;
    }

    let imgPath = undefined;
    if (req.file) {
      imgPath = req.file.filename; // Solo el nombre del archivo
    }
      // Verificar unicidad de código
    const newProduct = new Producto({
      codigo,
      nombre,
      categoria,
      precio,
      stock,
      temporada,
      img: imgPath,
      creado_en: new Date(),
    });

    await newProduct.save();

    res.status(201).json({
      msg: "Producto creado correctamente",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error al registrar producto:", error);
    res.status(500).json({ msg: "Error al registrar producto" });
  }
};

/**
 * Metodo updateProduct
 * Actualiza un producto existente
 */
export const updateProduct: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Producto.findById(id);
    if (!product) {
      res.status(404).json({
        msg: `No existe un producto con id: ${id}`,
      });
      return;
    }

    const { codigo, nombre, categoria, temporada } = req.body;
    const precio = req.body.precio !== undefined ? parseFloat(req.body.precio) : undefined;
    const stock = req.body.stock !== undefined ? parseInt(req.body.stock, 10) : undefined;

    if ((precio !== undefined && isNaN(precio)) || (stock !== undefined && isNaN(stock))) {
      res.status(400).json({ msg: "Precio o stock inválidos" });
      return;
    }

    if (codigo && codigo !== product.codigo) {
      const codeExists = await Producto.findOne({ codigo });
      if (codeExists) {
        res.status(400).json({ msg: `El código ${codigo} ya está registrado` });
        return;
      }
    }

    if (codigo !== undefined) product.codigo = codigo;
    if (nombre !== undefined) product.nombre = nombre;
    if (categoria !== undefined) product.categoria = categoria;
    if (precio !== undefined) product.precio = precio;
    if (stock !== undefined) product.stock = stock;
    if (temporada !== undefined) product.temporada = temporada;

      if (req.file) {
      product.img = req.file.filename; // Solo el nombre del archivo
    }
    await product.save();

    res.json({
      msg: "Producto actualizado correctamente",
      product,
    });
  } catch (error) {
    console.error(`Error al actualizar producto ${id}:`, error);
    res.status(500).json({ msg: "Error al actualizar producto" });
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