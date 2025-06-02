import { Request, RequestHandler, Response } from "express";
import { ProductoModel } from "../models/products.model";
import { CarritoProductoModel } from "../models/product_carts.model";
import { CarritoModel } from "../models/carts.model";
import { calcularPrecioFinal } from "../utils/calculates";

export const addProductToCart: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id_cliente, id_producto, cantidad } = req.body;

  console.log(id_cliente)
  try {
    // 1. Verificar si existe un carrito ACTIVO del cliente
    let carrito = await CarritoModel.findOne({
      where: { id_cliente, estado: "activo" },
    });
    console.log(carrito)
    // 2. Si no existe, crear uno
    if (!carrito) {
      carrito = await CarritoModel.create({
        id_cliente,
        estado: "activo",
      });
    }
    const idCarrito = carrito.get("id_carrito");

    const existente = await CarritoProductoModel.findOne({
      where: { id_carrito: idCarrito, id_producto },
    });
    if (existente) {
      res.status(400).json({ msg: "El producto ya está agregado al carrito" });
      return;
    }
    // 3. Buscar el producto
    const producto = await ProductoModel.findByPk(id_producto);
    if (!producto) {
      res.status(404).json({ msg: "Producto no encontrado" });
      return;
    }

    const stock = producto.get("stock") as number;

    // 4. Validar si hay suficiente stock
    if (stock < cantidad) {
      res
        .status(400)
        .json({ msg: "Stock insuficiente para agregar al carrito" });
      return;
    }

    // 5. Calcular precios (descuento e impuesto)
    const { precioConDescuento, impuesto, subtotal } = calcularPrecioFinal(
      producto,
      cantidad
    );

    // 6. Agregar producto al carrito
    const item = await CarritoProductoModel.create({
      id_carrito: carrito.get("id_carrito"),
      id_producto,
      cantidad,
      precio_unitario: precioConDescuento,
      impuesto,
      subtotal,
    });

    res.status(201).json({
      msg: "Producto agregado al carrito",
      item,
      id_carrito: carrito.get("id_carrito"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al agregar producto al carrito" });
  }
};

// 2. Listar productos del carrito
export const listCartProducts: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id_cliente } = req.params;

  try {
    const clienteId = parseInt(id_cliente);
    if (isNaN(clienteId)) {
      res.status(400).json({ msg: "ID de cliente inválido" });
      return;
    }

    // 1. Buscar carrito ACTIVO del cliente
    const carrito = await CarritoModel.findOne({
      where: { id_cliente: clienteId, estado: "activo" },
    });

    if (!carrito) {
      res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
      return;
    }

    const idCarrito = carrito.get("id_carrito");

    // 2. Buscar productos del carrito
    const carritoProductos = await CarritoProductoModel.findAll({
      where: { id_carrito: idCarrito },
    });

    // Obtener todos los id_producto para la consulta
    const idsProductos = carritoProductos.map((item) =>
      item.get("id_producto")
    );

    // 3. Buscar detalles de productos
    const productos = await ProductoModel.findAll({
      where: { id_producto: idsProductos },
    });

    // 4. Combinar datos
    const respuesta = carritoProductos.map((item) => {
      const producto = productos.find(
        (p) => p.get("id_producto") === item.get("id_producto")
      );
      return {
        ...item.toJSON(),
        producto: producto ? producto.toJSON() : null,
      };
    });

    res.json(respuesta);
  } catch (error) {
    console.error("Error al listar productos del carrito:", error);
    res.status(500).json({ msg: "Error al listar productos del carrito" });
  }
};

// 3. Eliminar un producto del carrito activo
export const removeProductFromCart: RequestHandler = async (req, res) => {
  const id_cliente = parseInt(req.params.id_cliente, 10);
  const id_producto = parseInt(req.params.id_producto, 10);
  try {
    // 1. Buscar carrito ACTIVO del cliente
    const carrito = await CarritoModel.findOne({
      where: { id_cliente, estado: "activo" },
    });

    if (!carrito) {
      res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
      return;
    }

    const idCarrito = carrito.get("id_carrito");

    // 2. Buscar el item en carrito_productos
    const item = await CarritoProductoModel.findOne({
      where: { id_carrito: idCarrito, id_producto },
    });

    if (!item) {
      res.status(404).json({ msg: "El producto no está en el carrito" });
      return;
    }

    // 3. Eliminar el item
    await item.destroy();

    res.json({ msg: "Producto eliminado del carrito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al eliminar producto del carrito" });
  }
};

/**
 * PUT /api/carts/update-product
 * Actualiza la cantidad de un producto en el carrito activo del cliente
 * Body: { id_cliente, id_producto, cantidad }
 */
export const updateCartProduct: RequestHandler = async (req, res) => {
  // Extraemos de params en lugar de body
  const id_cliente = parseInt(req.params.id_cliente, 10);
  const id_producto = parseInt(req.params.id_producto, 10);
  const cantidad = parseInt(req.params.cantidad, 10);
  try {
    // Verificar carrito activo
    const carrito = await CarritoModel.findOne({
      where: { id_cliente, estado: "activo" },
    });
    if (!carrito) {
      res.status(404).json({ msg: "Carrito no encontrado o ya confirmado" });
      return;
    }

    const idCarrito = carrito.get("id_carrito");

    // Buscar el item en carrito_productos
    const item = await CarritoProductoModel.findOne({
      where: { id_carrito: idCarrito, id_producto },
    });
    if (!item) {
      res.status(404).json({ msg: "El producto no está en el carrito" });
      return;
    }

    // 3️⃣ Buscar datos del producto original
    const producto = await ProductoModel.findByPk(id_producto);
    if (!producto) {
      res.status(404).json({ msg: "Producto no encontrado" });
      return;
    }

    const stock = producto.get("stock") as number;
    if (stock < cantidad) {
      res
        .status(400)
        .json({ msg: "Stock insuficiente para la cantidad solicitada" });
      return;
    }

    //  Recalcular precios con la nueva cantidad
    const { precioConDescuento, impuesto, subtotal } = calcularPrecioFinal(
      producto,
      cantidad
    );

    // 5️⃣ Actualizar el registro en carrito_productos
    await item.update({
      cantidad,
      precio_unitario: precioConDescuento,
      impuesto,
      subtotal,
    });

    res.json({
      msg: "Cantidad actualizada correctamente",
      item,
    });
    return;
  } catch (err) {
    console.error("Error al actualizar producto del carrito:", err);
    res.status(500).json({ msg: "Error interno al actualizar el carrito" });
    return;
  }
};
