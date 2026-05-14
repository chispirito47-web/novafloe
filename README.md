# Novafloe — Catálogo (Supabase Edition)

Catálogo de Novafloe con base de datos en Supabase. Los cambios que hagas desde modo admin se publican **al instante** para todas tus clientas — sin pasar por nadie.

## Archivos

- `index.html` — la página
- `styles.css` — el diseño + animaciones
- `catalog.jsx` — el código (incluye conexión a Supabase)

## Subir a Vercel (primera vez)

### Opción GitHub (recomendado)

1. Sube los 3 archivos a un repo nuevo en [github.com](https://github.com) → `novafloe`
2. En [vercel.com](https://vercel.com) → "Add New Project" → conectas GitHub → eliges `novafloe` → **Deploy**
3. ⏳ ~30 segundos → te queda online en `novafloe.vercel.app`

## Acceder al modo admin

1. Abre tu URL en cualquier dispositivo
2. **Toca el logo "Novafloe" 5 veces seguidas** (en menos de 3 segundos)
3. Te pide email + contraseña
4. Ingresa con la cuenta que creaste en Supabase:
   - Email: `jsairias12@hotmail.com`
   - Contraseña: la que definiste

## Editar productos

Una vez en modo admin:

- ➕ **+ Producto** (barra negra arriba) → crear uno nuevo
- ✏️ Lapicito en cualquier producto → editar nombre, precio, talla, color, foto, etc.
- 📸 Subir foto del celular → se sube a Supabase Storage y queda online
- 🗑️ Botón rojo de basura → eliminar producto
- 🏷️ "Categorías" → renombrar Crunchies/Jeans/Conjuntos
- 🚪 Salir → cerrar sesión

**Todo se publica al instante.** No necesitas re-deploy ni nada.

## Cosas importantes

- Tu credencial admin la creaste en Supabase Authentication
- Las fotos se guardan en el bucket `product-photos` de Supabase
- Los productos viven en la tabla `products`
- Plan gratis de Supabase aguanta hasta ~500 MB de fotos (decenas de productos)

## Soporte

WhatsApp: +57 300 354 7932 · IG: @novafloe.col
