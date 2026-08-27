"use client";

// MAQUETA: carrito 100% de mentira. Vive en localStorage del navegador,
// nunca habla con ningún servidor. Sirve solo para que la demo se sienta
// interactiva (agregar/quitar, ver el total cambiar) al mostrarla.
import { createContext, useContext, useEffect, useState } from "react";
import { Producto } from "./datos";

type LineaCarrito = {
  slug: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

type CarritoContexto = {
  lineas: LineaCarrito[];
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (slug: string) => void;
  cambiarCantidad: (slug: string, cantidad: number) => void;
  vaciar: () => void;
  total: number;
  totalArticulos: number;
  // true solo después de intentar leer localStorage -- una pantalla que
  // redirige "si el carrito está vacío" (como el checkout) debe esperar
  // a esto antes de decidir, si no, en la primera carga siempre ve
  // lineas=[] (localStorage todavía no se leyó) y redirige por error
  // aunque el carrito sí tenga cosas guardadas.
  listo: boolean;
};

const Contexto = createContext<CarritoContexto | null>(null);

const LLAVE = "biobackup_maqueta_carrito";

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(LLAVE);
      if (guardado) setLineas(JSON.parse(guardado));
    } catch {
      // localStorage puede fallar (modo privado, storage bloqueado) --
      // no pasa nada, el carrito simplemente empieza vacío.
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(LLAVE, JSON.stringify(lineas));
    } catch {
      // ver comentario de arriba
    }
  }, [lineas, cargado]);

  function agregar(producto: Producto, cantidad = 1) {
    setLineas((prev) => {
      const existe = prev.find((l) => l.slug === producto.slug);
      if (existe) {
        return prev.map((l) =>
          l.slug === producto.slug
            ? { ...l, cantidad: l.cantidad + cantidad }
            : l
        );
      }
      return [
        ...prev,
        {
          slug: producto.slug,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad,
        },
      ];
    });
  }

  function quitar(slug: string) {
    setLineas((prev) => prev.filter((l) => l.slug !== slug));
  }

  function cambiarCantidad(slug: string, cantidad: number) {
    if (cantidad <= 0) return quitar(slug);
    setLineas((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, cantidad } : l))
    );
  }

  function vaciar() {
    setLineas([]);
  }

  const total = lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0);
  const totalArticulos = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  return (
    <Contexto.Provider
      value={{
        lineas,
        agregar,
        quitar,
        cambiarCantidad,
        vaciar,
        total,
        totalArticulos,
        listo: cargado,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
